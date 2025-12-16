
import React, { useRef, useState, useEffect } from 'react';
import { User } from '../types';

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
}

const Icons = {
    New: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>,
    Open: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z"/></svg>,
    Save: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>,
    Print: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>,
    Settings: <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
    User: <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
    Stats: <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>,
    Logout: <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
};

const Toolbar: React.FC<ToolbarProps> = ({ onNew, onOpen, onSave, onPrint, onSettings, title, isDirty, uiFontPx, currentUser, onLogout, onUserStats }) => {
    const fileRef = useRef<HTMLInputElement>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    const fontSize = uiFontPx || 13;
    const btnSize = Math.max(30, fontSize * 2.2); // Scale button size
    const iconSize = Math.max(16, fontSize * 1.2); // Scale icon size

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
            <button onClick={onNew} style={{ width: btnSize, height: btnSize }} className="flex flex-col items-center justify-center hover:bg-slate-200 rounded text-slate-700" title="New">
                <div style={{ width: iconSize, height: iconSize }}>{Icons.New}</div>
            </button>
            <button onClick={() => fileRef.current?.click()} style={{ width: btnSize, height: btnSize }} className="flex flex-col items-center justify-center hover:bg-slate-200 rounded text-slate-700" title="Open">
                <div style={{ width: iconSize, height: iconSize }}>{Icons.Open}</div>
            </button>
            <input type="file" ref={fileRef} onChange={onOpen} className="hidden" accept=".json" />
            {title && (
                <>
                    <button onClick={onSave} style={{ width: btnSize, height: btnSize }} className="flex flex-col items-center justify-center hover:bg-slate-200 rounded text-slate-700" title="Save">
                         <div style={{ width: iconSize, height: iconSize }}>{Icons.Save}</div>
                    </button>
                    <div className="w-px bg-slate-300 mx-1" style={{ height: btnSize }}></div>
                    <button onClick={onSettings} style={{ width: btnSize, height: btnSize }} className="flex flex-col items-center justify-center hover:bg-slate-200 rounded text-slate-700" title="User Preferences">
                         <div style={{ width: iconSize, height: iconSize }}>{Icons.Settings}</div>
                    </button>
                    <button onClick={onPrint} style={{ width: btnSize, height: btnSize }} className="flex flex-col items-center justify-center hover:bg-slate-200 rounded text-slate-700" title="Print">
                         <div style={{ width: iconSize, height: iconSize }}>{Icons.Print}</div>
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
                        title="User Profile"
                    >
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center overflow-hidden border border-blue-700 shadow-sm">
                             <div style={{ width: '14px', height: '14px' }}>{Icons.User}</div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 hidden md:block">{currentUser.name}</span>
                    </button>
                )}

                {showUserMenu && currentUser && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-300 shadow-2xl rounded-sm overflow-hidden z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="bg-slate-50 p-4 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow-inner">
                                    {currentUser.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-bold text-sm truncate" title={currentUser.name}>{currentUser.name}</p>
                                    <p className="text-xs text-slate-500 truncate" title={currentUser.email}>{currentUser.email}</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                    isAdmin ? 'bg-red-50 text-red-700 border-red-200' : 
                                    currentUser.role === 'premium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-green-50 text-green-700 border-green-200'
                                }`}>
                                    Group: {currentUser.role}
                                </span>
                            </div>
                        </div>
                        <div className="py-1">
                            {isAdmin && (
                                <button onClick={() => { onUserStats(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 flex items-center text-slate-700">
                                    {Icons.Stats} User Statistics
                                </button>
                            )}
                            <div className="border-t my-1"></div>
                            <button onClick={() => { onLogout(); setShowUserMenu(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center">
                                {Icons.Logout} Sign Out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Toolbar;
