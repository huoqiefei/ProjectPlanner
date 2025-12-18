
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../utils/i18n';
import { UISize, User } from '../types';

interface MenuBarProps {
    onAction: (action: string) => void;
    lang: 'en' | 'zh';
    uiSize: UISize;
    uiFontPx?: number;
    currentUser: User | null;
    openedProjectsStr?: string;
    isDirty?: boolean;
}

const MenuBar: React.FC<MenuBarProps> = ({ onAction, lang, uiSize, uiFontPx, currentUser, openedProjectsStr, isDirty }) => {
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation(lang);

    const fontSize = uiFontPx || 13;
    const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'administrator';

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setActiveMenu(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const menus = {
        [t('File')]: [
            { label: t('Import'), action: 'import' },
            { label: t('Export'), action: 'export' },
            { type: 'separator' },
            { label: t('PrintPreview'), action: 'print' },
        ],
        [t('Edit')]: [
            { label: t('Copy'), action: 'copy' },
            { label: t('Cut'), action: 'cut' },
            { label: t('Paste'), action: 'paste' },
            { type: 'separator' },
            { label: t('ColumnsSetup'), action: 'columns' },
            { label: t('UserPreferences'), action: 'settings' },
        ],
        [t('Project')]: [
            { label: t('Activities'), action: 'view_activities' },
            { label: t('Resources'), action: 'view_resources' },
            { label: t('Calendars'), action: 'calendars' },
            { type: 'separator' },
            { label: t('CodingRules'), action: 'project_info' }, // Action name kept same for compatibility, Label changed
        ],
        [t('System')]: [
            { label: t('Configuration'), action: 'admin' },
        ],
        [t('Help')]: [
            { label: t('About'), action: 'about' },
            { label: 'User Manual', action: 'help' },
        ]
    };

    const handleMenuClick = (menuName: string) => {
        setActiveMenu(activeMenu === menuName ? null : menuName);
    };

    const handleItemClick = (action: string) => {
        onAction(action);
        setActiveMenu(null);
    };

    return (
        <div className="bg-slate-200 border-b border-slate-300 flex justify-between select-none h-8 items-center" ref={menuRef} style={{ fontSize: `${fontSize}px` }}>
            <div className="flex h-full items-center">
                {Object.entries(menus).map(([name, items]) => {
                    // Restrict System menu to admins based on user group
                    if (name === t('System') && !isAdmin) return null;

                    return (
                        <div key={name} className="relative h-full flex items-center">
                            <div 
                                className={`px-3 h-full flex items-center cursor-pointer hover:bg-slate-300 ${activeMenu === name ? 'bg-slate-300 text-blue-800 font-medium' : 'text-slate-800'}`}
                                onClick={() => handleMenuClick(name)}
                            >
                                {name}
                            </div>
                            {activeMenu === name && (
                                <div className="absolute left-0 top-full bg-white border border-slate-400 shadow-lg min-w-[180px] z-50 py-1">
                                    {items.map((item, idx) => {
                                        if (item.type === 'separator') {
                                            return <div key={idx} className="h-px bg-slate-200 my-1 mx-2" />;
                                        }
                                        return (
                                            <div 
                                                key={idx} 
                                                className="px-4 py-1.5 hover:bg-blue-600 hover:text-white cursor-pointer flex justify-between group whitespace-nowrap"
                                                onClick={() => handleItemClick(item.action!)}
                                            >
                                                <span>{item.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {/* Centered Project Title */}
            {openedProjectsStr && (
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 font-semibold text-slate-600 truncate max-w-[400px]">
                    {openedProjectsStr} {isDirty ? '*' : ''}
                </div>
            )}

            <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>
    );
};

export default MenuBar;
