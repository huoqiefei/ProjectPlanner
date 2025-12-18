
import React, { useState, useEffect } from 'react';
import { UserSettings, PrintSettings, Resource, AdminConfig, User } from '../types';
import { useTranslation } from '../utils/i18n';
import AdminDashboard from './AdminDashboard';

interface ModalProps {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

export const BaseModal: React.FC<ModalProps> = ({ isOpen, title, onClose, children, footer }) => {
    if (!isOpen) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="bg-white border border-slate-400 shadow-2xl w-96 max-w-[95vw] rounded-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-blue-900 text-white px-3 py-1 text-sm font-bold flex justify-between items-center shadow-sm select-none">
                    <span>{title}</span>
                    <button onClick={onClose} className="hover:text-red-300 font-bold">✕</button>
                </div>
                <div className="p-4 text-xs text-slate-700">{children}</div>
                {footer && (
                    <div className="bg-slate-100 p-2 border-t flex justify-end gap-2">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Markdown Parser to avoid heavy dependencies
const SimpleMarkdown: React.FC<{ content: string }> = ({ content }) => {
    if (!content) return <div>Loading...</div>;
    
    const lines = content.split('\n');
    return (
        <div className="space-y-2 text-slate-700">
            {lines.map((line, idx) => {
                const l = line.trim();
                if (l.startsWith('# ')) return <h1 key={idx} className="text-xl font-bold text-blue-900 border-b pb-1 mt-4">{l.substring(2)}</h1>;
                if (l.startsWith('## ')) return <h2 key={idx} className="text-lg font-bold text-slate-800 mt-3">{l.substring(3)}</h2>;
                if (l.startsWith('### ')) return <h3 key={idx} className="text-md font-bold text-slate-700 mt-2">{l.substring(4)}</h3>;
                if (l.startsWith('- ')) return <li key={idx} className="ml-4 list-disc">{parseInline(l.substring(2))}</li>;
                if (l === '') return <div key={idx} className="h-2"></div>;
                return <p key={idx}>{parseInline(l)}</p>;
            })}
        </div>
    );
};

const parseInline = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i} className="bg-slate-100 px-1 rounded text-red-500">{part.slice(1, -1)}</code>;
        if (part.startsWith('[') && part.endsWith(')')) {
            const matches = part.match(/^\[(.*?)\]\((.*?)\)$/);
            if (matches) {
                 return <a key={i} href={matches[2]} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{matches[1]}</a>;
            }
        }
        return part;
    });
};

export const AlertModal: React.FC<{ isOpen: boolean, msg: string, onClose: () => void }> = ({ isOpen, msg, onClose }) => (
    <BaseModal isOpen={isOpen} title="System Message" onClose={onClose} footer={
        <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">OK</button>
    }>
        <div className="flex items-center gap-3">
            <div className="text-yellow-600 text-2xl">⚠</div>
            <div>{msg}</div>
        </div>
    </BaseModal>
);

export const ConfirmModal: React.FC<{ isOpen: boolean, msg: string, onConfirm: () => void, onCancel: () => void, lang?: 'en' | 'zh' }> = ({ isOpen, msg, onConfirm, onCancel, lang = 'en' }) => {
    const { t } = useTranslation(lang as 'en' | 'zh');
    return (
        <BaseModal isOpen={isOpen} title={t('Confirm')} onClose={onCancel} footer={
            <>
                <button onClick={onCancel} className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50">{t('Cancel')}</button>
                <button onClick={onConfirm} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('Confirm')}</button>
            </>
        }>
            <div className="flex items-center gap-3">
                <div className="text-blue-600 text-2xl">?</div>
                <div>{msg}</div>
            </div>
        </BaseModal>
    );
};

export const AboutModal: React.FC<{ isOpen: boolean, onClose: () => void, customCopyright?: string, currentUser?: User | null, lang?: 'en' | 'zh', dataSize?: number }> = ({ isOpen, onClose, customCopyright, currentUser, lang='en', dataSize = 0 }) => {
    const { t } = useTranslation(lang as 'en' | 'zh');
    const [memory, setMemory] = useState<string>('N/A');

    useEffect(() => {
        if (isOpen) {
            const mem = (performance as any).memory;
            if (mem) {
                setMemory(`${Math.round(mem.usedJSHeapSize / 1024 / 1024)} MB / ${Math.round(mem.jsHeapSizeLimit / 1024 / 1024)} MB`);
            }
        }
    }, [isOpen]);

    const formatSize = (bytes: number) => {
        if(bytes < 1024) return bytes + ' B';
        if(bytes < 1024 * 1024) return (bytes/1024).toFixed(1) + ' KB';
        return (bytes/1024/1024).toFixed(1) + ' MB';
    };

    return (
        <BaseModal isOpen={isOpen} title={t('About')} onClose={onClose} footer={
            <div className="w-full flex justify-between items-center">
                 <span className="text-[10px] text-slate-400">{customCopyright || 'Powered by Planner.cn'}</span>
                 <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
            </div>
        }>
            <div className="space-y-4">
                <div className="flex items-center gap-4 border-b pb-4">
                    <div className="w-16 h-16 bg-blue-900 text-white flex items-center justify-center text-2xl font-black rounded-lg shadow-md">
                        P6
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Planner Web</h2>
                        <p className="text-slate-500">Professional Project Scheduling</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <span className="font-bold text-slate-500 text-right">{t('Version')}:</span>
                    <span className="text-slate-800">1.2.0 (Build 20240520)</span>

                    <span className="font-bold text-slate-500 text-right">{t('AuthorizedTo')}:</span>
                    <span className="text-blue-700 font-bold">{currentUser?.name || 'Guest'}</span>

                    <span className="font-bold text-slate-500 text-right">{t('LicenseType')}:</span>
                    <span className="uppercase text-slate-700 bg-slate-100 px-1 rounded inline-block w-fit">{currentUser?.role || 'Trial'}</span>

                    <span className="font-bold text-slate-500 text-right">{t('BrowserMemory')}:</span>
                    <span className="text-slate-700 font-mono">{memory}</span>

                    <span className="font-bold text-slate-500 text-right">{t('ProjectDataSize')}:</span>
                    <span className="text-slate-700 font-mono">{formatSize(dataSize)}</span>
                </div>

                <div className="text-[10px] text-slate-400 pt-2 border-t mt-2">
                    This software uses local browser storage. Clearing browser cache may delete unsaved data.
                </div>
            </div>
        </BaseModal>
    );
};

export const AdminModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (c: AdminConfig) => void }> = ({ isOpen, onClose, onSave }) => {
    return <AdminDashboard isOpen={isOpen} onClose={onClose} onSave={onSave} />; 
};

const DEFAULT_MANUAL = `# Planner Web - User Operation Manual

## 1. Getting Started
- Click **"Create New Project"** or **"File > New"**.
- Open projects via **"File > Import"**.

## 2. WBS & Activities
- **Right-click** to add WBS/Activities.
- **Double-click** cells to edit.
- **Delete** key to remove items.

## 3. Logic (CPM)
- Enter predecessors (e.g., A100FS+5).
- Use **Relationships** tab in details.

## 4. Resources
- Define resources in **Resources** view.
- Assign in **Details > Resources**.

## 5. Printing
- **File > Print Preview**.
- Select columns and paper size.
- Auto-scales Gantt to fit.
`;

export const HelpModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [content, setContent] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetch('manual.md')
                .then(res => {
                    if(!res.ok) throw new Error("File not found");
                    return res.text();
                })
                .then(text => setContent(text))
                .catch(() => setContent(DEFAULT_MANUAL));
        }
    }, [isOpen]);

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white w-[800px] h-[600px] flex flex-col rounded shadow-2xl overflow-hidden">
                 <div className="bg-blue-900 text-white p-3 font-bold flex justify-between shrink-0">
                     <span>Planner Web - Help & Documentation</span>
                     <button onClick={onClose} className="hover:text-red-300">✕</button>
                 </div>
                 
                 <div className="flex-grow overflow-y-auto p-8">
                     <SimpleMarkdown content={content} />
                 </div>

                 <div className="bg-slate-100 border-t p-4 text-center shrink-0">
                     <p className="text-xs text-slate-500 mt-1">
                         Copyright &copy; {new Date().getFullYear()} <a href="http://www.planner.cn" target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-bold">Planner.cn</a>. All rights reserved.
                     </p>
                 </div>
             </div>
        </div>
    )
}

export const ColumnSetupModal: React.FC<{ isOpen: boolean, onClose: () => void, visibleColumns: string[], onSave: (cols: string[]) => void, lang?: 'en'|'zh' }> = ({ isOpen, onClose, visibleColumns, onSave, lang='en' }) => {
    const [selected, setSelected] = useState<string[]>([]);
    const { t } = useTranslation(lang as 'en' | 'zh');

    useEffect(() => {
        if(isOpen) setSelected(visibleColumns);
    }, [isOpen, visibleColumns]);

    const allCols = [
        { id: 'id', label: 'Activity ID' },
        { id: 'name', label: 'Activity Name' },
        { id: 'duration', label: 'Duration' },
        { id: 'start', label: 'Start Date' },
        { id: 'finish', label: 'Finish Date' },
        { id: 'float', label: 'Total Float' },
        { id: 'preds', label: 'Predecessors' },
        { id: 'budget', label: 'Budget Cost' }
    ];

    const available = allCols.filter(c => !selected.includes(c.id));
    const visible = selected.map(id => allCols.find(c => c.id === id)).filter(c => c !== undefined) as typeof allCols;

    const addToVisible = (id: string) => setSelected([...selected, id]);
    const removeFromVisible = (id: string) => setSelected(selected.filter(x => x !== id));
    
    // Simple drag and drop replacement with click
    const moveUp = (idx: number) => {
        if(idx === 0) return;
        const newSel = [...selected];
        [newSel[idx-1], newSel[idx]] = [newSel[idx], newSel[idx-1]];
        setSelected(newSel);
    }

    if(!isOpen) return null;

    return (
        <BaseModal isOpen={isOpen} title={t('ColumnsSetup')} onClose={onClose} footer={
            <>
                <button onClick={onClose} className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50">{t('Cancel')}</button>
                <button onClick={() => { onSave(selected); onClose(); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('Save')}</button>
            </>
        }>
            <div className="flex gap-4 h-64">
                <div className="flex-1 flex flex-col">
                    <div className="font-bold mb-1 border-b text-slate-600">{t('AvailableCols')}</div>
                    <div className="flex-grow border bg-slate-50 overflow-y-auto p-1">
                        {available.map(c => (
                            <div key={c.id} className="p-1 hover:bg-blue-100 cursor-pointer text-slate-700" onClick={() => addToVisible(c.id)}>
                                {c.label}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col justify-center gap-2">
                     <span className="text-slate-400">⇨</span>
                </div>
                <div className="flex-1 flex flex-col">
                    <div className="font-bold mb-1 border-b text-slate-600">{t('VisibleCols')}</div>
                    <div className="flex-grow border bg-white overflow-y-auto p-1">
                        {visible.map((c, i) => (
                            <div key={c.id} className="p-1 hover:bg-blue-100 cursor-pointer flex justify-between group" onClick={() => removeFromVisible(c.id)}>
                                <span>{c.label}</span>
                                <div className="hidden group-hover:flex gap-1" onClick={e=>e.stopPropagation()}>
                                    <button onClick={()=>moveUp(i)} className="text-[10px] bg-slate-200 px-1 rounded">▲</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export const UserSettingsModal: React.FC<{ isOpen: boolean, onClose: () => void, settings: UserSettings, onSave: (s: UserSettings) => void }> = ({ isOpen, onClose, settings, onSave }) => {
    const [local, setLocal] = useState(settings);
    const { t } = useTranslation(settings.language);
    
    useEffect(() => {
        setLocal(settings);
    }, [settings, isOpen]);

    const handleSave = () => {
        onSave(local);
        onClose();
    };

    return (
        <BaseModal isOpen={isOpen} title={t('UserPreferences')} onClose={onClose} footer={
            <>
                <button onClick={onClose} className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50">{t('Cancel')}</button>
                <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('Save')}</button>
            </>
        }>
            <div className="space-y-4">
                <div>
                    <h4 className="font-bold border-b mb-2 pb-1">{t('General')}</h4>
                    <div className="space-y-2">
                        <div>
                            <label className="block mb-1">{t('DateFormat')}</label>
                            <select className="w-full border p-1" value={local.dateFormat} onChange={e => setLocal({...local, dateFormat: e.target.value as any})}>
                                <option value="YYYY-MM-DD">YYYY-MM-DD (2023-10-30)</option>
                                <option value="DD-MMM-YYYY">DD-MMM-YYYY (30-Oct-2023)</option>
                                <option value="MM/DD/YYYY">MM/DD/YYYY (10/30/2023)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1">{t('Language')}</label>
                            <select className="w-full border p-1" value={local.language} onChange={e => setLocal({...local, language: e.target.value as any})}>
                                <option value="en">English</option>
                                <option value="zh">Chinese (Simplified)</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block mb-1">{t('InterfaceSize')}</label>
                                <select className="w-full border p-1" value={local.uiSize} onChange={e => setLocal({...local, uiSize: e.target.value as any})}>
                                    <option value="small">{t('Small')}</option>
                                    <option value="medium">{t('Medium')}</option>
                                    <option value="large">{t('Large')}</option>
                                </select>
                            </div>
                            <div>
                                <label className="block mb-1">{t('CustomFontSize')}</label>
                                <input 
                                    type="number" 
                                    className="w-full border p-1" 
                                    value={local.uiFontPx || 13} 
                                    onChange={e => setLocal({...local, uiFontPx: Number(e.target.value)})} 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold border-b mb-2 pb-1">{t('GanttSettings')}</h4>
                    <div className="space-y-2">
                         <div>
                             <label className="block mb-1 font-bold">{t('VerticalInterval')}</label>
                             <select 
                                 className="w-full border p-1"
                                 value={local.gridSettings.verticalInterval || 'auto'}
                                 onChange={e => setLocal({...local, gridSettings: {...local.gridSettings, verticalInterval: e.target.value as any}})}
                             >
                                 <option value="auto">{t('Auto')}</option>
                                 <option value="month">{t('EveryMonth')}</option>
                                 <option value="quarter">{t('EveryQuarter')}</option>
                                 <option value="year">{t('EveryYear')}</option>
                             </select>
                         </div>

                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={local.gridSettings.showVertical} onChange={e => setLocal({...local, gridSettings: {...local.gridSettings, showVertical: e.target.checked}})} />
                            {t('ShowVertical')}
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="checkbox" checked={local.gridSettings.showHorizontal} onChange={e => setLocal({...local, gridSettings: {...local.gridSettings, showHorizontal: e.target.checked}})} />
                            {t('ShowHorizontal')}
                        </label>
                         <label className="flex items-center gap-2">
                            <input type="checkbox" checked={local.gridSettings.showWBSLines} onChange={e => setLocal({...local, gridSettings: {...local.gridSettings, showWBSLines: e.target.checked}})} />
                            {t('ShowWBS')}
                        </label>
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

export const UserStatsModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    // Mock Data for Admin Statistics
    const stats = {
        totalUsers: 42,
        activeToday: 5,
        newThisWeek: 3,
        rolesBreakdown: { trial: 30, authorized: 8, premium: 2, admin: 2 },
        storageUsed: '1.2 GB'
    };

    return (
        <BaseModal isOpen={isOpen} title="User Statistics (Admin Only)" onClose={onClose} footer={
             <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
        }>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100 text-center">
                        <div className="text-2xl font-bold text-blue-700">{stats.totalUsers}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Total Users</div>
                    </div>
                    <div className="bg-green-50 p-3 rounded border border-green-100 text-center">
                        <div className="text-2xl font-bold text-green-700">{stats.activeToday}</div>
                        <div className="text-xs text-slate-500 uppercase font-bold">Active Today</div>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-700 mb-2 border-b pb-1">User Groups Distribution</h4>
                    <div className="space-y-2">
                        {Object.entries(stats.rolesBreakdown).map(([role, count]) => (
                            <div key={role} className="flex items-center justify-between text-sm">
                                <span className="capitalize text-slate-600">{role}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: `${(count / stats.totalUsers) * 100}%` }}></div>
                                    </div>
                                    <span className="font-bold w-6 text-right">{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-xs text-slate-400 text-center pt-2">
                    System Storage Used: {stats.storageUsed}
                </div>
            </div>
        </BaseModal>
    );
};

export const CloudBackupModal: React.FC<{ isOpen: boolean, onClose: () => void, lang?: 'en' | 'zh' }> = ({ isOpen, onClose, lang='en' }) => {
    const { t } = useTranslation(lang as 'en' | 'zh');
    
    // Placeholder UI for Cloud Backup
    return (
        <BaseModal isOpen={isOpen} title={t('CloudBackup')} onClose={onClose} footer={
            <button onClick={onClose} className="px-3 py-1 bg-slate-200 text-slate-700 rounded hover:bg-slate-300">{t('Close')}</button>
        }>
            <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="bg-blue-50 p-4 rounded-full">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"/></svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Coming Soon</h3>
                    <p className="text-slate-500 mt-2">Cloud synchronization and backup features are currently in development. This interface is a placeholder for future API integration.</p>
                </div>
                <div className="w-full bg-slate-100 rounded p-3 text-xs font-mono text-left mt-4 border border-slate-200">
                    <div className="text-slate-400">// API Endpoint Stub</div>
                    <div className="text-blue-600">POST /api/v1/projects/backup</div>
                    <div className="text-slate-600">Status: 501 Not Implemented</div>
                </div>
            </div>
        </BaseModal>
    );
};
