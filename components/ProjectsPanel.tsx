
import React, { useState } from 'react';
import { ProjectData, UserSettings, Calendar } from '../types';
import { useTranslation } from '../utils/i18n';

interface ProjectsPanelProps {
    data: ProjectData;
    wbsMap: Record<string, { startDate: Date; endDate: Date; duration: number }>;
    onUpdateWBS: (id: string, field: string, val: any) => void;
    onUpdateMeta?: (field: string, val: any) => void; // New prop for global updates
    onCtx: (data: any) => void;
    openProjectIds: string[];
    onOpenProjects: (ids: string[]) => void;
    userSettings: UserSettings;
    calendars: Calendar[];
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ 
    data, wbsMap, onUpdateWBS, onUpdateMeta, onCtx, openProjectIds, onOpenProjects, userSettings, calendars 
}) => {
    const { t } = useTranslation(userSettings.language);
    const fontSizePx = userSettings.uiFontPx || 13;
    
    // Selection & UI State
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [lastClickedId, setLastClickedId] = useState<string | null>(null);
    const [isDetailsVisible, setIsDetailsVisible] = useState(true);
    const [activeTab, setActiveTab] = useState<'General'|'Dates'|'Defaults'>('General');

    // Editing in Table
    const [editing, setEditing] = useState<{id: string, field: string} | null>(null);
    const [editVal, setEditVal] = useState('');

    const projects = data.wbs.filter(w => !w.parentId || w.parentId === 'null');
    const selectedProject = projects.find(p => p.id === selectedIds[selectedIds.length - 1]);

    const formatDate = (date: Date): string => {
        if (!date || isNaN(date.getTime())) return '-';
        return date.toLocaleDateString(userSettings.language === 'zh' ? 'zh-CN' : 'en-US');
    };

    // --- Interaction Handlers ---

    const handleRowClick = (id: string, e: React.MouseEvent) => {
        if (e.shiftKey && lastClickedId) {
            const idx1 = projects.findIndex(p => p.id === lastClickedId);
            const idx2 = projects.findIndex(p => p.id === id);
            const start = Math.min(idx1, idx2);
            const end = Math.max(idx1, idx2);
            const range = projects.slice(start, end + 1).map(p => p.id);
            setSelectedIds(e.ctrlKey ? [...new Set([...selectedIds, ...range])] : range);
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
            setLastClickedId(id);
        } else {
            setSelectedIds([id]);
            setLastClickedId(id);
        }
    };

    const handleContextMenu = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        let newSelection = selectedIds;
        if (!selectedIds.includes(id)) {
            newSelection = [id];
            setSelectedIds(newSelection);
            setLastClickedId(id);
        }
        onCtx({ x: e.clientX, y: e.clientY, type: 'Project', id, selIds: newSelection });
    };

    // --- Editing Handlers ---

    const startEdit = (id: string, field: string, val: any) => {
        setEditing({id, field});
        setEditVal(String(val || ''));
    };

    const saveEdit = () => {
        if (editing) {
            onUpdateWBS(editing.id, editing.field, editVal);
        }
        setEditing(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if(e.key === 'Enter') saveEdit();
        if(e.key === 'Escape') setEditing(null);
    };

    // --- Detail Editing (Meta vs WBS) ---
    const updateProjectDetail = (field: string, value: any) => {
        if (!selectedProject) return;
        
        // If it's a Meta field and onUpdateMeta is provided, update global meta
        if (field === 'projectStartDate' && onUpdateMeta) {
            onUpdateMeta('projectStartDate', value);
            return;
        }
        if (field === 'calendarId' && onUpdateMeta) {
            onUpdateMeta('defaultCalendarId', value);
            // Also update the specific WBS node for consistency if needed, 
            // but usually Project Root settings sync with Meta in single-project mode.
            // onUpdateWBS(selectedProject.id, 'calendarId', value); 
            return;
        }

        // Otherwise update the WBS Node
        onUpdateWBS(selectedProject.id, field, value);
    };

    return (
        <div className="flex flex-col h-full bg-white select-none" onClick={() => { setEditing(null); }} style={{ fontSize: `${fontSizePx}px` }}>
            {/* Top: Projects Table */}
            <div className={`flex-grow flex flex-col overflow-hidden border-b-4 border-slate-300 ${isDetailsVisible ? 'h-1/2' : 'h-full'}`}>
                <div className="p6-header h-[40px] border-b border-slate-300 bg-slate-100 flex items-center font-bold text-slate-600">
                    <div className="w-10 border-r text-center px-1">
                        <span className="text-xs">📂</span>
                    </div>
                    <div className="w-40 border-r px-2 flex items-center">{t('ProjectCode')}</div>
                    <div className="w-64 border-r px-2 flex items-center">{t('ProjectName')}</div>
                    <div className="w-24 border-r px-2 flex items-center text-center justify-center">Status</div>
                    <div className="w-32 border-r px-2 flex items-center text-center justify-center">{t('StartDate')}</div>
                    <div className="w-32 border-r px-2 flex items-center text-center justify-center">{t('FinishDate')}</div>
                    <div className="flex-grow px-2 flex items-center">{t('Remarks')}</div>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar bg-white">
                    {projects.map(p => {
                        const info = wbsMap[p.id] || { startDate: new Date(), endDate: new Date() };
                        const isSel = selectedIds.includes(p.id);
                        const isOpen = openProjectIds.includes(p.id);

                        return (
                            <div 
                                key={p.id} 
                                className={`p6-row h-9 transition-colors cursor-pointer ${isSel ? 'bg-blue-100 text-blue-900' : 'hover:bg-slate-50 text-slate-700'}`}
                                onClick={(e) => handleRowClick(p.id, e)}
                                onContextMenu={(e) => handleContextMenu(p.id, e)}
                            >
                                <div className="w-10 border-r flex items-center justify-center text-xs">
                                    {isOpen && <span className="text-green-600 font-bold" title="Open">●</span>}
                                </div>
                                
                                <div className="w-40 border-r px-2 truncate p6-cell">
                                    {editing?.id === p.id && editing.field === 'id' ? (
                                        <input autoFocus className="w-full border p-1" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} />
                                    ) : (
                                        <span onDoubleClick={() => startEdit(p.id, 'id', p.id)} className="w-full block">{p.id}</span>
                                    )}
                                </div>

                                <div className="w-64 border-r px-2 truncate p6-cell">
                                    {editing?.id === p.id && editing.field === 'name' ? (
                                        <input autoFocus className="w-full border p-1" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} />
                                    ) : (
                                        <span onDoubleClick={() => startEdit(p.id, 'name', p.name)} className="w-full block font-medium">{p.name}</span>
                                    )}
                                </div>

                                <div className="w-24 border-r px-2 text-center p6-cell justify-center text-xs">
                                    <span className="bg-green-100 text-green-800 px-2 rounded-full">Active</span>
                                </div>

                                <div className="w-32 border-r px-2 text-center p6-cell justify-center text-slate-600 text-xs">
                                    {formatDate(data.meta.projectStartDate ? new Date(data.meta.projectStartDate) : info.startDate)}
                                </div>
                                <div className="w-32 border-r px-2 text-center p6-cell justify-center text-slate-600 text-xs">
                                    {formatDate(info.endDate)}
                                </div>

                                <div className="flex-grow px-2 p6-cell truncate">
                                    {editing?.id === p.id && editing.field === 'remarks' ? (
                                        <input autoFocus className="w-full border p-1" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} />
                                    ) : (
                                        <span onDoubleClick={() => startEdit(p.id, 'remarks', p.remarks)} className="w-full block text-slate-500">{p.remarks || ''}</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {projects.length === 0 && <div className="p-4 text-center text-slate-400">Right-click to Create Project</div>}
                </div>
            </div>

            {/* Bottom: Project Details */}
            {isDetailsVisible ? (
                <div className="h-1/2 flex flex-col bg-slate-50 transition-all border-t border-slate-300">
                    <div className="flex bg-slate-100 border-b border-slate-300 px-1 pt-1 gap-1 h-8 items-end justify-between">
                        <div className="flex gap-1 h-full items-end">
                            {['General', 'Dates', 'Defaults'].map(t => (
                                <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-1 uppercase font-bold text-xs border-t border-l border-r rounded-t-sm ${activeTab === t ? 'bg-white text-black border-b-white -mb-px' : 'text-slate-500 border-b-slate-300 hover:bg-slate-200'}`}>
                                    {t}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setIsDetailsVisible(false)} className="mr-2 mb-1 text-slate-500 hover:text-blue-600" title="Collapse">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
                        </button>
                    </div>

                    <div className="flex-grow overflow-auto p-4 bg-white relative">
                        {!selectedProject ? (
                            <div className="flex h-full items-center justify-center text-slate-400">Select a project to view details</div>
                        ) : (
                            <>
                                {activeTab === 'General' && (
                                    <div className="max-w-3xl grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-slate-500 font-bold mb-1 text-xs uppercase">Project ID</label>
                                                <input className="w-full border p-1.5 bg-white rounded-sm text-sm" value={selectedProject.id} onChange={e=>updateProjectDetail('id', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-slate-500 font-bold mb-1 text-xs uppercase">Project Name</label>
                                                <input className="w-full border p-1.5 rounded-sm text-sm" value={selectedProject.name} onChange={e=>updateProjectDetail('name', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="block text-slate-500 font-bold mb-1 text-xs uppercase">Status</label>
                                                <select className="w-full border p-1.5 rounded-sm text-sm bg-white">
                                                    <option>Active</option>
                                                    <option>Inactive</option>
                                                    <option>Planned</option>
                                                    <option>What-if</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-slate-500 font-bold mb-1 text-xs uppercase">Responsible Manager</label>
                                                <input className="w-full border p-1.5 rounded-sm text-sm" placeholder="Enterprise" />
                                            </div>
                                            <div>
                                                <label className="block text-slate-500 font-bold mb-1 text-xs uppercase">Description / Remarks</label>
                                                <textarea className="w-full border p-1.5 rounded-sm text-sm h-24 resize-none" value={selectedProject.remarks || ''} onChange={e=>updateProjectDetail('remarks', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Dates' && (
                                    <div className="max-w-2xl grid grid-cols-2 gap-6">
                                        <div className="p-3 border rounded bg-slate-50">
                                            <h4 className="font-bold text-slate-700 border-b pb-1 mb-2 text-xs uppercase">Project Dates</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-slate-600 font-bold">Planned Start:</label>
                                                    <input 
                                                        type="date" 
                                                        className="border p-1 w-32 text-xs" 
                                                        value={data.meta.projectStartDate}
                                                        onChange={(e) => updateProjectDetail('projectStartDate', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label className="text-slate-600 font-bold">Data Date:</label>
                                                    <span className="text-slate-500 text-xs px-1">{formatDate(data.meta.projectStartDate ? new Date(data.meta.projectStartDate) : new Date())}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-t pt-2 mt-2">
                                                    <label className="text-slate-600">Actual Start:</label>
                                                    <span>-</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <label className="text-slate-600">Actual Finish:</label>
                                                    <span>-</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="p-3 border rounded bg-white">
                                            <h4 className="font-bold text-slate-700 border-b pb-1 mb-2 text-xs uppercase">Calculated</h4>
                                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                                                <span className="text-slate-500 text-right pr-2">Start:</span>
                                                <span>{wbsMap[selectedProject.id] ? formatDate(wbsMap[selectedProject.id].startDate) : '-'}</span>
                                                
                                                <span className="text-slate-500 text-right pr-2">Finish:</span>
                                                <span>{wbsMap[selectedProject.id] ? formatDate(wbsMap[selectedProject.id].endDate) : '-'}</span>
                                                
                                                <span className="text-slate-500 text-right pr-2">Duration:</span>
                                                <span>{wbsMap[selectedProject.id]?.duration || 0}d</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'Defaults' && (
                                    <div className="max-w-xl space-y-4">
                                        <div>
                                            <label className="block text-slate-500 font-bold mb-1 text-xs uppercase">Project Default Calendar</label>
                                            <select 
                                                className="w-full border p-1.5 rounded-sm text-sm bg-white"
                                                value={data.meta.defaultCalendarId || ''}
                                                onChange={e => updateProjectDetail('calendarId', e.target.value)}
                                            >
                                                <option value="">Select a calendar...</option>
                                                {calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-1">Activities added to this project will use this calendar by default.</p>
                                        </div>
                                        <div className="pt-4 border-t">
                                            <button 
                                                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 text-sm font-bold"
                                                onClick={() => onOpenProjects(selectedIds)}
                                                disabled={selectedIds.length === 0}
                                            >
                                                Open Selected Project(s)
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-8 border-t bg-slate-100 flex items-center justify-between px-2 flex-shrink-0 cursor-pointer hover:bg-slate-200 transition-colors border-slate-300" onClick={() => setIsDetailsVisible(true)}>
                    <span className="font-bold text-slate-500 text-xs uppercase tracking-wider">Project Details</span>
                    <button className="text-slate-500 hover:text-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"/></svg>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProjectsPanel;
