
import React, { useState } from 'react';
import { ProjectData, WBSNode, Calendar, UserSettings } from '../types';
import { useTranslation } from '../utils/i18n';

interface ProjectsPanelProps {
    data: ProjectData;
    wbsMap: Record<string, { startDate: Date; endDate: Date; duration: number }>;
    onUpdateWBS: (id: string, field: string, val: any) => void;
    onAddProject: () => void;
    onDeleteProject: (id: string) => void;
    userSettings: UserSettings;
}

const ProjectsPanel: React.FC<ProjectsPanelProps> = ({ data, wbsMap, onUpdateWBS, onAddProject, onDeleteProject, userSettings }) => {
    const { t } = useTranslation(userSettings.language);
    const fontSizePx = userSettings.uiFontPx || 13;
    const [editing, setEditing] = useState<{id: string, field: string} | null>(null);
    const [editVal, setEditVal] = useState('');

    const projects = data.wbs.filter(w => !w.parentId || w.parentId === 'null');

    const formatDate = (date: Date): string => {
        if (!date || isNaN(date.getTime())) return '-';
        return date.toLocaleDateString(userSettings.language === 'zh' ? 'zh-CN' : 'en-US');
    };

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

    return (
        <div className="flex-grow flex flex-col bg-white overflow-hidden" style={{ fontSize: `${fontSizePx}px` }}>
            <div className="p6-header h-[50px] border-b border-slate-300">
                <div className="w-10 border-r text-center">
                    <button onClick={onAddProject} className="text-green-600 font-bold hover:text-green-800 text-lg">+</button>
                </div>
                <div className="w-40 border-r px-2 flex items-center">{t('ProjectCode')}</div>
                <div className="w-64 border-r px-2 flex items-center">{t('ProjectName')}</div>
                <div className="w-32 border-r px-2 flex items-center text-center justify-center">{t('StartDate')}</div>
                <div className="w-32 border-r px-2 flex items-center text-center justify-center">{t('FinishDate')}</div>
                <div className="w-40 border-r px-2 flex items-center">{t('DefaultCal')}</div>
                <div className="flex-grow px-2 flex items-center">{t('Remarks')}</div>
            </div>
            
            <div className="flex-grow overflow-y-auto custom-scrollbar bg-white">
                {projects.map(p => {
                    const info = wbsMap[p.id] || { startDate: new Date(), endDate: new Date() };
                    const calName = data.calendars.find(c => c.id === (p.calendarId || data.meta.defaultCalendarId))?.name || 'Default';

                    return (
                        <div key={p.id} className="p6-row h-10 hover:bg-slate-50">
                            <div className="w-10 border-r flex items-center justify-center">
                                <button onClick={() => { if(confirm(t('DeleteWBSPrompt'))) onDeleteProject(p.id); }} className="text-red-500 hover:text-red-700">×</button>
                            </div>
                            
                            <div className="w-40 border-r px-2 truncate p6-cell">
                                {editing?.id === p.id && editing.field === 'id' ? (
                                    <input autoFocus className="w-full border p-1" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} />
                                ) : (
                                    <span onDoubleClick={() => startEdit(p.id, 'id', p.id)} className="cursor-pointer w-full block">{p.id}</span>
                                )}
                            </div>

                            <div className="w-64 border-r px-2 truncate p6-cell">
                                {editing?.id === p.id && editing.field === 'name' ? (
                                    <input autoFocus className="w-full border p-1" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} />
                                ) : (
                                    <span onDoubleClick={() => startEdit(p.id, 'name', p.name)} className="cursor-pointer w-full block font-bold text-blue-800">{p.name}</span>
                                )}
                            </div>

                            <div className="w-32 border-r px-2 text-center p6-cell justify-center text-slate-600">
                                {formatDate(info.startDate)}
                            </div>
                            <div className="w-32 border-r px-2 text-center p6-cell justify-center text-slate-600">
                                {formatDate(info.endDate)}
                            </div>

                            <div className="w-40 border-r px-2 p6-cell">
                                {editing?.id === p.id && editing.field === 'calendarId' ? (
                                    <select autoFocus className="w-full border p-1" value={editVal} onChange={e => { onUpdateWBS(p.id, 'calendarId', e.target.value); setEditing(null); }} onBlur={() => setEditing(null)}>
                                        {data.calendars.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                ) : (
                                    <span onDoubleClick={() => startEdit(p.id, 'calendarId', p.calendarId || '')} className="cursor-pointer w-full block">{calName}</span>
                                )}
                            </div>

                            <div className="flex-grow px-2 p6-cell">
                                {editing?.id === p.id && editing.field === 'remarks' ? (
                                    <input autoFocus className="w-full border p-1" value={editVal} onChange={e => setEditVal(e.target.value)} onBlur={saveEdit} onKeyDown={handleKeyDown} />
                                ) : (
                                    <span onDoubleClick={() => startEdit(p.id, 'remarks', p.remarks)} className="cursor-pointer w-full block text-slate-500">{p.remarks || '-'}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
                {projects.length === 0 && <div className="p-4 text-center text-slate-400">No Projects Found</div>}
            </div>
        </div>
    );
};

export default ProjectsPanel;
