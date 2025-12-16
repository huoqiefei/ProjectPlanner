

import React, { useState, useEffect, useRef, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ProjectData, ScheduleResult, UserSettings, PrintSettings, AdminConfig, User, FeatureKey } from './types';
import { calculateSchedule } from './services/scheduler';
import { authService } from './services/authService';
import Toolbar from './components/Toolbar';
import MenuBar from './components/MenuBar';
import CombinedView from './components/CombinedView';
import DetailsPanel from './components/DetailsPanel';
import ResourcesPanel from './components/ResourcesPanel';
import ProjectsPanel from './components/ProjectsPanel';
import ProjectSettingsModal from './components/ProjectSettingsModal';
import PrintSettingsModal from './components/PrintSettingsModal';
import BatchAssignModal from './components/BatchAssignModal';
import AuthPage from './components/AuthPage';
import { AlertModal, ConfirmModal, AboutModal, UserSettingsModal, AdminModal, HelpModal, ColumnSetupModal, UserStatsModal, CloudBackupModal } from './components/Modals';

const ContextMenu: React.FC<{ data: any, onClose: () => void, onAction: (act: string) => void }> = ({ data, onClose, onAction }) => {
    if (!data) return null;
    const { x, y, type, selIds } = data;
    const isMulti = selIds && selIds.length > 1;

    return (
        <div className="fixed inset-0 z-[100]" onClick={onClose} onContextMenu={(e) => e.preventDefault()}>
            <div 
                className="absolute bg-white border border-slate-300 shadow-lg py-1 rounded-sm min-w-[150px] text-xs select-none"
                style={{ top: y, left: x }}
                onClick={(e) => e.stopPropagation()}
            >
                {type === 'WBS' ? (
                    <>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('addWBS'); onClose(); }}>Add WBS Sibling</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('addAct'); onClose(); }}>Add Activity</div>
                        <div className="h-px bg-slate-200 my-1"></div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('cut'); onClose(); }}>Cut</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('copy'); onClose(); }}>Copy</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('paste'); onClose(); }}>Paste</div>
                        <div className="h-px bg-slate-200 my-1"></div>
                        <div className="px-3 py-1.5 hover:bg-red-600 hover:text-white cursor-pointer text-red-600" onClick={() => { onAction('delWBS'); onClose(); }}>Delete WBS</div>
                    </>
                ) : type === 'Activity' ? (
                     <>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('addActSame'); onClose(); }}>Add Activity</div>
                        <div className="h-px bg-slate-200 my-1"></div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('cut'); onClose(); }}>Cut</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('copy'); onClose(); }}>Copy</div>
                        <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('paste'); onClose(); }}>Paste</div>
                        <div className="h-px bg-slate-200 my-1"></div>
                        {isMulti && <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('assignRes'); onClose(); }}>Batch Assign Resources</div>}
                        <div className="px-3 py-1.5 hover:bg-red-600 hover:text-white cursor-pointer text-red-600" onClick={() => { onAction('delAct'); onClose(); }}>Delete Activity</div>
                     </>
                ) : (
                    <div className="px-3 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer" onClick={() => { onAction('renumber'); onClose(); }}>Renumber Activities</div>
                )}
            </div>
        </div>
    );
};

const LIMITS = {
    trial: { activities: 20, resources: 10 },
    authorized: { activities: 500, resources: 200 },
    premium: { activities: Infinity, resources: Infinity },
    admin: { activities: Infinity, resources: Infinity },
    administrator: { activities: Infinity, resources: Infinity }
};

const getLimits = (role: string) => {
    const r = role?.toLowerCase() || 'trial';
    if (r.includes('admin')) return LIMITS.admin;
    if (r.includes('premium')) return LIMITS.premium;
    if (r.includes('authorized')) return LIMITS.authorized;
    return LIMITS.trial;
};

// --- APP ---
const App: React.FC = () => {
    // Auth State
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    const [data, setData] = useState<ProjectData | null>(null);
    const [schedule, setSchedule] = useState<ScheduleResult>({ activities: [], wbsMap: {} });
    const [selIds, setSelIds] = useState<string[]>([]);
    const [view, setView] = useState<'projects' | 'activities' | 'resources'>('activities');
    const [ganttZoom, setGanttZoom] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('day');
    
    // View State
    const [showDetails, setShowDetails] = useState(true);
    const [showCritical, setShowCritical] = useState(true);
    const [showLogic, setShowLogic] = useState(true);

    // Modals State
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [modalData, setModalData] = useState<any>(null);

    const [ctx, setCtx] = useState<any>(null);
    const [isDirty, setIsDirty] = useState(false);
    const [clipboard, setClipboard] = useState<{ids: string[], type: 'Activities'|'WBS'|'Resources'} | null>(null);
    
    // Admin Config
    const [adminConfig, setAdminConfig] = useState<AdminConfig>({
        appName: 'Planner Web',
        copyrightText: 'Copyright © Planner.cn. All rights reserved.',
        enableWatermark: true,
        watermarkText: '',
        watermarkFontSize: 40,
        watermarkOpacity: 0.2,
        ganttBarRatio: 0.35
    });

    const [userSettings, setUserSettings] = useState<UserSettings>({ 
        dateFormat: 'YYYY-MM-DD', 
        language: 'en',
        uiSize: 'small',
        uiFontPx: 13,
        gridSettings: { showVertical: true, verticalInterval: 'auto', showHorizontal: true, showWBSLines: true },
        visibleColumns: ['id', 'name', 'duration', 'start', 'finish', 'float', 'preds'] 
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const createNew = useCallback(() => {
        const pCode = 'PROJ-01';
        const pName = 'New Project';
        const defCal = { id: 'cal-1', name: 'Standard 5-Day', isDefault:true, weekDays:[false,true,true,true,true,true,false], hoursPerDay:8, exceptions:[] };
        setData({
            wbs: [{id: pCode, name: pName, parentId:null}], activities: [], resources: [], assignments: [], calendars: [defCal],
            meta: { 
                title: pName, projectCode: pCode, defaultCalendarId: defCal.id, projectStartDate: new Date().toISOString().split('T')[0], 
                activityIdPrefix:'A', activityIdIncrement:10, resourceIdPrefix:'R', resourceIdIncrement:10 
            }
        });
        setIsDirty(false); setActiveModal(null);
    }, []);

    // Initial Load
    useEffect(() => {
        // 1. Load Admin Config
        const savedConfig = localStorage.getItem('planner_admin_config');
        if(savedConfig) {
            try { setAdminConfig({ ...adminConfig, ...JSON.parse(savedConfig) }); } catch(e) {}
        }

        // 2. Check Auth Session
        const user = authService.getCurrentUser();
        if (user) {
            setCurrentUser(user);
        }
        setAuthLoading(false);
    }, []);

    // Auto-create project on login if data is empty
    useEffect(() => {
        if (currentUser && !data) {
            createNew();
        }
    }, [currentUser, data, createNew]);

    useEffect(() => { 
        if(data) { 
            const res = calculateSchedule(data);
            setSchedule(res); 
            setIsDirty(true); 
        } 
    }, [data]);

    const checkPermission = (feature: FeatureKey): boolean => {
        if (!authService.hasPermission(currentUser, feature)) {
            // Special handling for PRINT: Allow but warn/watermark is handled in executePrint
            if (feature === 'PRINT') return true; 

            setModalData({ msg: `Access Denied. Feature '${feature}' requires Authorized or higher role.` });
            setActiveModal('alert');
            return false;
        }
        return true;
    };

    const handleLoginSuccess = (user: User) => {
        setCurrentUser(user);
        createNew(); // Ensure project is created immediately
    };

    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setData(null); // Clear project data on logout
    };

    const handleNew = () => {
        if(data && isDirty) {
            setModalData({ msg: "Unsaved changes. Continue?", action: createNew });
            setActiveModal('confirm');
        } else {
            createNew();
        }
    };

    const handleOpen = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                
                // LIMIT CHECK FOR IMPORT
                if (currentUser) {
                    const limits = getLimits(String(currentUser.role));
                    const actCount = json.activities?.length || 0;
                    if (actCount > limits.activities) {
                        setModalData({ msg: `Import failed. Project contains ${actCount} activities, but your plan allows max ${limits.activities}.` });
                        setActiveModal('alert');
                        return;
                    }
                }

                setData(json); setIsDirty(false);
            } catch (err) { alert("Failed to parse"); }
        };
        reader.readAsText(file);
    };

    const handleSave = () => {
        if (!checkPermission('SAVE_PROJECT')) return;
        if (!data) return;
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${data.meta.title.replace(/\s+/g, '_')}.json`;
        link.click();
        setIsDirty(false);
    };

    const handleUpdate = (id: string, field: string, val: any) => {
        if (!data) return;
        const isWBS = data.wbs.some(w => w.id === id);
        if (isWBS) {
            if (field === 'id') {
                if (data.wbs.some(w => w.id === val)) return;
                setData(p => p ? {
                        ...p, 
                        wbs: p.wbs.map(w => w.id === id ? { ...w, id: val } : (w.parentId === id ? { ...w, parentId: val } : w)), 
                        activities: p.activities.map(a => a.wbsId === id ? { ...a, wbsId: val } : a)
                    } : null);
            } else {
                setData(p => p ? { ...p, wbs: p.wbs.map(w => w.id === id ? { ...w, [field]: val } : w) } : null);
            }
        } else {
            if (field === 'predecessors') { 
                const preds = Array.isArray(val) ? val : String(val).split(',').filter(x => x).map(s => {
                    const m = s.trim().match(/^([a-zA-Z0-9.\-_]+)(FS|SS|FF|SF)?([+-]?\d+)?$/);
                    return m ? { activityId: m[1], type: (m[2] as any) || 'FS', lag: parseInt(m[3] || '0') } : null;
                }).filter(x => x !== null) as any[];
                setData(p => p ? { ...p, activities: p.activities.map(a => a.id === id ? { ...a, predecessors: preds } : a) } : null);
            } else {
                setData(p => p ? { ...p, activities: p.activities.map(a => a.id === id ? { ...a, [field]: (field === 'duration' || field === 'budgetedCost') ? Number(val) : val } : a) } : null);
            }
        }
    };
    
    const handleProjectUpdate = (meta: ProjectData['meta'], calendars: ProjectData['calendars']) => {
        setData(prev => {
            if(!prev) return null;
            let newWbs = [...prev.wbs];
            let newActs = [...prev.activities];

            if (meta.title !== prev.meta.title) newWbs = newWbs.map(w => (!w.parentId || w.parentId === 'null') ? { ...w, name: meta.title } : w);
            if (meta.projectCode !== prev.meta.projectCode) {
                const root = newWbs.find(w => !w.parentId || w.parentId === 'null');
                if (root) {
                    const oldId = root.id;
                    const newId = meta.projectCode;
                    if (!newWbs.some(w => w.id === newId)) {
                         newWbs = newWbs.map(w => {
                             if (w.id === oldId) return { ...w, id: newId };
                             if (w.parentId === oldId) return { ...w, parentId: newId };
                             return w;
                         });
                         newActs = newActs.map(a => a.wbsId === oldId ? { ...a, wbsId: newId } : a);
                    }
                }
            }
            return { ...prev, meta, calendars, wbs: newWbs, activities: newActs };
        });
    };

    const handleDeleteItems = (ids: string[]) => {
        setData(p => {
             if(!p) return null;
             if(view === 'resources') return { ...p, resources: p.resources.filter(r => !ids.includes(r.id)) };
             if(view === 'projects') return { ...p, wbs: p.wbs.filter(w => !ids.includes(w.id)), activities: p.activities.filter(a => !ids.includes(a.wbsId)) };
             const wbsToDelete = p.wbs.filter(w => ids.includes(w.id));
             if (wbsToDelete.length > 0) return { ...p, wbs: p.wbs.filter(w => !ids.includes(w.id)) };
             else return { ...p, activities: p.activities.filter(a => !ids.includes(a.id)), assignments: p.assignments.filter(a => !ids.includes(a.activityId)) };
        });
        setSelIds([]);
    };

    const handleRenumberActivities = () => {
        if (!data) return;
        const prefix = data.meta.activityIdPrefix || 'A';
        const increment = data.meta.activityIdIncrement || 10;
        let counter = 0;
        const newActivities = data.activities.map((act) => { counter += increment; return { ...act, newId: `${prefix}${counter}` }; });
        const idMap: Record<string, string> = {};
        newActivities.forEach(a => idMap[a.id] = a.newId);
        const finalActivities = newActivities.map(act => ({ ...act, id: act.newId, predecessors: act.predecessors.map(p => ({ ...p, activityId: idMap[p.activityId] || p.activityId })) }));
        const cleanActivities = finalActivities.map(({newId, ...rest}) => rest);
        const newAssignments = data.assignments.map(asg => ({ ...asg, activityId: idMap[asg.activityId] || asg.activityId }));
        setData({ ...data, activities: cleanActivities, assignments: newAssignments });
        setCtx(null);
    };

    const handleCtxAction = (act: string) => {
        const { id, selIds: contextSelIds } = ctx; 
        const targets = (contextSelIds && contextSelIds.length > 0) ? contextSelIds : [id];
        setCtx(null);
        if (!data || !currentUser) return;

        // --- LIMIT CHECK FOR ACTIVITIES ---
        const limits = getLimits(String(currentUser.role));
        if ((act === 'addAct' || act === 'addActSame') && data.activities.length >= limits.activities) {
            setModalData({ msg: `Plan limit reached. Your '${currentUser.role}' plan allows max ${limits.activities} activities. Upgrade to add more.` });
            setActiveModal('alert');
            return;
        }

        if (act === 'renumber') {
            setModalData({ msg: `Renumber all activities?`, action: handleRenumberActivities });
            setActiveModal('confirm');
        }
        if (act === 'addAct' || act === 'addActSame') {
            const wbsId = act === 'addActSame' ? data.activities.find(a => a.id === id)?.wbsId : id;
            if (!wbsId) return;
            const max = data.activities.reduce((m, a) => { const match = a.id.match(/(\d+)/); return match ? Math.max(m, parseInt(match[1])) : m; }, 1000);
            const newId = (data.meta.activityIdPrefix || 'A') + (max + (data.meta.activityIdIncrement || 10));
            setData(p => p ? { ...p, activities: [...p.activities, { id: newId, name: 'New Task', wbsId, duration: 5, predecessors: [], budgetedCost: 0, calendarId: p.meta.defaultCalendarId, activityType: 'Task', startDate: new Date(), endDate: new Date(), earlyStart: new Date(), earlyFinish: new Date(), lateStart: new Date(), lateFinish: new Date(), totalFloat: 0 }] } : null);
        }
        if (act === 'addWBS') {
            const newId = id + '.' + (data.wbs.filter(w => w.parentId === id).length + 1);
            setData(p => p ? { ...p, wbs: [...p.wbs, { id: newId, name: 'New WBS', parentId: id }] } : null);
        }
        if (act === 'delAct') handleDeleteItems(targets);
        if (act === 'delWBS') {
            setModalData({ msg: "Delete WBS and all its activities?", action: () => setData(p => p ? { ...p, wbs: p.wbs.filter(w => w.id !== id) } : null) });
            setActiveModal('confirm');
        }
        if (act === 'assignRes') {
            setModalData({ ids: targets });
            setActiveModal('batchRes');
        }
    };

    const handleBatchAssign = (resourceIds: string[], units: number) => {
        if (!data || !modalData) return;
        if (!checkPermission('BATCH_ASSIGN')) return;

        const actIds = modalData.ids as string[];
        let newAssignments = [...data.assignments].filter(a => !(actIds.includes(a.activityId) && resourceIds.includes(a.resourceId)));
        actIds.forEach(aid => {
            const act = data.activities.find(a => a.id === aid);
            if(!act) return;
            resourceIds.forEach(rid => {
                const res = data.resources.find(r => r.id === rid);
                let total = units;
                if(res?.type !== 'Material' && act.duration > 0) total = units * act.duration;
                newAssignments.push({ activityId: aid, resourceId: rid, units: total });
            });
        });
        setData(p => p ? { ...p, assignments: newAssignments } : null);
        setActiveModal(null);
    };

    const handleAssignUpdate = (newAssignments: any) => {
        setData(p => p ? { ...p, assignments: newAssignments } : null);
    };

    // Use useCallback to keep reference stable for useEffect
    const handleMenuAction = useCallback((action: string) => {
        switch(action) {
            case 'import': fileInputRef.current?.click(); break;
            case 'export': if(checkPermission('EXPORT_FILE')) handleSave(); break;
            case 'print': setActiveModal('print'); break; // Permission check handled inside
            case 'copy': 
                 if (selIds.length > 0 && data) {
                    if (view === 'resources') setClipboard({ ids: selIds, type: 'Resources' });
                    else if (data.wbs.some(w => selIds.includes(w.id))) setClipboard({ ids: selIds, type: 'WBS' });
                    else setClipboard({ ids: selIds, type: 'Activities' });
                 }
                 break;
            case 'cut':
                 if(selIds.length) { 
                     if (data) {
                        if (view === 'resources') setClipboard({ ids: selIds, type: 'Resources' });
                        else if (data.wbs.some(w => selIds.includes(w.id))) setClipboard({ ids: selIds, type: 'WBS' });
                        else setClipboard({ ids: selIds, type: 'Activities' });
                        handleDeleteItems(selIds);
                     }
                 }
                 break;
            case 'paste':
                if(clipboard && data && currentUser) {
                    const limits = getLimits(String(currentUser.role));
                    
                    if (clipboard.type === 'Resources') {
                        // Resource Limit Check
                        if (data.resources.length + clipboard.ids.length > limits.resources) {
                            setModalData({ msg: `Paste failed. Resource limit (${limits.resources}) exceeded.` });
                            setActiveModal('alert');
                            return;
                        }

                        const newResources = clipboard.ids.map(id => {
                            const original = data.resources.find(r => r.id === id);
                            if(!original) return null;
                             const suffix = Math.floor(Math.random() * 1000);
                             return { ...original, id: original.id + '-CP' + suffix, name: original.name + ' (Copy)' };
                        }).filter(x => x) as any;
                        setData(p => p ? { ...p, resources: [...p.resources, ...newResources] } : null);
                    } else if (clipboard.type === 'Activities') {
                        // Activity Limit Check
                        if (data.activities.length + clipboard.ids.length > limits.activities) {
                            setModalData({ msg: `Paste failed. Activity limit (${limits.activities}) exceeded.` });
                            setActiveModal('alert');
                            return;
                        }

                        const targetWbsId = selIds.length > 0 ? (data.activities.find(a => a.id === selIds[0])?.wbsId || data.wbs.find(w=>w.id === selIds[0])?.id) : (data.wbs.length > 0 ? data.wbs[0].id : null);
                        if (targetWbsId) {
                            const prefix = data.meta.activityIdPrefix || 'A';
                            const increment = data.meta.activityIdIncrement || 10;
                            let maxVal = 0;
                            data.activities.forEach(a => {
                                const match = a.id.match(/(\d+)$/);
                                if (match) { const val = parseInt(match[1]); if (val > maxVal) maxVal = val; }
                            });
                            const newActivities = clipboard.ids.map((oldId, index) => {
                                const original = data.activities.find(a => a.id === oldId); 
                                if(!original) return null; 
                                const nextVal = maxVal + (increment * (index + 1));
                                const newId = `${prefix}${nextVal}`;
                                return { ...original, id: newId, name: original.name, wbsId: targetWbsId, predecessors: [] };
                            }).filter(x => x !== null) as any[];
                            setData(p => p ? { ...p, activities: [...p.activities, ...newActivities] } : null);
                        }
                    }
                }
                break;
            case 'columns': setActiveModal('columns'); break;
            case 'project_info': setActiveModal('project_settings'); break;
            case 'view_activities': setView('activities'); break;
            case 'view_resources': setView('resources'); break;
            case 'settings': setActiveModal('user_settings'); break;
            case 'help': setActiveModal('help'); break;
            case 'about': setActiveModal('about'); break;
            case 'admin': if(checkPermission('ADMIN_CONFIG')) setActiveModal('admin'); break;
        }
    }, [data, selIds, view, clipboard, isDirty, currentUser]);

    // Global Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Allow copy/paste in inputs, but block for the app level if not in input
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
            
            if (!isInput && (e.ctrlKey || e.metaKey)) {
                if (e.key === 'c') { e.preventDefault(); handleMenuAction('copy'); }
                if (e.key === 'x') { e.preventDefault(); handleMenuAction('cut'); }
                if (e.key === 'v') { e.preventDefault(); handleMenuAction('paste'); }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleMenuAction]);

    // --- ENHANCED PRINT LOGIC (P6 Style: Fit TimeScale + Readable Table) ---
    const executePrint = async (settings: PrintSettings) => {
        // Enforce Watermark for Trial Users regardless of setting
        const forceWatermark = currentUser?.role === 'trial';
        const effectiveConfig = forceWatermark 
            ? { ...adminConfig, enableWatermark: true, watermarkText: "TRIAL VERSION - Planner.cn", watermarkOpacity: 0.15 } 
            : adminConfig;

        if (view !== 'activities') setView('activities');
        await new Promise(r => setTimeout(r, 200));

        const original = document.querySelector('.combined-view-container');
        if (!original) {
            alert("Could not find view to print.");
            return;
        }

        // 0. Calculate Paper Dimensions & DPI
        const dims: Record<string, {w: number, h: number}> = { 'a4': {w: 595.28, h: 841.89}, 'a3': {w: 841.89, h: 1190.55}, 'a2': {w: 1190.55, h: 1683.78}, 'a1': {w: 1683.78, h: 2383.94} };
        const isLandscape = settings.orientation === 'landscape';
        const pagePtW = isLandscape ? dims[settings.paperSize].h : dims[settings.paperSize].w;
        const pagePtH = isLandscape ? dims[settings.paperSize].w : dims[settings.paperSize].h;
        
        // Use a higher multiplier to ensure crisp text when rendered to image
        const ptToPx = 3; 
        const marginPt = 20;
        const marginPx = marginPt * ptToPx;
        const pagePxW = pagePtW * ptToPx;
        const contentPxW = pagePxW - (marginPx * 2);

        // 1. Setup Staging Area (Clone)
        const clone = original.cloneNode(true) as HTMLElement;
        document.body.appendChild(clone);
        
        clone.style.position = 'absolute';
        clone.style.top = '-10000px';
        clone.style.left = '-10000px';
        clone.style.height = 'auto'; 
        clone.style.width = 'fit-content';
        clone.style.overflow = 'visible';
        clone.style.backgroundColor = 'white';
        clone.style.border = 'none'; 
        clone.style.padding = '0';

        // 2. Strict Column Hiding & Width Calc
        const allowedCols = userSettings.visibleColumns;
        const headerCells = clone.querySelectorAll('.p6-header > div');
        let tableWidth = 0;
        
        const isColVisible = (el: Element) => {
            const colId = el.getAttribute('data-col');
            return colId && allowedCols.includes(colId);
        };

        headerCells.forEach((cell: any) => {
            if(isColVisible(cell)) {
                const w = parseFloat(cell.style.width || '0');
                if(w>0) tableWidth += w;
            } else {
                cell.style.display = 'none';
            }
        });

        const cells = clone.querySelectorAll('.p6-cell');
        cells.forEach((cell: any) => {
            if(!isColVisible(cell)) cell.style.display = 'none';
            else {
                cell.style.display = 'flex'; 
                cell.style.alignItems = 'center'; 
                cell.style.overflow = 'visible'; 
                cell.style.paddingTop = '0px'; 
                cell.style.paddingBottom = '0px'; 
                const span = cell.querySelector('span');
                if(span) { 
                    span.style.textOverflow = 'clip'; 
                    span.style.overflow = 'visible'; 
                    span.style.whiteSpace = 'nowrap';
                    span.style.lineHeight = 'normal'; 
                    span.style.height = 'auto'; 
                }
            }
        });

        const tableWrapper = clone.querySelector('.border-r.flex-col') as HTMLElement; 
        if(tableWrapper) {
            tableWrapper.style.width = `${tableWidth}px`;
            tableWrapper.style.minWidth = `${tableWidth}px`;
            tableWrapper.style.flexShrink = '0';
        }

        // --- 3. SMART SCALING & CROPPING ---
        const zoomMap: Record<string, number> = { day: 40, week: 15, month: 5, quarter: 2, year: 0.5 };
        const px = zoomMap[ganttZoom] || 40;

        // Calculate Project Extents
        let minStart = new Date(data!.meta.projectStartDate).getTime();
        let maxEnd = minStart;
        if (schedule.activities.length > 0) {
            const starts = schedule.activities.map(a => a.startDate.getTime());
            const ends = schedule.activities.map(a => a.endDate.getTime());
            minStart = Math.min(...starts);
            maxEnd = Math.max(...ends);
        }
        
        const projectStartTs = new Date(data!.meta.projectStartDate).getTime();
        // Calculate crop range in pixels
        // Padding: 2 days before, 5 days after
        const paddingDays = 5;
        const visibleStartTs = minStart - (2 * 86400000);
        const visibleEndTs = maxEnd + (5 * 86400000);
        
        const offsetPx = ((visibleStartTs - projectStartTs) / 86400000) * px;
        const durationPx = ((visibleEndTs - visibleStartTs) / 86400000) * px;
        
        const croppedGanttWidth = Math.max(200, durationPx);

        // Adjust SVGs viewBox to crop
        const allSvgs = clone.querySelectorAll('svg');
        allSvgs.forEach((svg: any) => {
            const currentH = svg.getAttribute('height') || '100';
            // Set viewBox to start at offsetPx with calculated width
            svg.setAttribute('viewBox', `${offsetPx} 0 ${croppedGanttWidth} ${currentH}`);
            svg.setAttribute('width', `${croppedGanttWidth}px`); 
            svg.setAttribute('preserveAspectRatio', 'none'); 
        });

        const ganttWrappers = clone.querySelectorAll('.gantt-component, .gantt-header-wrapper, .gantt-body-wrapper');
        ganttWrappers.forEach((el: any) => {
            el.style.width = `${croppedGanttWidth}px`;
            el.style.minWidth = `${croppedGanttWidth}px`;
            el.style.overflow = 'hidden';
        });

        // Calculate Scaling Factor
        // If "Fit to Page", we scale the image down to fit PDF width.
        // If Custom %, we scale accordingly.
        let outputScale = 1.0;
        if (settings.scaling === 'fit') {
            // Fit logic handled by PDF fitRatio below (image fits content width)
            // But we can ensure the rendered canvas isn't insanely huge if not needed
        } else if (settings.scaling) {
            // Logic handled in PDF generation phase mainly, but here we prep structure
        }

        // --- 4. SEPARATE HEADERS FROM BODY ---
        const tableHeader = clone.querySelector('.p6-header') as HTMLElement;
        const tableBody = clone.querySelector('.p6-table-body') as HTMLElement;
        
        const ganttHeader = clone.querySelector('.gantt-header-wrapper') as HTMLElement;
        const ganttBody = clone.querySelector('.gantt-body-wrapper') as HTMLElement;

        if (!tableHeader || !tableBody || !ganttHeader || !ganttBody) {
            document.body.removeChild(clone);
            alert("Print Error: Could not parse view structure.");
            return;
        }

        const finalTotalWidth = tableWidth + croppedGanttWidth;

        const headerAssembly = document.createElement('div');
        headerAssembly.style.display = 'flex';
        headerAssembly.style.width = `${finalTotalWidth}px`;
        headerAssembly.style.backgroundColor = 'white';
        headerAssembly.style.borderBottom = '1px solid #cbd5e1';
        
        tableHeader.style.width = `${tableWidth}px`;
        tableHeader.style.flexShrink = '0';
        headerAssembly.appendChild(tableHeader);
        
        ganttHeader.style.width = `${croppedGanttWidth}px`;
        ganttHeader.style.border = 'none'; 
        headerAssembly.appendChild(ganttHeader);

        const bodyAssembly = document.createElement('div');
        bodyAssembly.style.display = 'flex';
        bodyAssembly.style.width = `${finalTotalWidth}px`;
        bodyAssembly.style.backgroundColor = 'white';
        
        tableBody.style.width = `${tableWidth}px`;
        tableBody.style.height = 'auto';
        tableBody.style.overflow = 'visible';
        tableBody.style.flexShrink = '0';
        bodyAssembly.appendChild(tableBody);

        ganttBody.style.width = `${croppedGanttWidth}px`;
        ganttBody.style.height = 'auto';
        ganttBody.style.overflow = 'visible';
        bodyAssembly.appendChild(ganttBody);

        const tableRows = tableBody.querySelectorAll('.p6-row');
        tableRows.forEach((row: any) => {
            const h = row.style.height; 
            if(h) {
                row.style.minHeight = h;
                row.style.height = 'auto'; 
                row.style.overflow = 'visible'; 
            }
        });

        const staging = document.createElement('div');
        staging.style.position = 'absolute';
        staging.style.top = '-10000px';
        staging.style.left = '-10000px';
        staging.style.backgroundColor = 'white';
        staging.appendChild(headerAssembly);
        staging.appendChild(bodyAssembly);
        document.body.appendChild(staging);

        try {
            // High Scale Factor for crisp text
            const captureScale = 4; 
            const headerCanvas = await html2canvas(headerAssembly, { scale: captureScale, logging: false });
            const bodyCanvas = await html2canvas(bodyAssembly, { scale: captureScale, logging: false });
            
            document.body.removeChild(clone);
            document.body.removeChild(staging);

            const pdf = new jsPDF(isLandscape ? 'l' : 'p', 'pt', [pagePtW, pagePtH]);
            const pdfContentWidth = pagePtW - (marginPt * 2);
            
            // Calculate Fit Ratio
            let fitRatio = pdfContentWidth / (headerCanvas.width / captureScale);
            
            // Apply Custom Scaling if not "Fit to Page"
            if (settings.scaling !== 'fit') {
                const scalePerc = parseInt(settings.scaling) / 100;
                fitRatio = scalePerc; 
            }

            const pdfHeaderH = (headerCanvas.height / captureScale) * fitRatio;
            const pdfBodyTotalH = (bodyCanvas.height / captureScale) * fitRatio;
            
            let yOffset = 0; // source y position in canvas (scaled)
            let heightLeftPts = pdfBodyTotalH; 

            const pdfContentHeight = pagePtH - (marginPt * 2);

            let wmDataUrl = '';
            if (effectiveConfig.enableWatermark) {
                const wmCanvas = document.createElement('canvas');
                wmCanvas.width = pagePtW; 
                wmCanvas.height = pagePtH;
                const ctx = wmCanvas.getContext('2d');
                if (ctx) {
                    ctx.save();
                    ctx.translate(pagePtW/2, pagePtH/2);
                    ctx.rotate(-30 * Math.PI / 180);
                    ctx.translate(-pagePtW/2, -pagePtH/2);
                    ctx.globalAlpha = effectiveConfig.watermarkOpacity || 0.2;
                    const imgSource = effectiveConfig.watermarkImage || effectiveConfig.appLogo;
                    if (imgSource) {
                        const img = new Image();
                        img.src = imgSource;
                        await new Promise(r => img.onload = r);
                        const aspect = img.width / img.height;
                        const drawW = Math.min(400, img.width);
                        const drawH = drawW / aspect;
                        ctx.drawImage(img, (pagePtW - drawW)/2, (pagePtH - drawH)/2, drawW, drawH);
                    }
                    if (effectiveConfig.watermarkText || (!imgSource && effectiveConfig.copyrightText)) {
                        const text = effectiveConfig.watermarkText || effectiveConfig.appName;
                        ctx.font = `bold ${effectiveConfig.watermarkFontSize || 40}px Arial`;
                        ctx.fillStyle = '#94a3b8';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        const textY = imgSource ? (pagePtH/2 + 150) : pagePtH/2;
                        ctx.fillText(text, pagePtW/2, textY);
                    }
                    ctx.restore();
                    wmDataUrl = wmCanvas.toDataURL('image/png');
                }
            }

            while (heightLeftPts > 0) {
                // Add Header on every page
                pdf.addImage(headerCanvas.toDataURL('image/png', 1.0), 'PNG', marginPt, marginPt, (headerCanvas.width / captureScale) * fitRatio, pdfHeaderH);
                pdf.setDrawColor(203, 213, 225); 
                pdf.rect(marginPt, marginPt, (headerCanvas.width / captureScale) * fitRatio, pdfHeaderH);

                const availableHPts = pdfContentHeight - pdfHeaderH - 10;
                const sliceHPts = Math.min(heightLeftPts, availableHPts);
                
                // Calculate source dimensions
                // Source height in canvas pixels = sliceHPts / fitRatio * captureScale
                const sourceH = (sliceHPts / fitRatio) * captureScale;
                const sourceY = (yOffset / fitRatio) * captureScale;
                
                const sliceCanvas = document.createElement('canvas');
                sliceCanvas.width = bodyCanvas.width;
                sliceCanvas.height = sourceH; 
                
                const sCtx = sliceCanvas.getContext('2d');
                if (sCtx) {
                    sCtx.drawImage(
                        bodyCanvas, 
                        0, sourceY, bodyCanvas.width, sourceH, 
                        0, 0, sliceCanvas.width, sliceCanvas.height 
                    );
                    pdf.addImage(sliceCanvas.toDataURL('image/png', 1.0), 'PNG', marginPt, marginPt + pdfHeaderH, (bodyCanvas.width / captureScale) * fitRatio, sliceHPts);
                    pdf.rect(marginPt, marginPt + pdfHeaderH, (bodyCanvas.width / captureScale) * fitRatio, sliceHPts);
                }

                if (wmDataUrl) {
                    pdf.addImage(wmDataUrl, 'PNG', 0, 0, pagePtW, pagePtH, undefined, 'FAST');
                }

                heightLeftPts -= sliceHPts;
                yOffset += sliceHPts; // Increment PDF points

                const pageNum = pdf.getNumberOfPages();
                pdf.setFontSize(9);
                pdf.setTextColor(100);
                pdf.text(`Page ${pageNum}`, pagePtW - marginPt, pagePtH - 10, { align: 'right' });
                pdf.text(adminConfig.appName, marginPt, pagePtH - 10, { align: 'left' });

                if (heightLeftPts > 1) pdf.addPage();
            }

            window.open(pdf.output('bloburl'), '_blank');

        } catch (e) {
            console.error("Print Error", e);
            alert("Print generation failed. Please try again.");
            if(document.body.contains(clone)) document.body.removeChild(clone);
            if(document.body.contains(staging)) document.body.removeChild(staging);
        }
    };

    const handleAddProject = () => {
        const pCode = `PROJ-${data?.wbs.length || 0 + 1}`;
        setData(p => p ? {
            ...p,
            wbs: [...p.wbs, { id: pCode, name: 'New Project', parentId: null, remarks: '', calendarId: '' }]
        } : null);
    };

    const handleUpdateWBS = (id: string, field: string, val: any) => {
        setData(p => p ? {
            ...p,
            wbs: p.wbs.map(w => w.id === id ? { ...w, [field]: val } : w)
        } : null);
    };

    const handleDeleteProject = (id: string) => {
        handleDeleteItems([id]); // Re-use delete logic which handles recursive deletion
    };

    if (authLoading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-100">Loading...</div>;

    if (!currentUser) {
        return <AuthPage onLoginSuccess={handleLoginSuccess} adminConfig={adminConfig} />;
    }

    if (!data) return (
        <div className="h-full w-full flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-slate-100" onClick={() => setCtx(null)}>
            <div className="h-8 flex-shrink-0 relative z-50">
                <MenuBar onAction={handleMenuAction} lang={userSettings.language} uiSize={userSettings.uiSize} uiFontPx={userSettings.uiFontPx} currentUser={currentUser} />
            </div>
            
            <Toolbar 
                onNew={handleNew} 
                onOpen={(e) => handleOpen(e)}
                onSave={handleSave}
                onPrint={() => setActiveModal('print')} 
                onSettings={() => setActiveModal('project_settings')} 
                title={data.meta.title} 
                isDirty={isDirty}
                uiFontPx={userSettings.uiFontPx}
                currentUser={currentUser}
                onLogout={handleLogout}
                onUserStats={() => setActiveModal('user_stats')}
                onCloudBackup={() => setActiveModal('cloud_backup')}
                showCritical={showCritical}
                setShowCritical={setShowCritical}
                showLogic={showLogic}
                setShowLogic={setShowLogic}
                lang={userSettings.language}
            />
            <input type="file" ref={fileInputRef} onChange={handleOpen} className="hidden" accept=".json" />

            <div className="flex-grow flex flex-col overflow-hidden">
                <div className="bg-slate-300 border-b flex px-2 pt-1 gap-1 shrink-0 justify-between items-end" style={{ fontSize: `${userSettings.uiFontPx || 13}px` }}>
                    <div className="flex gap-1">
                        <button onClick={() => setView('projects')} className={`px-4 py-1 font-bold rounded-t ${view === 'projects' ? 'bg-white text-blue-900' : 'text-slate-600 hover:bg-slate-200'}`}>
                            {userSettings.language === 'zh' ? '项目' : 'Projects'}
                        </button>
                        {['Activities', 'Resources'].map(v => (
                            <button key={v} onClick={() => setView(v.toLowerCase() as any)} className={`px-4 py-1 font-bold rounded-t ${view === v.toLowerCase() ? 'bg-white text-blue-900' : 'text-slate-600 hover:bg-slate-200'}`}>
                                {v === 'Activities' ? (userSettings.language === 'zh' ? '作业' : 'Activities') : (userSettings.language === 'zh' ? '资源' : 'Resources')}
                            </button>
                        ))}
                    </div>
                    {/* Zoom Controls moved here */}
                    {view === 'activities' && (
                        <div className="flex gap-1 mb-1 mr-2">
                            {(['day', 'week', 'month', 'quarter', 'year'] as const).map(z => (
                                <button 
                                    key={z} 
                                    onClick={() => setGanttZoom(z)}
                                    className={`px-2 py-0.5 text-[10px] uppercase font-bold border rounded shadow-sm ${ganttZoom === z ? 'bg-blue-600 text-white border-blue-700' : 'bg-white text-slate-600 hover:bg-slate-100'}`}
                                >
                                    {userSettings.language === 'zh' ? (z === 'day' ? '日' : z === 'week' ? '周' : z === 'month' ? '月' : z === 'quarter' ? '季' : '年') : z}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {view === 'projects' && (
                    <ProjectsPanel 
                        data={data}
                        wbsMap={schedule.wbsMap}
                        onUpdateWBS={handleUpdateWBS}
                        onAddProject={handleAddProject}
                        onDeleteProject={handleDeleteProject}
                        userSettings={userSettings}
                    />
                )}

                {view === 'activities' && (
                    <>
                        <div className="flex-grow overflow-hidden bg-white relative flex flex-col combined-view-container">
                            <CombinedView 
                                projectData={data} 
                                schedule={schedule.activities} 
                                wbsMap={schedule.wbsMap} 
                                onUpdate={handleUpdate} 
                                selectedIds={selIds} 
                                onSelect={(ids, multi) => setSelIds(ids)} 
                                onCtx={setCtx} 
                                userSettings={userSettings}
                                zoomLevel={ganttZoom}
                                onZoomChange={setGanttZoom}
                                onDeleteItems={handleDeleteItems}
                                showCritical={showCritical}
                                showRelations={showLogic}
                            />
                        </div>
                        <DetailsPanel 
                            activity={schedule.activities.find(a => selIds[selIds.length - 1] === a.id)} 
                            resources={data.resources} 
                            assignments={data.assignments} 
                            calendars={data.calendars} 
                            onUpdate={handleUpdate} 
                            onAssignUpdate={handleAssignUpdate} 
                            userSettings={userSettings}
                            allActivities={schedule.activities}
                            isVisible={showDetails}
                            onToggle={() => setShowDetails(!showDetails)}
                            selectedIds={selIds}
                            onBatchAssign={(ids) => { setModalData({ ids }); setActiveModal('batchRes'); }}
                        />
                    </>
                )}
                {view === 'resources' && (
                    <ResourcesPanel 
                        resources={data.resources} 
                        assignments={data.assignments} 
                        activities={schedule.activities} 
                        onUpdateResources={(r) => setData(p => p ? { ...p, resources: r } : null)}
                        userSettings={userSettings}
                        selectedIds={selIds}
                        onSelect={(ids) => setSelIds(ids)}
                        userRole={String(currentUser.role)}
                    />
                )}
            </div>

            <ContextMenu data={ctx} onClose={() => setCtx(null)} onAction={handleCtxAction} />
            <AlertModal isOpen={activeModal === 'alert'} msg={modalData?.msg} onClose={() => setActiveModal(null)} />
            <ConfirmModal 
                isOpen={activeModal === 'confirm'} 
                msg={modalData?.msg} 
                onConfirm={() => { modalData?.action?.(); setActiveModal(null); }} 
                onCancel={() => setActiveModal(null)}
                lang={userSettings.language} 
            />
            <AboutModal 
                isOpen={activeModal === 'about'} 
                onClose={() => setActiveModal(null)} 
                customCopyright={adminConfig.copyrightText} 
                currentUser={currentUser}
                lang={userSettings.language}
                dataSize={JSON.stringify(data).length}
            />
            <HelpModal isOpen={activeModal === 'help'} onClose={() => setActiveModal(null)} />
            <UserSettingsModal isOpen={activeModal === 'user_settings'} settings={userSettings} onSave={setUserSettings} onClose={() => setActiveModal(null)} />
            <PrintSettingsModal isOpen={activeModal === 'print'} onClose={() => setActiveModal(null)} onPrint={executePrint} lang={userSettings.language} />
            <ColumnSetupModal isOpen={activeModal === 'columns'} onClose={() => setActiveModal(null)} visibleColumns={userSettings.visibleColumns} onSave={(cols) => setUserSettings({...userSettings, visibleColumns: cols})} lang={userSettings.language} />
            <ProjectSettingsModal isOpen={activeModal === 'project_settings'} onClose={() => setActiveModal(null)} projectData={data} onUpdateProject={handleProjectUpdate} />
            <BatchAssignModal isOpen={activeModal === 'batchRes'} onClose={() => setActiveModal(null)} resources={data.resources} onAssign={handleBatchAssign} lang={userSettings.language} selectedActivityIds={modalData?.ids || []} />
            <AdminModal isOpen={activeModal === 'admin'} onClose={() => setActiveModal(null)} onSave={setAdminConfig} />
            <UserStatsModal isOpen={activeModal === 'user_stats'} onClose={() => setActiveModal(null)} />
            <CloudBackupModal isOpen={activeModal === 'cloud_backup'} onClose={() => setActiveModal(null)} lang={userSettings.language} />
        </div>
    );
};

export default App;