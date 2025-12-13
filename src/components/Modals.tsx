
import React, { useState, useEffect } from 'react';
import { UserSettings, PrintSettings, AdminConfig, ImportSummary, ProjectData } from '../types';
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
        <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white border border-slate-400 shadow-2xl w-96 max-w-[95vw] rounded-sm overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="bg-blue-900 text-white px-3 py-1 text-sm font-bold flex justify-between items-center shadow-sm select-none flex-shrink-0">
                    <span>{title}</span>
                    <button onClick={onClose} className="hover:text-red-300 font-bold">✕</button>
                </div>
                <div className="p-4 text-xs text-slate-700 overflow-y-auto custom-scrollbar">{children}</div>
                {footer && (
                    <div className="bg-slate-100 p-2 border-t flex justify-end gap-2 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// Simple Markdown Parser
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
        if (part.startsWith('[') && part.includes('](')) {
            const [label, url] = part.split('](');
            return <a key={i} href={url.slice(0, -1)} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{label.slice(1)}</a>;
        }
        return part;
    });
};

export const AlertModal: React.FC<{ isOpen: boolean, msg: string, onClose: () => void, lang?: 'en'|'zh' }> = ({ isOpen, msg, onClose, lang='en' }) => {
    const { t } = useTranslation(lang as 'en' | 'zh');
    return (
        <BaseModal isOpen={isOpen} title={t('System')} onClose={onClose} footer={
            <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('OK')}</button>
        }>
            <div className="flex items-center gap-3">
                <div className="text-yellow-600 text-2xl">⚠</div>
                <div>{msg}</div>
            </div>
        </BaseModal>
    );
};

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

export const ImportReportModal: React.FC<{ isOpen: boolean, summary: ImportSummary | null, onClose: () => void }> = ({ isOpen, summary, onClose }) => {
    if (!summary) return null;
    return (
        <BaseModal isOpen={isOpen} title="Import Report" onClose={onClose} footer={
            <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
        }>
            <div className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                    <div className="text-green-600 text-2xl">✓</div>
                    <div>
                        <h4 className="font-bold text-slate-800">Import Successful</h4>
                        <p className="text-slate-500">{summary.fileName}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Activities: <strong>{summary.activityCount}</strong></div>
                    <div>WBS Nodes: <strong>{summary.wbsCount}</strong></div>
                    <div>Resources: <strong>{summary.resourceCount}</strong></div>
                    <div>Calendars: <strong>{summary.calendarCount}</strong></div>
                </div>
            </div>
        </BaseModal>
    );
};

export const ImportWizardModal: React.FC<{ 
    isOpen: boolean, 
    importData: { data: ProjectData, summary: ImportSummary } | null, 
    onConfirm: () => void, 
    onCancel: () => void, 
    lang?: 'en'|'zh' 
}> = ({ isOpen, importData, onConfirm, onCancel, lang='en' }) => {
    const { t } = useTranslation(lang as 'en'|'zh');
    
    if (!isOpen || !importData) return null;
    const { data, summary } = importData;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl w-[600px] flex flex-col max-h-[80vh]">
                <div className="bg-blue-900 text-white px-4 py-2 font-bold flex justify-between items-center">
                    <span>{t('ImportWizard')}</span>
                    <button onClick={onCancel} className="hover:text-red-300">✕</button>
                </div>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    <div className="flex items-center gap-3 mb-6 bg-blue-50 p-4 rounded border border-blue-100">
                        <div className="text-blue-600 text-3xl">📂</div>
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">{t('ImportProjectFound')}</h4>
                            <p className="text-slate-600 font-bold">{summary.projectTitle}</p>
                            <p className="text-slate-400 text-xs">{summary.fileName}</p>
                        </div>
                    </div>

                    <h5 className="font-bold text-slate-700 border-b pb-1 mb-2">{t('ImportCalendarsFound')}</h5>
                    <p className="text-xs text-slate-500 mb-2">{t('ImportNote')}</p>
                    
                    <div className="border rounded overflow-hidden">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-slate-100 font-bold text-slate-600">
                                <tr>
                                    <th className="p-2 border-b">{t('CalName')}</th>
                                    <th className="p-2 border-b text-center">{t('HoursDay')}</th>
                                    <th className="p-2 border-b">{t('Type')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.calendars.map(cal => (
                                    <tr key={cal.id} className="border-b last:border-0 hover:bg-slate-50">
                                        <td className="p-2">{cal.name} {cal.isDefault ? '(Default)' : ''}</td>
                                        <td className="p-2 text-center font-mono font-bold text-blue-700">{cal.hoursPerDay}h</td>
                                        <td className="p-2 text-slate-500">{cal.weekDays.filter(Boolean).length} days/week</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t flex justify-end gap-2">
                    <button onClick={onCancel} className="px-4 py-2 bg-white border border-slate-300 rounded text-slate-700 hover:bg-slate-100">
                        {t('Cancel')}
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 shadow">
                        {t('ImportAction')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AboutModal: React.FC<{ isOpen: boolean, onClose: () => void, customCopyright?: string, lang?: 'en'|'zh' }> = ({ isOpen, onClose, customCopyright, lang='en' }) => {
    const { t } = useTranslation(lang as 'en' | 'zh');
    return (
        <BaseModal isOpen={isOpen} title={t('About')} onClose={onClose} footer={
            <div className="w-full flex justify-between items-center">
                 <span className="text-[10px] text-slate-400">{customCopyright || 'Powered by Planner.cn'}</span>
                 <button onClick={onClose} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('Close')}</button>
            </div>
        }>
            <div className="max-h-[60vh] overflow-y-auto">
                 <SimpleMarkdown content={`# Planner Web\n\n**${t('Version')}:** 1.0.0\n\nPlanner Web is a professional Project Management tool similar to Oracle Primavera P6.\n\n- CPM Scheduling\n- WBS Management\n- Resource Histograms\n- XER Import`} />
            </div>
        </BaseModal>
    );
};

export const AdminModal: React.FC<{ isOpen: boolean, onClose: () => void, onSave: (c: AdminConfig) => void, lang?: 'en'|'zh' }> = ({ isOpen, onClose, onSave, lang='en' }) => {
    return <AdminDashboard isOpen={isOpen} onClose={onClose} onSave={onSave} lang={lang} />; 
};

// Localized Help Manual Generation
const getManualContent = (t: any) => `# ${t('UserManual')}

## ${t('Manual_Start')}
- ${t('CreateNew')}...
- ${t('OpenExisting')}...

## ${t('Manual_WBS')}
- Right click to add...

## ${t('Manual_Logic')}
- Predecessors...

## ${t('Manual_Res')}
- Resources...

## ${t('Manual_Print')}
- Print Preview...
`;

export const HelpModal: React.FC<{ isOpen: boolean, onClose: () => void, lang?: 'en'|'zh' }> = ({ isOpen, onClose, lang='en' }) => {
    const { t } = useTranslation(lang as 'en' | 'zh');
    const content = getManualContent(t);

    if(!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white w-[800px] h-[600px] flex flex-col rounded shadow-2xl overflow-hidden">
                 <div className="bg-blue-900 text-white p-3 font-bold flex justify-between shrink-0">
                     <span>{t('Help')}</span>
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
    const { t } = useTranslation(lang as 'en'|'zh');
    const [selected, setSelected] = useState<string[]>(visibleColumns);
    const available = ['id', 'name', 'duration', 'start', 'finish', 'float', 'preds'];

    useEffect(() => { if(isOpen) setSelected(visibleColumns); }, [isOpen, visibleColumns]);

    const toggle = (col: string) => {
        if (selected.includes(col)) setSelected(selected.filter(c => c !== col));
        else setSelected([...selected, col]);
    };

    if (!isOpen) return null;

    return (
        <BaseModal isOpen={isOpen} title={t('ColumnsSetup')} onClose={onClose} footer={
            <button onClick={() => { onSave(selected); onClose(); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('OK')}</button>
        }>
            <div className="flex gap-4 h-60">
                <div className="flex-1 border p-2 overflow-y-auto">
                    <div className="font-bold text-xs mb-2">{t('AvailableCols')}</div>
                    {available.filter(c => !selected.includes(c)).map(c => (
                        <div key={c} onClick={() => toggle(c)} className="cursor-pointer hover:bg-blue-50 p-1 border-b border-transparent hover:border-blue-100">{c}</div>
                    ))}
                </div>
                <div className="flex flex-col justify-center gap-2">
                    <button className="text-blue-600 font-bold bg-slate-100 p-1 rounded">&gt;</button>
                    <button className="text-blue-600 font-bold bg-slate-100 p-1 rounded">&lt;</button>
                </div>
                <div className="flex-1 border p-2 overflow-y-auto">
                    <div className="font-bold text-xs mb-2">{t('VisibleCols')}</div>
                    {selected.map(c => (
                        <div key={c} onClick={() => toggle(c)} className="cursor-pointer hover:bg-blue-50 p-1 border-b border-transparent hover:border-blue-100">{c}</div>
                    ))}
                </div>
            </div>
        </BaseModal>
    );
};

export const UserSettingsModal: React.FC<{ isOpen: boolean, settings: UserSettings, onSave: (s: UserSettings) => void, onClose: () => void }> = ({ isOpen, settings, onSave, onClose }) => {
    const [local, setLocal] = useState(settings);
    
    useEffect(() => { if(isOpen) setLocal(settings); }, [isOpen, settings]);

    if (!isOpen) return null;
    return (
        <BaseModal isOpen={isOpen} title="User Preferences" onClose={onClose} footer={
            <button onClick={() => { onSave(local); onClose(); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
        }>
           <div className="space-y-4">
               <div>
                   <label className="block font-bold mb-1">Language</label>
                   <select className="w-full border p-1" value={local.language} onChange={e => setLocal({...local, language: e.target.value as any})}>
                       <option value="en">English</option>
                       <option value="zh">Chinese</option>
                   </select>
               </div>
               <div>
                   <label className="block font-bold mb-1">UI Size</label>
                   <select className="w-full border p-1" value={local.uiSize} onChange={e => setLocal({...local, uiSize: e.target.value as any, uiFontPx: e.target.value === 'small' ? 13 : (e.target.value === 'medium' ? 15 : 18)})}>
                       <option value="small">Small</option>
                       <option value="medium">Medium</option>
                       <option value="large">Large</option>
                   </select>
               </div>
                <div>
                   <label className="block font-bold mb-1">Date Format</label>
                   <select className="w-full border p-1" value={local.dateFormat} onChange={e => setLocal({...local, dateFormat: e.target.value as any})}>
                       <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                       <option value="DD-MMM-YYYY">DD-MMM-YYYY</option>
                       <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                   </select>
               </div>
               <div className="border-t pt-2 space-y-2">
                   <label className="flex items-center gap-2">
                       <input type="checkbox" checked={local.gridSettings.showVertical} onChange={e => setLocal({...local, gridSettings: {...local.gridSettings, showVertical: e.target.checked}})} />
                       Show Vertical Grid Lines
                   </label>
                   <label className="flex items-center gap-2">
                       <input type="checkbox" checked={local.gridSettings.showHorizontal} onChange={e => setLocal({...local, gridSettings: {...local.gridSettings, showHorizontal: e.target.checked}})} />
                       Show Horizontal Grid Lines
                   </label>
                   <label className="flex items-center gap-2">
                       <input type="checkbox" checked={local.gridSettings.showWBSLines} onChange={e => setLocal({...local, gridSettings: {...local.gridSettings, showWBSLines: e.target.checked}})} />
                       Show WBS Separators
                   </label>
               </div>
           </div>
        </BaseModal>
    );
};

export const PrintSettingsModal: React.FC<{ isOpen: boolean, onClose: () => void, onPrint: (s: PrintSettings) => void, lang?: 'en'|'zh' }> = ({ isOpen, onClose, onPrint, lang='en' }) => {
    const { t } = useTranslation(lang as 'en'|'zh');
    const [settings, setSettings] = useState<PrintSettings>({ paperSize: 'a4', orientation: 'landscape', scalingMode: 'fit', scalePercent: 100 });

    if (!isOpen) return null;
    return (
        <BaseModal isOpen={isOpen} title={t('PrintPreview')} onClose={onClose} footer={
            <button onClick={() => { onPrint(settings); onClose(); }} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">{t('OK')}</button>
        }>
            <div className="space-y-4">
                 <div>
                   <label className="block font-bold mb-1">{t('PaperSize')}</label>
                   <select className="w-full border p-1" value={settings.paperSize} onChange={e => setSettings({...settings, paperSize: e.target.value as any})}>
                       <option value="a4">A4</option>
                       <option value="a3">A3</option>
                       <option value="a2">A2</option>
                   </select>
               </div>
               <div>
                   <label className="block font-bold mb-1">{t('Orientation')}</label>
                   <select className="w-full border p-1" value={settings.orientation} onChange={e => setSettings({...settings, orientation: e.target.value as any})}>
                       <option value="landscape">{t('Landscape')}</option>
                       <option value="portrait">{t('Portrait')}</option>
                   </select>
               </div>
               <div className="text-xs text-slate-500">{t('PrintNote')}</div>
            </div>
        </BaseModal>
    );
};
