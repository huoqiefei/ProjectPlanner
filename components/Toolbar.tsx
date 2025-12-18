
import React, { useRef, useState, useEffect } from 'react';
import { User } from '../types';
import { useTranslation } from '../utils/i18n';

interface ToolbarProps {
    onNew: () => void;
    onOpen: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onPrint: () => void;
    onSettings: () => void;
    title?: string;
    isDirty: boolean;
    uiFontPx?: number;
    currentUser: User | null;
    onLogout: () => void;
    onUserStats: () => void;
    onCloudBackup: () => void;
    showCritical: boolean;
    setShowCritical: (v: boolean) => void;
    showLogic: boolean;
    setShowLogic: (v: boolean) => void;
    lang: 'en' | 'zh';
}

const Toolbar: React.FC<ToolbarProps> = ({ 
    onNew, onOpen, onSave, onPrint, onSettings, title, isDirty, uiFontPx, currentUser, 
    onLogout, onUserStats, onCloudBackup, showCritical, setShowCritical, showLogic, setShowLogic, lang 
}) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation(lang);

    const fontSize = uiFontPx || 13;
    const btnSize = Math.max(30, fontSize * 2.2); 
    const iconSize = Math.max(18, fontSize * 1.4); 

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'administrator';

    return (
        <div className="bg-slate-100 p-1 border-b border-slate-300 flex items-center gap-1 shadow-sm flex-shrink-0 select-none relative z-40" style={{ height: `${btnSize + 8}px` }}>
            <button onClick={onNew} style={{ width: btnSize, height: btnSize }} className="flex items-center justify-center hover:bg-slate-200 rounded text-slate-700 transition-colors" title={t('NewProject')}>
                <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>add_box</span>
            </button>
            <button onClick={() => fileRef.current?.click()} style={{ width: btnSize, height: btnSize }} className="flex items-center justify-center hover:bg-slate-200 rounded text-slate-700 transition-colors" title={t('OpenProject')}>
                <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>file_open</span>
            </button>
            <input type="file" ref={fileRef} onChange={onOpen} className="hidden" accept=".json" />
            
            {title && (
                <>
                    <button onClick={onSave} style={{ width: btnSize, height: btnSize }} className="flex items-center justify-center hover:bg-slate-200 rounded text-slate-700 transition-colors" title={t('SaveProject')}>
                         <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>save</span>
                    </button>
                    <div className="w-px bg-slate-300 mx-1" style={{ height: btnSize }}></div>
                    <button onClick={onPrint} style={{ width: btnSize, height: btnSize }} className="flex items-center justify-center hover:bg-slate-200 rounded text-slate-700 transition-colors" title={t('PrintPreview')}>
                         <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>print</span>
                    </button>
                    <div className="w-px bg-slate-300 mx-1" style={{ height: btnSize }}></div>
                    
                    <button 
                        onClick={() => setShowLogic(!showLogic)} 
                        style={{ width: btnSize, height: btnSize }} 
                        className={`flex items-center justify-center rounded transition-colors ${showLogic ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'hover:bg-slate-200 text-slate-700'}`} 
                        title={t('ToggleLogic')}
                    >
                         <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>hub</span>
                    </button>
                    <button 
                        onClick={() => setShowCritical(!showCritical)} 
                        style={{ width: btnSize, height: btnSize }} 
                        className={`flex items-center justify-center rounded transition-colors ${showCritical ? 'bg-red-100 text-red-700 border border-red-300' : 'hover:bg-slate-200 text-slate-700'}`} 
                        title={t('ToggleCritical')}
                    >
                         <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>network_node</span>
                    </button>

                    <div className="w-px bg-slate-300 mx-1" style={{ height: btnSize }}></div>
                    
                    <button onClick={onCloudBackup} style={{ width: btnSize, height: btnSize }} className="flex items-center justify-center hover:bg-slate-200 rounded text-slate-700 transition-colors" title={t('CloudBackup')}>
                         <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>cloud_upload</span>
                    </button>
                    <button onClick={onSettings} style={{ width: btnSize, height: btnSize }} className="flex items-center justify-center hover:bg-slate-200 rounded text-slate-700 transition-colors" title={t('UserPreferences')}>
                         <span className="material-symbols-outlined" style={{ fontSize: `${iconSize}px` }}>settings</span>
                    </button>
                    
                    <div className="w-px bg-slate-300 mx-1" style={{ height: btnSize }}></div>
                    <div className="font-bold text-slate-600 px-2 truncate max-w-[300px]" style={{ fontSize: `${fontSize}px` }}>{title} {isDirty ? '*' : ''}</div>
                </>
            )}

            {/* Right Side: User Profile */}
            <div className="ml-auto relative" ref={userMenuRef}>
                {currentUser && (
                    <button 
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className={`flex items-center gap-2 px-2 rounded hover:bg-slate-200 transition-colors ${showUserMenu ? 'bg-slate-200 ring-2 ring-blue-300' : ''}`}
                        style={{ height: btnSize }}
                        title={t('UserProfile')}
                    >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden border border-blue-700 shadow-sm">
                             <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>person</span>
                        </div>
                        <span className="text-xs font-bold text-slate-700 hidden md:block">{currentUser.name}</span>
                    </button>
                )}

                {showUserMenu && currentUser && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-300 shadow-2xl rounded-sm overflow-hidden z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="bg-slate-50 p-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-inner border-2 border-white">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate" title={currentUser.name}>{currentUser.name}</p>
                                    <p className="text-xs text-slate-500 truncate" title={currentUser.email}>{currentUser.email}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    isAdmin ? 'bg-red-50 text-red-700 border-red-200' : 
                                    currentUser.role === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-green-50 text-green-700 border-green-200'
                                }`}>
                                    {currentUser.role.toUpperCase()}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded border bg-slate-100 text-slate-500 border-slate-200">
                                    ID: {currentUser.id}
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-3 bg-white grid grid-cols-2 gap-2 text-xs border-b border-slate-100">
                            <div>
                                <span className="block text-slate-400">Joined</span>
                                <span className="font-semibold text-slate-700">{new Date(currentUser.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="block text-slate-400">Projects</span>
                                <span className="font-semibold text-slate-700">1 Active</span>
                            </div>
                        </div>

                        <div className="py-1">
                            {isAdmin && (
                                <button onClick={() => { onUserStats(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center gap-2 text-slate-700">
                                    <span className="material-symbols-outlined text-sm">analytics</span> User Statistics
                                </button>
                            )}
                            <div className="border-t my-1"></div>
                            <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2 group">
                                <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">logout</span>
                                Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;
