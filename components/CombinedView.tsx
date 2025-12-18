
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { ProjectData, Activity, UserSettings, Predecessor } from '../types';
import GanttChart from './GanttChart';
import { useTranslation } from '../utils/i18n';

const HEADER_HEIGHT = 50;

interface CombinedViewProps {
    projectData: ProjectData;
    schedule: Activity[];
    wbsMap: Record<string, { startDate: Date; endDate: Date; duration: number }>;
    onUpdate: (id: string, field: string, val: any) => void;
    selectedIds: string[];
    onSelect: (ids: string[], multi: boolean) => void;
    onCtx: (data: any) => void;
    userSettings: UserSettings;
    zoomLevel: 'day' | 'week' | 'month' | 'quarter' | 'year';
    onZoomChange: (z: any) => void;
    onDeleteItems: (ids: string[]) => void;
    showRelations: boolean;
    showCritical: boolean;
}

const formatDate = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return '-';
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const ResizableHeader: React.FC<{ 
    width: number, 
    onResize: (w: number) => void, 
    children: React.ReactNode, 
    align?: 'left'|'center'|'right'
}> = ({ width, onResize, children, align='left' }) => {
    const handleMouseDown = (e: React.MouseEvent) => {
        const startX = e.pageX;
        const startW = width;
        const onMove = (mv: MouseEvent) => onResize(Math.max(40, startW + (mv.pageX - startX)));
        const onUp = () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        e.stopPropagation();
    };
    return (
        <div className="border-r border-slate-300 px-2 h-full flex items-center relative overflow-visible select-none flex-shrink-0" style={{ width, justifyContent: align==='right'?'flex-end':align==='center'?'center':'flex-start' }}>
            {children}
            <div className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 z-10" onMouseDown={handleMouseDown}></div>
        </div>
    );
};

const CombinedView: React.FC<CombinedViewProps> = ({ 
    projectData, schedule, wbsMap, onUpdate, selectedIds, onSelect, onCtx, userSettings, zoomLevel, 
    onZoomChange, showRelations, showCritical
}) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [colWidths, setColWidths] = useState({ id: 160, name: 300, duration: 60, start: 100, finish: 100, float: 60, preds: 150 });
    const { t } = useTranslation(userSettings.language);
    
    const [editing, setEditing] = useState<{id: string, field: string} | null>(null);
    const [editVal, setEditVal] = useState('');

    const tableBodyRef = useRef<HTMLDivElement>(null);
    const ganttRef = useRef<HTMLDivElement>(null);
    const isScrolling = useRef<'table' | 'gantt' | null>(null);

    useEffect(() => {
        if(projectData.wbs.length > 0 && Object.keys(expanded).length === 0) {
            const all: Record<string, boolean> = {};
            projectData.wbs.forEach(w => all[w.id] = true);
            setExpanded(all);
        }
    }, [projectData.wbs.length]);

    const flatRows = useMemo(() => {
        const rows: any[] = [];
        const recurse = (parentId: string | null, depth: number) => {
            const childrenWbs = projectData.wbs.filter(w => (parentId === null ? (!w.parentId || w.parentId === 'null') : w.parentId === parentId));
            childrenWbs.forEach(node => {
                const isExp = expanded[node.id] !== false;
                const wbsInfo = wbsMap[node.id];
                rows.push({ type: 'WBS', id: node.id, data: node, depth, expanded: isExp, startDate: wbsInfo?.startDate, endDate: wbsInfo?.endDate, duration: wbsInfo?.duration, isRoot: !node.parentId || node.parentId === 'null' });
                if (isExp) {
                    schedule.filter(a => a.wbsId === node.id).forEach(act => {
                        rows.push({ type: 'Activity', id: act.id, data: act, depth: depth + 1, startDate: act.startDate, endDate: act.endDate });
                    });
                    recurse(node.id, depth + 1);
                }
            });
        };
        recurse(null, 0);
        return rows;
    }, [projectData, schedule, wbsMap, expanded]);

    const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (isScrolling.current === 'gantt') return;
        isScrolling.current = 'table';
        if (ganttRef.current) ganttRef.current.scrollTop = e.currentTarget.scrollTop;
        setTimeout(() => isScrolling.current = null, 100);
    };

    const handleGanttScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (isScrolling.current === 'table') return;
        isScrolling.current = 'gantt';
        if (tableBodyRef.current) tableBodyRef.current.scrollTop = e.currentTarget.scrollTop;
        setTimeout(() => isScrolling.current = null, 100);
    };

    const startEdit = (id: string, field: string, val: any) => {
        setEditing({id, field});
        if(field === 'predecessors') {
            const act = schedule.find(a => a.id === id);
            setEditVal(act?.predecessors.map(p => `${p.activityId}${p.type !== 'FS' ? p.type : ''}${p.lag !== 0 ? (p.lag > 0 ? '+' + p.lag : p.lag) : ''}`).join(',') || '');
        } else {
            setEditVal(String(val || ''));
        }
    };

    const saveEdit = () => {
        if(editing) onUpdate(editing.id, editing.field, editVal);
        setEditing(null);
    };

    const handleRowClick = (id: string, e: React.MouseEvent) => {
        if (e.shiftKey && selectedIds.length > 0) {
            const lastId = selectedIds[selectedIds.length - 1];
            const idx1 = flatRows.findIndex(r => r.id === lastId);
            const idx2 = flatRows.findIndex(r => r.id === id);
            if (idx1 !== -1 && idx2 !== -1) {
                const start = Math.min(idx1, idx2);
                const end = Math.max(idx1, idx2);
                onSelect(flatRows.slice(start, end + 1).map(r => r.id), true);
                return;
            }
        }
        onSelect(e.ctrlKey || e.metaKey ? (selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]) : [id], true);
    };

    const ROW_HEIGHT = Math.max(28, (userSettings.uiFontPx || 13) + 12);
    const tableWidth = colWidths.id + colWidths.name + colWidths.duration + colWidths.start + colWidths.finish + colWidths.float + colWidths.preds;

    return (
        <div className="flex flex-grow overflow-hidden border-t border-slate-300 bg-white" style={{ fontSize: `${userSettings.uiFontPx || 13}px` }}>
            <div className="flex flex-col border-r border-slate-300 shrink-0" style={{ width: tableWidth }}>
                <div className="p6-header flex items-center bg-slate-200 border-b border-slate-300 font-bold text-slate-700" style={{ height: HEADER_HEIGHT }}>
                    <ResizableHeader width={colWidths.id} onResize={w => setColWidths(p=>({...p, id:w}))}>{t('ActivityID')}</ResizableHeader>
                    <ResizableHeader width={colWidths.name} onResize={w => setColWidths(p=>({...p, name:w}))}>{t('ActivityName')}</ResizableHeader>
                    <ResizableHeader width={colWidths.duration} onResize={w => setColWidths(p=>({...p, duration:w}))} align="center">{t('Duration')}</ResizableHeader>
                    <ResizableHeader width={colWidths.start} onResize={w => setColWidths(p=>({...p, start:w}))} align="center">{t('Start')}</ResizableHeader>
                    <ResizableHeader width={colWidths.finish} onResize={w => setColWidths(p=>({...p, finish:w}))} align="center">{t('Finish')}</ResizableHeader>
                    <ResizableHeader width={colWidths.float} onResize={w => setColWidths(p=>({...p, float:w}))} align="center">{t('TotalFloat')}</ResizableHeader>
                    <ResizableHeader width={colWidths.preds} onResize={w => setColWidths(p=>({...p, preds:w}))}>{t('Predecessors')}</ResizableHeader>
                </div>
                <div ref={tableBodyRef} className="flex-grow overflow-y-auto overflow-x-hidden custom-scrollbar" onScroll={handleTableScroll}>
                    {flatRows.map(row => {
                        const isSel = selectedIds.includes(row.id);
                        const isWBS = row.type === 'WBS';
                        const isCritical = !isWBS && row.data.isCritical && showCritical;
                        return (
                            <div key={row.id} className={`p6-row ${isSel ? 'selected' : (isWBS ? 'wbs' : '')} ${isCritical ? 'text-red-600 font-medium' : ''}`} 
                                style={{ height: ROW_HEIGHT }} onClick={e => handleRowClick(row.id, e)} onContextMenu={e => { e.preventDefault(); onCtx({x:e.clientX, y:e.clientY, id:row.id, type:row.type}); }}>
                                <div className="p6-cell" style={{ width: colWidths.id, paddingLeft: `${row.depth * 16 + 4}px` }}>
                                    {isWBS && <span onClick={e => { e.stopPropagation(); setExpanded(p=>({...p, [row.id]: !p[row.id]})); }} className="mr-1 cursor-pointer w-4 text-center">{row.expanded ? '▼' : '▶'}</span>}
                                    <span onDoubleClick={() => startEdit(row.id, 'id', row.id)} className="truncate w-full">{row.id}</span>
                                </div>
                                <div className="p6-cell" style={{ width: colWidths.name }}>
                                    {editing?.id === row.id && editing.field === 'name' ? <input autoFocus className="w-full h-full outline-none px-1" value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={e=>e.key==='Enter'&&saveEdit()}/> : 
                                    <span onDoubleClick={() => startEdit(row.id, 'name', row.data.name)} className="truncate w-full">{row.data.name}</span>}
                                </div>
                                <div className="p6-cell justify-center" style={{ width: colWidths.duration }}>{isWBS ? row.duration : row.data.duration}</div>
                                <div className="p6-cell justify-center" style={{ width: colWidths.start }}>{formatDate(row.startDate)}</div>
                                <div className="p6-cell justify-center" style={{ width: colWidths.finish }}>{formatDate(row.endDate)}</div>
                                <div className="p6-cell justify-center" style={{ width: colWidths.float }}>{!isWBS && row.data.totalFloat}</div>
                                <div className="p6-cell" style={{ width: colWidths.preds }}>
                                    {!isWBS && (editing?.id === row.id && editing.field === 'predecessors' ? <input autoFocus className="w-full h-full outline-none px-1" value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={e=>e.key==='Enter'&&saveEdit()}/> : 
                                    <span onDoubleClick={() => startEdit(row.id, 'predecessors', null)} className="truncate w-full">{row.data.predecessors.map((p:any) => `${p.activityId}${p.type!=='FS'?p.type:''}${p.lag!==0?(p.lag>0?'+'+p.lag:p.lag):''}`).join(',')}</span>)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <GanttChart ref={ganttRef} rows={flatRows} activities={schedule} projectStartDate={new Date(projectData.meta.projectStartDate)} totalDuration={flatRows.length > 0 ? flatRows[0].duration : 100} 
                showRelations={showRelations} showCritical={showCritical} showGrid={true} zoomLevel={zoomLevel} userSettings={userSettings} rowHeight={ROW_HEIGHT} fontSize={userSettings.uiFontPx || 13} headerHeight={HEADER_HEIGHT} onScroll={handleGanttScroll} />
        </div>
    );
};

export default CombinedView;
