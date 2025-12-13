
import { ProjectData, Activity, WBSNode, Resource, Assignment, Calendar, Predecessor } from '../types';

// XER Parsing Helpers
const splitLine = (line: string) => line.split('\t');

interface XerTable {
    name: string;
    fields: string[];
    rows: Record<string, string>[];
}

const parseXerDate = (xerDate: string): Date => {
    if (!xerDate) return new Date();
    // XER dates typically: 2023-10-30 08:00:00 or similar
    return new Date(xerDate);
};

// Map P6 Relationship Types to App Types
const mapRelType = (p6Type: string): 'FS' | 'SS' | 'FF' | 'SF' => {
    // P6 types: PR_FS, PR_SS, PR_FF, PR_SF
    if (p6Type === 'PR_SS') return 'SS';
    if (p6Type === 'PR_FF') return 'FF';
    if (p6Type === 'PR_SF') return 'SF';
    return 'FS'; // Default PR_FS
};

export const parseXerFile = async (file: File): Promise<ProjectData> => {
    const text = await file.text();
    const lines = text.split(/\r?\n/);
    
    const tables: Record<string, XerTable> = {};
    let currentTable: XerTable | null = null;

    // 1. Parse Raw Data into Tables
    for (const line of lines) {
        if (line.startsWith('%T')) {
            const tableName = splitLine(line)[1].trim();
            currentTable = { name: tableName, fields: [], rows: [] };
            tables[tableName] = currentTable;
        } else if (line.startsWith('%F') && currentTable) {
            currentTable.fields = splitLine(line).slice(1);
        } else if (line.startsWith('%R') && currentTable) {
            const values = splitLine(line).slice(1);
            const row: Record<string, string> = {};
            currentTable.fields.forEach((field, index) => {
                row[field] = values[index];
            });
            currentTable.rows.push(row);
        }
    }

    // 2. Extract Key Data (Using defaults if tables missing)
    const projectTable = tables['PROJECT']?.rows[0];
    const wbsTable = tables['PROJWBS']?.rows || [];
    const taskTable = tables['TASK']?.rows || [];
    const predTable = tables['TASKPRED']?.rows || [];
    const rsrcTable = tables['RSRC']?.rows || [];
    const taskRsrcTable = tables['TASKRSRC']?.rows || [];

    // 3. Convert WBS
    // P6 WBS Hierarchy: proj_node_flag='Y' is root. parent_wbs_id links them.
    const wbsMap = new Map<string, string>(); // Internal ID -> Display ID (or generated)
    const wbsNodes: WBSNode[] = [];

    // Find Project Root in WBS
    const rootWbs = wbsTable.find(r => r.proj_node_flag === 'Y' && r.proj_id === projectTable?.proj_id);
    
    // Helper to build hierarchy
    const processWbsNode = (row: any, parentId: string | null) => {
        // P6 wbs_id is an integer (e.g. 12345), we need string IDs.
        // We use the wbs_id as the key for mapping, but formatted for display if possible?
        // Let's use the internal wbs_id as our app's ID to ensure uniqueness, 
        // but name it using wbs_short_name if available.
        const id = row.wbs_id;
        const name = row.wbs_name;
        
        wbsNodes.push({ id, name, parentId });
        
        // Find children
        const children = wbsTable.filter(r => r.parent_wbs_id === row.wbs_id && r.proj_id === projectTable?.proj_id);
        children.forEach(child => processWbsNode(child, id));
    };

    if (rootWbs) {
        processWbsNode(rootWbs, null);
    } else if (wbsTable.length > 0) {
        // Fallback if structure is weird, just take the first one as root
        processWbsNode(wbsTable[0], null);
    } else {
        // No WBS? Create a dummy one
        wbsNodes.push({ id: 'WBS.1', name: 'Project Root', parentId: null });
    }

    // 4. Convert Activities
    // Map internal task_id to task_code (which is the user facing ID like "A1000")
    const taskIdMap = new Map<string, string>(); // internal_id -> task_code
    
    const activities: Activity[] = taskTable.filter(r => r.proj_id === projectTable?.proj_id).map(row => {
        const id = row.task_code;
        taskIdMap.set(row.task_id, id);

        const durationHrs = parseFloat(row.target_drtn_hr_cnt || '0');
        const duration = Math.round(durationHrs / 8); // Assume 8h days for now

        return {
            id: id,
            name: row.task_name,
            wbsId: row.wbs_id, // Links to WBS internal ID above
            activityType: row.task_type === 'TT_Mile' ? 'Finish Milestone' : 'Task', // Simplified mapping
            duration: duration,
            calendarId: 'default', // P6 calendars are complex, defaulting for MVP
            startDate: parseXerDate(row.target_start_date || row.act_start_date),
            endDate: parseXerDate(row.target_end_date || row.act_end_date),
            predecessors: [], // Fill later
            budgetedCost: parseFloat(row.target_cost || '0'),
            // Calculated fields defaults
            earlyStart: new Date(), earlyFinish: new Date(),
            lateStart: new Date(), lateFinish: new Date(),
            totalFloat: parseFloat(row.total_float_hr_cnt || '0') / 8,
            isCritical: (row.status_code === 'TK_Active' || row.status_code === 'TK_NotStart') && parseFloat(row.total_float_hr_cnt || '0') <= 0
        };
    });

    // 5. Convert Logic (Predecessors)
    predTable.forEach(row => {
        // Only map if both tasks exist in this project
        const succId = taskIdMap.get(row.task_id);
        const predId = taskIdMap.get(row.pred_task_id);
        
        if (succId && predId) {
            const act = activities.find(a => a.id === succId);
            if (act) {
                act.predecessors.push({
                    activityId: predId,
                    type: mapRelType(row.pred_type),
                    lag: Math.round(parseFloat(row.lag_hr_cnt || '0') / 8)
                });
            }
        }
    });

    // 6. Convert Resources
    // P6 rsrc_id is internal. rsrc_short_name is code.
    const rsrcIdMap = new Map<string, string>();
    const resources: Resource[] = rsrcTable.map(row => {
        const id = row.rsrc_short_name;
        rsrcIdMap.set(row.rsrc_id, id);
        return {
            id: id,
            name: row.rsrc_name,
            type: row.rsrc_type === 'RT_Labor' ? 'Labor' : (row.rsrc_type === 'RT_Mat' ? 'Material' : 'Equipment'),
            unit: row.unit_id || 'hr',
            maxUnits: parseFloat(row.target_qty_per_hr || '1') * 8 // Approximate max/day
        };
    });

    // 7. Convert Assignments
    const assignments: Assignment[] = [];
    taskRsrcTable.forEach(row => {
        const actId = taskIdMap.get(row.task_id);
        const resId = rsrcIdMap.get(row.rsrc_id);
        
        if (actId && resId) {
            assignments.push({
                activityId: actId,
                resourceId: resId,
                units: parseFloat(row.target_qty || '0')
            });
        }
    });

    // 8. Construct Result
    return {
        meta: {
            title: projectTable?.proj_short_name || 'Imported Project',
            projectCode: projectTable?.proj_short_name || 'XER-IMP',
            projectStartDate: projectTable?.plan_start_date ? parseXerDate(projectTable.plan_start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            defaultCalendarId: 'default',
            activityIdPrefix: 'A',
            activityIdIncrement: 10,
            resourceIdPrefix: 'R',
            resourceIdIncrement: 10
        },
        wbs: wbsNodes,
        activities: activities,
        resources: resources,
        assignments: assignments,
        calendars: [{ id: 'default', name: 'Standard 5-Day', isDefault: true, weekDays: [false, true, true, true, true, true, false], hoursPerDay: 8, exceptions: [] }]
    };
};
