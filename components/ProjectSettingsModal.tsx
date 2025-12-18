
import React, { useState, useEffect } from 'react';
import { ProjectData, Calendar } from '../types';
import { useTranslation } from '../utils/i18n';

interface ProjectSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectData: ProjectData;
    onUpdateProject: (meta: ProjectData['meta'], calendars: Calendar[]) => void;
    lang?: 'en' | 'zh';
}

const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({ isOpen, onClose, projectData, onUpdateProject, lang='en' }) => {
    const [meta, setMeta] = useState(projectData.meta!);
    const { t } = useTranslation(lang as 'en' | 'zh');

    useEffect(() => {
        if(projectData.meta) setMeta(projectData.meta);
    }, [projectData, isOpen]);

    const handleSave = () => {
        onUpdateProject(meta, projectData.calendars);
        onClose();
    };

    if (!isOpen || !meta) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white border border-slate-300 rounded-lg w-[450px] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{t('CodingRules')}</h2>
                    <button onClick={onClose} className="hover:text-red-500 font-bold">×</button>
                </div>

                <div className="p-6">
                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3 text-sm">{t('ActivityID') + ' ' + t('AutoNumbering')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-500 text-xs font-bold mb-1">{t('Prefix')}</label>
                                    <input 
                                        className="w-full bg-white text-slate-800 rounded p-2 text-sm border border-slate-300"
                                        value={meta.activityIdPrefix || 'A'}
                                        onChange={e => setMeta({...meta, activityIdPrefix: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs font-bold mb-1">{t('Increment')}</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-white text-slate-800 rounded p-2 text-sm border border-slate-300"
                                        value={meta.activityIdIncrement || 10}
                                        onChange={e => setMeta({...meta, activityIdIncrement: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-2 mb-3 text-sm">Resource ID {t('AutoNumbering')}</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-500 text-xs font-bold mb-1">{t('Prefix')}</label>
                                    <input 
                                        className="w-full bg-white text-slate-800 rounded p-2 text-sm border border-slate-300"
                                        value={meta.resourceIdPrefix || 'R'}
                                        onChange={e => setMeta({...meta, resourceIdPrefix: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-500 text-xs font-bold mb-1">{t('Increment')}</label>
                                    <input 
                                        type="number"
                                        className="w-full bg-white text-slate-800 rounded p-2 text-sm border border-slate-300"
                                        value={meta.resourceIdIncrement || 10}
                                        onChange={e => setMeta({...meta, resourceIdIncrement: Number(e.target.value)})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-slate-200 flex justify-end gap-2 bg-slate-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-800">{t('Cancel')}</button>
                    <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold shadow-sm">{t('Apply')}</button>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettingsModal;
