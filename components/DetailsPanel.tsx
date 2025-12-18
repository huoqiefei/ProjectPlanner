
import React, { useState } from 'react';
import { Activity, Resource, Assignment, Calendar, Predecessor, UserSettings } from '../types';
import { useTranslation } from '../utils/i18n';

interface DetailsPanelProps {
    activity?: Activity;
    resources: Resource[];
    assignments: Assignment[];
    calendars: Calendar[];
    onUpdate: (id: string, field: string, value: any) => void;
    onAssignUpdate: (assignments: Assignment[], activityId: string) => void;
    userSettings: UserSettings;
    allActivities: Activity[];
    isVisible: boolean;
    onToggle: () => void;
    selectedIds: string[];
    onBatchAssign?: (resId: string, units: number) => void;
}

const DetailsPanel: React.FC<DetailsPanelProps> = ({ 
    activity, resources, assignments, calendars, onUpdate, onAssignUpdate, userSettings, 
    allActivities, isVisible, onToggle, selectedIds, onBatchAssign 
}) => {
    const [tab, setTab] = useState('General');
    const [selRes, setSelRes] = useState('');
    const [inputUnits, setInputUnits] = useState(8);
    const { t } = useTranslation(userSettings.language);
    
    if (!isVisible) return (
        <div className="h-8 border-t bg-slate-100 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-200" onClick={onToggle}>
            <span className="font-bold text-slate-600 text-[11px] uppercase tracking-wider">{t('DetailsController')}</span>
            <span className="material-symbols-outlined text-[18px]">expand_less</span>
        </div>
    );

    const isBatch = selectedIds.length > 1;

    return (
        <div className="h-72 border-t-4 border-slate-300 bg-white flex flex-col shrink-0 shadow-inner">
            <div className="flex bg-slate-100 border-b border-slate-300 px-1 pt-1 h-9 items-end justify-between">
                <div className="flex gap-1 h-full items-end">
                    {['General', 'Status', 'Resources', 'Relationships'].map(tName => (
                        <button key={tName} onClick={() => setTab(tName)} className={`px-5 py-1.5 uppercase font-bold text-[10px] border-t border-l border-r rounded-t-sm transition-all ${tab === tName ? 'bg-white text-blue-700 border-b-white -mb-px shadow-sm' : 'text-slate-400 border-b-slate-300 hover:bg-slate-50'}`}>
                            {tName}
                        </button>
                    ))}
                </div>
                <button onClick={onToggle} className="mr-2 mb-1 p-1 hover:bg-slate-200 rounded text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                </button>
            </div>

            <div className="flex-grow p-4 overflow-auto custom-scrollbar">
                {isBatch ? (
                    <div className="h-full flex flex-col items-center justify-center space-y-4">
                        <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">{selectedIds.length} {t('BatchSelectedCount')}</div>
                        <div className="flex gap-4 p-6 border rounded-xl bg-slate-50 border-dashed border-slate-300">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('Assign')}</label>
                                <select className="border p-2 rounded bg-white text-xs w-48" value={selRes} onChange={e=>setSelRes(e.target.value)}>
                                    <option value="">{t('SelectRes')}</option>
                                    {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase">{t('UnitsPerDay')}</label>
                                <input type="number" className="border p-2 rounded bg-white text-xs w-24" value={inputUnits} onChange={e=>setInputUnits(Number(e.target.value))}/>
                            </div>
                            <button onClick={() => selRes && onBatchAssign?.(selRes, inputUnits)} className="self-end bg-blue-600 text-white px-6 py-2 rounded font-bold text-xs hover:bg-blue-700 shadow-lg shadow-blue-600/20">{t('Apply')}</button>
                        </div>
                    </div>
                ) : activity ? (
                    <div className="h-full">
                        <div className="font-bold text-slate-400 text-[10px] uppercase mb-4 tracking-tighter border-b pb-2 flex justify-between">
                            <span>{activity.id} : {activity.name}</span>
                            <span className={activity.isCritical ? 'text-red-500' : 'text-emerald-500'}>{activity.isCritical ? 'CRITICAL' : 'NON-CRITICAL'}</span>
                        </div>
                        
                        {tab === 'General' && (
                            <div className="grid grid-cols-4 gap-6">
                                <div className="space-y-4">
                                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('ActivityID')}</label><input disabled className="w-full border p-2 rounded bg-slate-50 text-xs" value={activity.id}/></div>
                                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('ActivityName')}</label><input className="w-full border p-2 rounded text-xs" value={activity.name} onChange={e=>onUpdate(activity.id, 'name', e.target.value)}/></div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Type</label><select className="w-full border p-2 rounded text-xs bg-white" value={activity.activityType} onChange={e=>onUpdate(activity.id, 'activityType', e.target.value)}><option>Task</option><option>Start Milestone</option><option>Finish Milestone</option></select></div>
                                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Calendar</label><select className="w-full border p-2 rounded text-xs bg-white" value={activity.calendarId || ''} onChange={e=>onUpdate(activity.id, 'calendarId', e.target.value)}><option value="">Global Default</option>{calendars.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{t('Duration')}</label><input type="number" className="w-full border p-2 rounded text-xs" value={activity.duration} onChange={e=>onUpdate(activity.id, 'duration', Number(e.target.value))}/></div>
                                    <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Budgeted Cost</label><input type="number" className="w-full border p-2 rounded text-xs" value={activity.budgetedCost} onChange={e=>onUpdate(activity.id, 'budgetedCost', Number(e.target.value))}/></div>
                                </div>
                            </div>
                        )}

                        {tab === 'Status' && (
                            <div className="grid grid-cols-3 gap-8 p-4 bg-slate-50 border rounded-lg">
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-blue-600 border-b border-blue-100 pb-1">DATES</div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Start:</span> <span className="font-mono">{new Date(activity.startDate).toLocaleDateString()}</span></div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Finish:</span> <span className="font-mono">{new Date(activity.endDate).toLocaleDateString()}</span></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-blue-600 border-b border-blue-100 pb-1">FLOAT</div>
                                    <div className="flex justify-between text-xs"><span className="text-slate-400">Total Float:</span> <span className={`font-mono font-bold ${activity.totalFloat <= 0 ? 'text-red-500' : ''}`}>{activity.totalFloat}d</span></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="text-[10px] font-bold text-blue-600 border-b border-blue-100 pb-1">PROGRESS</div>
                                    <div className="w-full h-2 bg-slate-200 rounded-full mt-4"><div className="h-full bg-emerald-500 rounded-full" style={{width: '0%'}}></div></div>
                                    <div className="text-right text-[10px] text-slate-400 mt-1">0% Complete</div>
                                </div>
                            </div>
                        )}

                        {tab === 'Resources' && (
                            <div className="h-full flex flex-col">
                                <div className="flex gap-2 mb-4 border-b pb-4">
                                    <select className="border p-2 rounded bg-white text-xs w-48" value={selRes} onChange={e=>setSelRes(e.target.value)}>
                                        <option value="">{t('SelectRes')}</option>
                                        {resources.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                    <input type="number" className="border p-2 rounded bg-white text-xs w-24" value={inputUnits} onChange={e=>setInputUnits(Number(e.target.value))}/>
                                    <button onClick={() => {
                                        if(!selRes) return;
                                        const newAs = [...assignments.filter(a => !(a.activityId === activity.id && a.resourceId === selRes)), { activityId: activity.id, resourceId: selRes, units: inputUnits * activity.duration }];
                                        onAssignUpdate(newAs, activity.id);
                                    }} className="bg-slate-800 text-white px-4 py-2 rounded font-bold text-[10px] hover:bg-slate-700">ASSIGN</button>
                                </div>
                                <div className="flex-grow overflow-auto border rounded bg-white">
                                    <table className="w-full text-left text-xs">
                                        <thead className="bg-slate-100 sticky top-0"><tr><th className="p-2 border-b">Resource Name</th><th className="p-2 border-b">Units/Day</th><th className="p-2 border-b">Total Budget</th><th className="p-2 border-b w-10"></th></tr></thead>
                                        <tbody>
                                            {assignments.filter(a => a.activityId === activity.id).map(a => {
                                                const r = resources.find(res => res.id === a.resourceId);
                                                return (
                                                    <tr key={a.resourceId} className="hover:bg-slate-50">
                                                        <td className="p-2 border-b">{r?.name}</td>
                                                        <td className="p-2 border-b">{(a.units / (activity.duration || 1)).toFixed(2)}</td>
                                                        <td className="p-2 border-b">{a.units}</td>
                                                        <td className="p-2 border-b"><button onClick={() => onAssignUpdate(assignments.filter(x => !(x.activityId === activity.id && x.resourceId === a.resourceId)), activity.id)} className="text-red-400 hover:text-red-600">×</button></td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {tab === 'Relationships' && (
                            <div className="grid grid-cols-2 gap-4 h-full">
                                <div className="flex flex-col border rounded overflow-hidden">
                                    <div className="bg-slate-800 text-white p-2 text-[10px] font-bold uppercase tracking-widest">Predecessors</div>
                                    <div className="flex-grow overflow-auto">
                                        <table className="w-full text-left text-xs">
                                            <tbody>
                                                {activity.predecessors.map((p, i) => (
                                                    <tr key={i} className="border-b"><td className="p-2 font-bold">{p.activityId}</td><td className="p-2">{p.type}</td><td className="p-2">{p.lag}d</td><td className="p-2 text-right"><button onClick={() => {
                                                        const np = activity.predecessors.filter((_, idx)=>idx!==i);
                                                        onUpdate(activity.id, 'predecessors', np);
                                                    }} className="text-red-400">×</button></td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="flex flex-col border rounded overflow-hidden">
                                    <div className="bg-slate-800 text-white p-2 text-[10px] font-bold uppercase tracking-widest">Successors</div>
                                    <div className="flex-grow overflow-auto bg-slate-50/50">
                                        <table className="w-full text-left text-xs">
                                            <tbody>
                                                {allActivities.filter(a => a.predecessors.some(p => p.activityId === activity.id)).map(a => (
                                                    <tr key={a.id} className="border-b"><td className="p-2 font-bold">{a.id}</td><td className="p-2 truncate max-w-[100px]">{a.name}</td></tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 font-bold uppercase tracking-widest">{t('NoSelectedActivity')}</div>
                )}
            </div>
        </div>
    );
};

export default DetailsPanel;
