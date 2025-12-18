
import React, { useState, useEffect, useCallback } from 'react';
import { ProjectData, ScheduleResult, UserSettings, AdminConfig, User, Activity, Calendar } from './types';
import { calculateSchedule } from './services/scheduler';
import { authService } from './services/authService';
import Toolbar from './components/Toolbar';
import MenuBar from './components/MenuBar';
import CombinedView from './components/CombinedView';
import DetailsPanel from './components/DetailsPanel';
import ResourcesPanel from './components/ResourcesPanel';
import ProjectsPanel from './components/ProjectsPanel';
import CalendarsModal from './components/CalendarsModal';
import PrintSettingsModal from './components/PrintSettingsModal';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import AuthPage from './components/AuthPage';
import { AboutModal, UserSettingsModal, HelpModal, AdminModal, CloudBackupModal } from './components/Modals';
import { getInitialLanguage, useTranslation } from './utils/i18n';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [data, setData] = useState<ProjectData | null>(null);
    const [schedule, setSchedule] = useState<ScheduleResult>({ activities: [], wbsMap: {} });
    const [selIds, setSelIds] = useState<string[]>([]);
    const [view, setView] = useState<'projects' | 'activities' | 'resources'>('activities');
    const [ganttZoom, setGanttZoom] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('day');
    const [showDetails, setShowDetails] = useState(true);
    const [showCritical, setShowCritical] = useState(true);
    const [showLogic, setShowLogic] = useState(true);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [openProjectIds, setOpenProjectIds] = useState<string[]>([]);
    const [ctxMenu, setCtxMenu] = useState<{ x: number, y: number, id: string, type: string } | null>(null);

    const [adminConfig, setAdminConfig] = useState<AdminConfig>({
        appName: 'Planner Pro',
        copyrightText: 'Copyright © Planner.cn. All rights reserved.',
        enableWatermark: true,
        ganttBarRatio: 0.35
    });

    const [userSettings, setUserSettings] = useState<UserSettings>({ 
        dateFormat: 'YYYY-MM-DD', 
        language: getInitialLanguage(),
        uiSize: 'small',
        uiFontPx: 13,
        gridSettings: { showVertical: true, verticalInterval: 'auto', showHorizontal: true, showWBSLines: true },
        visibleColumns: ['id', 'name', 'duration', 'start', 'finish', 'float', 'preds'] 
    });

    const { t } = useTranslation(userSettings.language);

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) setCurrentUser(user);
        
        const savedAdmin = localStorage.getItem('planner_admin_config');
        if(savedAdmin) setAdminConfig(prev => ({ ...prev, ...JSON.parse(savedAdmin) }));

        setAuthLoading(false);
        const hideCtx = () => setCtxMenu(null);
        window.addEventListener('click', hideCtx);
        return () => window.removeEventListener('click', hideCtx);
    }, []);

    const createNew = useCallback(() => {
        const pCode = 'PROJ-101';
        const pName = 'New Infrastructure Project';
        const defCal: Calendar = { id: 'cal-1', name: 'Standard 5-Day', isDefault:true, weekDays:[false,true,true,true,true,true,false], hoursPerDay:8, exceptions:[] };
        setData({
            wbs: [{id: pCode, name: pName, parentId:null}],
            activities: [
                { id: 'A1000', name: 'Project Start', wbsId: pCode, activityType: 'Start Milestone', duration: 0, startDate: new Date(), endDate: new Date(), predecessors: [], earlyStart: new Date(), earlyFinish: new Date(), lateStart: new Date(), lateFinish: new Date(), totalFloat: 0, budgetedCost: 0 }
            ],
            resources: [{id: 'R101', name: 'Standard Crew', type: 'Labor', unit: 'hr', maxUnits: 8}],
            assignments: [],
            calendars: [defCal],
            meta: { 
                title: pName, projectCode: pCode, defaultCalendarId: defCal.id, projectStartDate: new Date().toISOString().split('T')[0], 
                activityIdPrefix:'A', activityIdIncrement:10, resourceIdPrefix:'R', resourceIdIncrement:10 
            }
        });
        setOpenProjectIds([pCode]);
        setIsDirty(false);
    }, []);

    useEffect(() => { if (currentUser && !data) createNew(); }, [currentUser, data, createNew]);
    useEffect(() => { if(data) setSchedule(calculateSchedule(data)); }, [data]);

    const updateActivity = (id: string, field: string, val: any) => {
        if(!data) return;
        setData({
            ...data,
            activities: data.activities.map(a => a.id === id ? { ...a, [field]: val } : a)
        });
        setIsDirty(true);
    };

    const addActivity = (wbsId: string) => {
        if(!data) return;
        const newId = `${data.meta.activityIdPrefix}${Date.now().toString().slice(-4)}`;
        const newAct: Activity = { id: newId, name: 'New Activity', wbsId, activityType: 'Task', duration: 5, startDate: new Date(), endDate: new Date(), predecessors: [], earlyStart: new Date(), earlyFinish: new Date(), lateStart: new Date(), lateFinish: new Date(), totalFloat: 0, budgetedCost: 0 };
        setData({ ...data, activities: [...data.activities, newAct] });
        setSelIds([newId]);
    };

    const addWBS = (parentId: string | null) => {
        if(!data) return;
        const newId = `WBS-${Date.now().toString().slice(-4)}`;
        setData({ ...data, wbs: [...data.wbs, { id: newId, name: 'New WBS Node', parentId }] });
    };

    const deleteItems = (ids: string[]) => {
        if(!data) return;
        setData({
            ...data,
            wbs: data.wbs.filter(w => !ids.includes(w.id)),
            activities: data.activities.filter(a => !ids.includes(a.id)),
            assignments: data.assignments.filter(as => !ids.includes(as.activityId))
        });
    };

    if (authLoading) return <div className="h-screen flex items-center justify-center bg-slate-50 font-bold text-blue-600 animate-pulse">Planner Pro...</div>;
    if (!currentUser) return <AuthPage onLoginSuccess={u => setCurrentUser(u)} adminConfig={adminConfig} />;
    if (!data) return null;

    return (
        <div className="flex flex-col h-screen bg-slate-100 overflow-hidden select-none">
            <MenuBar 
                onAction={a => {
                    if (['view_activities', 'view_projects', 'view_resources'].includes(a)) setView(a.replace('view_', '') as any);
                    else setActiveModal(a);
                }} 
                lang={userSettings.language} 
                uiSize={userSettings.uiSize} 
                currentUser={currentUser} 
                openedProjectsStr={data.meta.title} 
                isDirty={isDirty}
            />
            
            <Toolbar 
                onNew={createNew} 
                onSave={() => setIsDirty(false)} 
                onPrint={() => setActiveModal('print')} 
                onSettings={() => setActiveModal('settings')} 
                title={data.meta.title} 
                isDirty={isDirty} 
                currentUser={currentUser} 
                onLogout={() => { authService.logout(); setCurrentUser(null); }} 
                onUserStats={() => setActiveModal('user_stats')}
                onCloudBackup={() => setActiveModal('cloud_backup')}
                showCritical={showCritical} 
                setShowCritical={setShowCritical} 
                showLogic={showLogic} 
                setShowLogic={setShowLogic} 
                lang={userSettings.language}
                onOpen={() => {}} 
            />
            
            {/* Professional View Tabs */}
            <div className="flex bg-slate-200 px-2 gap-1 border-b border-slate-300 shrink-0 h-9 items-end">
                {[
                    { id: 'projects', label: t('Projects'), icon: 'folder' },
                    { id: 'activities', label: t('Activities'), icon: 'format_list_bulleted' },
                    { id: 'resources', label: t('Resources'), icon: 'group' }
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setView(tab.id as any)}
                        className={`px-4 py-1.5 rounded-t text-xs font-bold flex items-center gap-2 border-t border-l border-r transition-all ${view === tab.id ? 'bg-white text-blue-700 border-slate-300 border-b-white -mb-px shadow-sm' : 'text-slate-500 border-transparent hover:bg-slate-300'}`}
                    >
                        <span className="material-symbols-outlined text-sm">{tab.icon}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="flex-grow flex flex-col min-h-0 relative">
                {view === 'activities' ? (
                    <div className="flex flex-col h-full">
                        <CombinedView projectData={data} schedule={schedule.activities} wbsMap={schedule.wbsMap} onUpdate={updateActivity} selectedIds={selIds} onSelect={(ids) => setSelIds(ids)} onCtx={setCtxMenu} userSettings={userSettings} zoomLevel={ganttZoom} onZoomChange={setGanttZoom} onDeleteItems={deleteItems} showRelations={showLogic} showCritical={showCritical}/>
                        <DetailsPanel activity={data.activities.find(a => a.id === selIds[selIds.length-1])} resources={data.resources} assignments={data.assignments} calendars={data.calendars} onUpdate={updateActivity} onAssignUpdate={(as) => setData({...data, assignments: as})} userSettings={userSettings} allActivities={data.activities} isVisible={showDetails} onToggle={() => setShowDetails(!showDetails)} selectedIds={selIds} onBatchAssign={(resId, units) => {
                             const newAs = [...data.assignments];
                             selIds.forEach(id => {
                                 const act = data.activities.find(a => a.id === id);
                                 if(act) {
                                     const existingIdx = newAs.findIndex(as => as.activityId === id && as.resourceId === resId);
                                     if(existingIdx >= 0) newAs[existingIdx].units = units * act.duration;
                                     else newAs.push({ activityId: id, resourceId: resId, units: units * act.duration });
                                 }
                             });
                             setData({...data, assignments: newAs});
                        }}/>
                    </div>
                ) : view === 'projects' ? (
                    <ProjectsPanel data={data} wbsMap={schedule.wbsMap} onUpdateWBS={(id, f, v) => setData({...data, wbs: data.wbs.map(w=>w.id===id?{...w,[f]:v}:w)})} onCtx={setCtxMenu} openProjectIds={openProjectIds} onOpenProjects={setOpenProjectIds} userSettings={userSettings} calendars={data.calendars}/>
                ) : (
                    <ResourcesPanel resources={data.resources} assignments={data.assignments} activities={data.activities} onUpdateResources={res => setData({...data, resources: res})} userSettings={userSettings} selectedIds={selIds} onSelect={setSelIds} onCtx={setCtxMenu}/>
                )}
            </main>

            {/* Context Menu */}
            {ctxMenu && (
                <div className="fixed bg-white border border-slate-300 shadow-xl py-1 z-[1000] min-w-[160px] text-xs font-bold text-slate-700" style={{ top: ctxMenu.y, left: ctxMenu.x }}>
                    <div className="px-4 py-2 hover:bg-blue-600 hover:text-white cursor-pointer flex items-center gap-2" onClick={() => { if(ctxMenu.type==='Activity') addActivity(data.activities.find(a=>a.id===ctxMenu.id)?.wbsId || data.wbs[0].id); else addWBS(ctxMenu.id); }}>
                        <span className="material-symbols-outlined text-sm">add</span> {ctxMenu.type === 'Activity' ? 'Add Activity' : 'Add Child WBS'}
                    </div>
                    <div className="px-4 py-2 hover:bg-red-600 hover:text-white cursor-pointer flex items-center gap-2" onClick={() => deleteItems(selIds)}>
                        <span className="material-symbols-outlined text-sm">delete</span> Delete Selected
                    </div>
                    <div className="h-px bg-slate-200 my-1"/>
                    <div className="px-4 py-2 hover:bg-slate-100 cursor-pointer flex items-center gap-2" onClick={() => setView(view === 'activities' ? 'projects' : 'activities')}>
                        <span className="material-symbols-outlined text-sm">swap_horiz</span> Switch View
                    </div>
                </div>
            )}

            <UserSettingsModal isOpen={activeModal === 'settings'} onClose={() => setActiveModal(null)} settings={userSettings} onSave={setUserSettings} />
            <CalendarsModal isOpen={activeModal === 'calendars'} onClose={() => setActiveModal(null)} calendars={data.calendars} onUpdateCalendars={c => setData({...data, calendars: c})} lang={userSettings.language} />
            <ProjectSettingsModal isOpen={activeModal === 'project_info'} onClose={() => setActiveModal(null)} projectData={data} onUpdateProject={(m, c) => setData({ ...data, meta: m, calendars: c })} lang={userSettings.language} />
            <AdminModal isOpen={activeModal === 'admin'} onClose={() => setActiveModal(null)} onSave={setAdminConfig} />
            <AboutModal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} customCopyright={adminConfig.copyrightText} currentUser={currentUser} lang={userSettings.language} />
            <PrintSettingsModal isOpen={activeModal === 'print'} onClose={() => setActiveModal(null)} onPrint={() => window.print()} lang={userSettings.language} />
            <HelpModal isOpen={activeModal === 'help'} onClose={() => setActiveModal(null)} />
            <CloudBackupModal isOpen={activeModal === 'cloud_backup'} onClose={() => setActiveModal(null)} lang={userSettings.language} />
        </div>
    );
};

export default App;
