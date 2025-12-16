
import React, { useState } from 'react';
import { PrintSettings } from '../types';
import { useTranslation } from '../utils/i18n';

interface PrintSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPrint: (s: PrintSettings) => void;
    lang?: 'en'|'zh';
}

const PrintSettingsModal: React.FC<PrintSettingsModalProps> = ({ isOpen, onClose, onPrint, lang='en' }) => {
    const [settings, setSettings] = useState<PrintSettings>({ 
        paperSize: 'a3', 
        orientation: 'landscape',
        dateRange: 'project',
        showCritical: true,
        showLinks: true
    });
    const { t } = useTranslation(lang as 'en' | 'zh');

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="bg-white border border-slate-400 shadow-2xl w-[500px] max-w-[95vw] rounded-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-blue-900 text-white px-3 py-1 text-sm font-bold flex justify-between items-center shadow-sm select-none">
                    <span>{t('PageSetup')}</span>
                    <button onClick={onClose} className="hover:text-red-300 font-bold">✕</button>
                </div>
                
                <div className="p-6 text-sm text-slate-700 space-y-6">
                    {/* Paper & Orientation */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block mb-1 font-bold text-slate-600">{t('PaperSize')}</label>
                            <select className="w-full border p-2 rounded" value={settings.paperSize} onChange={e => setSettings({...settings, paperSize: e.target.value as any})}>
                                <option value="a4">A4</option>
                                <option value="a3">A3</option>
                                <option value="a2">A2</option>
                                <option value="a1">A1</option>
                            </select>
                        </div>
                        <div>
                            <label className="block mb-1 font-bold text-slate-600">{t('Orientation')}</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="orient" checked={settings.orientation === 'landscape'} onChange={() => setSettings({...settings, orientation: 'landscape'})} /> {t('Landscape')}
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                    <input type="radio" name="orient" checked={settings.orientation === 'portrait'} onChange={() => setSettings({...settings, orientation: 'portrait'})} /> {t('Portrait')}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4"></div>

                    {/* Date Range */}
                    <div>
                        <label className="block mb-2 font-bold text-slate-600">{t('DateRange')}</label>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={settings.dateRange === 'project'} onChange={() => setSettings({...settings, dateRange: 'project'})} />
                                {t('EntireProject')}
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="radio" checked={settings.dateRange === 'view'} onChange={() => setSettings({...settings, dateRange: 'view'})} />
                                {t('CurrentView')}
                            </label>
                        </div>
                        
                        {settings.dateRange === 'view' && (
                            <div className="ml-6 mt-2 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs mb-1">Start</label>
                                    <input type="date" className="border p-1 w-full text-xs" value={settings.startDate || ''} onChange={e => setSettings({...settings, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-xs mb-1">End</label>
                                    <input type="date" className="border p-1 w-full text-xs" value={settings.endDate || ''} onChange={e => setSettings({...settings, endDate: e.target.value})} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t pt-4"></div>

                    {/* Options */}
                    <div>
                        <label className="block mb-2 font-bold text-slate-600">{t('PrintOptions')}</label>
                        <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={settings.showCritical} onChange={e => setSettings({...settings, showCritical: e.target.checked})} />
                                {t('ShowCriticalPath')}
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={settings.showLinks} onChange={e => setSettings({...settings, showLinks: e.target.checked})} />
                                {t('ShowRelationships')}
                            </label>
                        </div>
                    </div>

                    <div className="text-[10px] text-slate-500 bg-yellow-50 p-2 border border-yellow-200 rounded">
                        {t('PrintNote')}
                    </div>
                </div>

                <div className="bg-slate-100 p-3 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-sm font-medium">{t('Cancel')}</button>
                    <button onClick={() => { onPrint(settings); onClose(); }} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium shadow-sm">{t('PrintPreview')}</button>
                </div>
            </div>
        </div>
    );
};

export default PrintSettingsModal;
