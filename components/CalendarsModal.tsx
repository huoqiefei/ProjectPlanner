
import React, { useState, useEffect } from 'react';
import { Calendar } from '../types';
import { useTranslation } from '../utils/i18n';

interface CalendarsModalProps {
    isOpen: boolean;
    onClose: () => void;
    calendars: Calendar[];
    onUpdateCalendars: (calendars: Calendar[]) => void;
    lang?: 'en' | 'zh';
}

const CalendarsModal: React.FC<CalendarsModalProps> = ({ isOpen, onClose, calendars, onUpdateCalendars, lang='en' }) => {
    const [localCalendars, setLocalCalendars] = useState<Calendar[]>(calendars);
    const [selectedCalId, setSelectedCalId] = useState<string>('');
    const [holidayStart, setHolidayStart] = useState('');
    const [holidayEnd, setHolidayEnd] = useState('');
    const { t } = useTranslation(lang as 'en' | 'zh');

    useEffect(() => {
        if(isOpen) {
            setLocalCalendars(calendars);
            if(calendars.length > 0 && !selectedCalId) setSelectedCalId(calendars[0].id);
        }
    }, [isOpen, calendars]);

    const handleUpdateCalendar = (id: string, updates: Partial<Calendar>) => {
        setLocalCalendars(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const handleSave = () => {
        onUpdateCalendars(localCalendars);
        onClose();
    };

    const addNewCalendar = () => {
        const newCal: Calendar = {
            id: `cal-${Date.now()}`,
            name: 'New Calendar',
            isDefault: false,
            hoursPerDay: 8,
            weekDays: [false, true, true, true, true, true, false],
            exceptions: []
        };
        setLocalCalendars([...localCalendars, newCal]);
        setSelectedCalId(newCal.id);
    };

    const deleteCalendar = () => {
        if(localCalendars.length <= 1) return;
        setLocalCalendars(prev => prev.filter(c => c.id !== selectedCalId));
        setSelectedCalId(localCalendars[0].id);
    };

    const addHolidayRange = () => {
        if(!selectedCalId || !holidayStart) return;
        const cal = localCalendars.find(c => c.id === selectedCalId);
        if(!cal) return;
        
        const start = new Date(holidayStart);
        const end = holidayEnd ? new Date(holidayEnd) : new Date(holidayStart);
        if (start > end) return;

        const newExceptions = [...cal.exceptions];
        let curr = new Date(start);
        let count = 0;
        while (curr <= end && count < 365) {
            const dateStr = curr.toISOString().split('T')[0];
            if (!newExceptions.some(e => e.date === dateStr)) {
                newExceptions.push({ date: dateStr, isWorking: false });
            }
            curr.setDate(curr.getDate() + 1);
            count++;
        }
        handleUpdateCalendar(selectedCalId, { exceptions: newExceptions });
        setHolidayStart(''); setHolidayEnd('');
    };

    if(!isOpen) return null;

    const selectedCal = localCalendars.find(c => c.id === selectedCalId);
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white border border-slate-300 rounded-lg w-[800px] h-[600px] flex flex-col shadow-2xl">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                    <h2 className="text-xl font-bold text-slate-800">{t('GlobalCalendars')}</h2>
                    <button onClick={onClose} className="hover:text-red-500 font-bold">×</button>
                </div>

                <div className="flex flex-grow overflow-hidden">
                    {/* List */}
                    <div className="w-1/3 border-r bg-slate-50 p-4 flex flex-col">
                        <div className="flex gap-2 mb-2">
                            <button onClick={addNewCalendar} className="flex-1 bg-green-600 text-white py-1 rounded text-xs hover:bg-green-700">{t('Create')}</button>
                            <button onClick={deleteCalendar} className="flex-1 bg-red-100 text-red-600 py-1 rounded text-xs hover:bg-red-200">{t('Delete')}</button>
                        </div>
                        <div className="overflow-y-auto flex-grow bg-white border rounded">
                            {localCalendars.map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => setSelectedCalId(c.id)}
                                    className={`p-2 text-sm cursor-pointer border-b ${selectedCalId === c.id ? 'bg-blue-100 text-blue-800 font-medium' : 'hover:bg-slate-50'}`}
                                >
                                    {c.name} {c.isDefault && <span className="text-[10px] bg-slate-200 px-1 rounded ml-1">Def</span>}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    {selectedCal && (
                        <div className="w-2/3 p-6 overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">{t('CalendarName')}</label>
                                    <input className="w-full border p-2 rounded text-sm" value={selectedCal.name} onChange={e => handleUpdateCalendar(selectedCal.id, { name: e.target.value })} />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">{t('WorkHours')}</label>
                                        <input type="number" className="w-full border p-2 rounded text-sm" value={selectedCal.hoursPerDay} onChange={e => handleUpdateCalendar(selectedCal.id, { hoursPerDay: Number(e.target.value) })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1">{t('StandardWeek')}</label>
                                        <div className="flex gap-1">
                                            {selectedCal.weekDays.map((w, i) => (
                                                <button key={i} onClick={() => {
                                                    const nw = [...selectedCal.weekDays]; nw[i] = !nw[i];
                                                    handleUpdateCalendar(selectedCal.id, { weekDays: nw });
                                                }} className={`w-8 h-8 rounded text-xs font-bold border ${w ? 'bg-green-100 text-green-800 border-green-300' : 'bg-slate-100 text-slate-400 border-slate-300'}`}>
                                                    {days[i]}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">{t('Exceptions')}</label>
                                    <div className="flex gap-2 mb-2 items-end">
                                        <input type="date" className="border p-1 rounded text-xs" value={holidayStart} onChange={e=>setHolidayStart(e.target.value)} />
                                        <span className="text-slate-400">-</span>
                                        <input type="date" className="border p-1 rounded text-xs" value={holidayEnd} onChange={e=>setHolidayEnd(e.target.value)} />
                                        <button onClick={addHolidayRange} className="bg-slate-600 text-white px-2 py-1 rounded text-xs hover:bg-slate-700">{t('AddRange')}</button>
                                    </div>
                                    <div className="h-40 border rounded bg-slate-50 overflow-y-auto p-2">
                                        {selectedCal.exceptions.sort((a,b)=>a.date.localeCompare(b.date)).map((ex, i) => (
                                            <div key={i} className="flex justify-between text-xs py-1 border-b last:border-0">
                                                <span>{ex.date} <span className="text-red-500 font-bold">{t('NonWork')}</span></span>
                                                <button onClick={() => handleUpdateCalendar(selectedCal.id, { exceptions: selectedCal.exceptions.filter(e => e.date !== ex.date) })} className="text-red-500 font-bold hover:text-red-700">×</button>
                                            </div>
                                        ))}
                                        {selectedCal.exceptions.length === 0 && <div className="text-center text-slate-400 mt-4">No exceptions</div>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-200 rounded">{t('Cancel')}</button>
                    <button onClick={handleSave} className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-bold">{t('Apply')}</button>
                </div>
            </div>
        </div>
    );
};

export default CalendarsModal;
