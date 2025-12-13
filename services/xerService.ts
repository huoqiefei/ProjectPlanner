
import { ProjectData, Activity, WBSNode, Resource, Assignment, Calendar, ConstraintType, ImportSummary } from '../types';

// XER Parsing Helpers
const splitLine = (line: string) => line.split('\t');

interface XerTable {
    name: string;
    fields: string[];
    rows: Record<string, string>[];
}

const parseXerDate = (xerDate: string): Date | undefined => {
    if (!xerDate) return undefined;
    const d = new Date(xerDate);
    if(isNaN(d.getTime())) return undefined;
    return d;
};

// Map P6 Relationship Types to App Types
const mapRelType = (p6Type: string): 'FS' | 'SS' | 'FF' | 'SF' => {
    if (p6Type === 'PR_SS') return 'SS';
    if (p6Type === 'PR_FF') return 'FF';
    if (p6Type === 'PR_SF') return 'SF';
    return 'FS'; // Default PR_FS
};

// Map P6 Constraint Types
const mapConstraintType = (p6Type: string): ConstraintType => {
    switch(p6Type) {
        case 'CST_StartOn': return 'Start On';
        case 'CST_StartOnOrAfter': return 'Start On or After';
        case 'CST_StartOnOrBefore': return 'Start On or Before';
        case 'CST_FinishOn': return 'Finish On';
        case 'CST_FinishOnOrAfter': return 'Finish On or After';
        case 'CST_FinishOnOrBefore': return 'Finish On or Before';
        case 'CST_MandStart': return 'Mandatory Start';
        case 'CST_MandFin': return 'Mandatory Finish';
        default: return 'None';
    }
};

export const parseXerFile = async (file: File): Promise<{ data: ProjectData, summary: ImportSummary }> => {
    const buffer = await file.arrayBuffer();
    let text = '';
    
    // Encoding Handling
    try {
        const decoder = new TextDecoder('utf-8', { fatal: true });
        text = decoder.decode(buffer);
    } catch (e) {
        try {
            const decoder = new TextDecoder('gbk');
            text = decoder.decode(buffer);
        } catch (e2) {
            const decoder = new TextDecoder('windows-1252');
            text = decoder.decode(buffer);
        }
    }

    const lines = text.split(/\r?\n/);
    
    const tables: Record<string, XerTable> = {};
    let currentTable: XerTable | null = null;

    // Parse Raw Data
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

    // Extract Tables
    const projectTable = tables['PROJECT']?.rows[0];
    const wbsTable = tables['PROJWBS']?.rows || [];
    const taskTable = tables['TASK']?.rows || [];
    const predTable = tables['TASKPRED']?.rows || [];
    const rsrcTable = tables['RSRC']?.rows || [];
    const taskRsrcTable = tables['TASKRSRC']?.rows || [];
    const calendarTable = tables['CALENDAR']?.rows || [];

    const summary: ImportSummary = {
        fileName: file.name,
        projectTitle: projectTable?.proj_short_name || 'Imported Project',
        wbsCount: 0,
        activityCount: 0,
        resourceCount: 0,
        calendarCount: 0,
        relationshipCount: 0,
        success: true
    };

    // 1. Convert Calendars
    // P6 Calendars are complex. We will map the ID and Name, but default to Standard settings 
    // as parsing P6 blob data for specific hours/exceptions is out of scope for this lightweight parser.
    const calendars: Calendar[] = [];
    const calendarIdMap = new Map<string, string>(); // p6_clndr_id -> app_calendar_id
    
    if (calendarTable.length > 0) {
        calendarTable.forEach(row => {
             // Create a new ID to ensure uniqueness or use internal if clean
             const p6Id = row.clndr_id;
             const name = row.clndr_name;
             const isDefault = row.default_flag === 'Y';
             
             // Simple logic: If name contains "6" or "7", maybe assume 6 or 7 day week, else 5.
             // This is heuristic.
             let weekDays = [false, true, true, true, true, true, false]; // Default 5 day
             if (name.includes('6') || name.includes('Six')) weekDays = [false, true, true, true, true, true, true];
             if (name.includes('7') || name.includes('Seven')) weekDays = [true, true, true, true, true, true, true];

             const newCal: Calendar = {
                 id: `CAL-${p6Id}`,
                 name: name,
                 isDefault: false, // Will set project default later
                 weekDays: weekDays,
                 hoursPerDay: 8,
                 exceptions: []
             };
             calendars.push(newCal);
             calendarIdMap.set(p6Id, newCal.id);
        });
    } else {
        // Fallback default
        calendars.push({ id: 'default', name: 'Standard 5-Day', isDefault: true, weekDays: [false, true, true, true, true, true, false], hoursPerDay: 8, exceptions: [] });
    }
    
    // Set Default Calendar
    let defaultCalId = 'default';
    if (projectTable && projectTable.def_clndr_id) {
        const mapped = calendarIdMap.get(projectTable.def_clndr_id);
        if (mapped) {
            defaultCalId = mapped;
            const cal = calendars.find(c => c.id === mapped);
            if(cal) cal.isDefault = true;
        }
    } else if (calendars.length > 0) {
        calendars[0].isDefault = true;
        defaultCalId = calendars[0].id;
    }

    summary.calendarCount = calendars.length;

    // 2. Convert WBS
    const wbsNodes: WBSNode[] = [];
    const rootWbs = wbsTable.find(r => r.proj_node_flag === 'Y' && r.proj_id === projectTable?.proj_id);
    
    const processWbsNode = (row: any, parentId: string | null) => {
        const id = row.wbs_id;
        const name = row.wbs_name;
        wbsNodes.push({ id, name, parentId });
        const children = wbsTable.filter(r => r.parent_wbs_id === row.wbs_id && r.proj_id === projectTable?.proj_id);
        children.forEach(child => processWbsNode(child, id));
    };

    if (rootWbs) {
        processWbsNode(rootWbs, null);
    } else if (wbsTable.length > 0) {
        processWbsNode(wbsTable[0], null);
    } else {
        wbsNodes.push({ id: 'WBS.1', name: 'Project Root', parentId: null });
    }
    summary.wbsCount = wbsNodes.length;

    // 3. Convert Activities
    const taskIdMap = new Map<string, string>(); // internal_id -> task_code
    
    const activities: Activity[] = taskTable.filter(r => r.proj_id === projectTable?.proj_id).map(row => {
        const id = row.task_code;
        taskIdMap.set(row.task_id, id);
        const durationHrs = parseFloat(row.target_drtn_hr_cnt || '0');
        const duration = Math.round(durationHrs / 8); 

        // Constraint
        const constraintType = mapConstraintType(row.task_control_type_code);
        let constraintDate: Date | undefined = undefined;
        if (constraintType !== 'None') {
             if (constraintType.includes('Start')) {
                 constraintDate = parseXerDate(row.target_start_date);
             } else {
                 constraintDate = parseXerDate(row.target_end_date) || parseXerDate(row.target_start_date);
             }
        }

        // Map Calendar
        let calId = defaultCalId;
        if (row.clndr_id && calendarIdMap.has(row.clndr_id)) {
            calId = calendarIdMap.get(row.clndr_id)!;
        }

        return {
            id: id,
            name: row.task_name,
            wbsId: row.wbs_id,
            activityType: row.task_type === 'TT_Mile' ? 'Finish Milestone' : (row.task_type === 'TT_LOE' ? 'Task' : 'Task'), 
            duration: duration,
            calendarId: calId, 
            startDate: parseXerDate(row.target_start_date || row.act_start_date) || new Date(),
            endDate: parseXerDate(row.target_end_date || row.act_end_date) || new Date(),
            predecessors: [],
            budgetedCost: parseFloat(row.target_cost || '0'),
            constraintType: constraintType,
            constraintDate: constraintDate,
            earlyStart: new Date(), earlyFinish: new Date(),
            lateStart: new Date(), lateFinish: new Date(),
            totalFloat: parseFloat(row.total_float_hr_cnt || '0') / 8,
            isCritical: (row.status_code === 'TK_Active' || row.status_code === 'TK_NotStart') && parseFloat(row.total_float_hr_cnt || '0') <= 0
        };
    });
    summary.activityCount = activities.length;

    // 4. Convert Logic
    predTable.forEach(row => {
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
                summary.relationshipCount++;
            }
        }
    });

    // 5. Convert Resources
    const rsrcIdMap = new Map<string, string>();
    const resources: Resource[] = rsrcTable.map(row => {
        // Clean ID (remove spaces)
        const id = (row.rsrc_short_name || row.rsrc_name || 'R').trim(); 
        rsrcIdMap.set(row.rsrc_id, id);
        
        return {
            id: id,
            name: row.rsrc_name,
            type: row.rsrc_type === 'RT_Labor' ? 'Labor' : (row.rsrc_type === 'RT_Mat' ? 'Material' : 'Equipment'),
            unit: row.unit_id || 'hr',
            maxUnits: parseFloat(row.target_qty_per_hr || '0') > 0 ? parseFloat(row.target_qty_per_hr) * 8 : 8
        };
    });
    summary.resourceCount = resources.length;

    // 6. Convert Assignments
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

    // 7. Construct Result
    const projStartDate = projectTable?.plan_start_date ? parseXerDate(projectTable.plan_start_date) : new Date();

    const data: ProjectData = {
        meta: {
            title: projectTable?.proj_short_name || 'Imported Project',
            projectCode: projectTable?.proj_short_name || 'XER-IMP',
            projectStartDate: projStartDate ? projStartDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            defaultCalendarId: defaultCalId,
            activityIdPrefix: 'A',
            activityIdIncrement: 10,
            resourceIdPrefix: 'R',
            resourceIdIncrement: 10
        },
        wbs: wbsNodes,
        activities: activities,
        resources: resources,
        assignments: assignments,
        calendars: calendars
    };

    return { data, summary };
};
