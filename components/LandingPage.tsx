
import React from 'react';
import { AdminConfig } from '../types';
import { useTranslation, saveLanguage } from '../utils/i18n';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
    adminConfig: AdminConfig;
    lang: 'en' | 'zh';
    setLang: (l: 'en' | 'zh') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, adminConfig, lang, setLang }) => {
    const { t } = useTranslation(lang);

    const handleLangToggle = () => {
        const newLang = lang === 'en' ? 'zh' : 'en';
        setLang(newLang);
        saveLanguage(newLang);
    };

    return (
        <div className="fixed inset-0 w-full h-full bg-slate-50 text-[#1F1F1F] font-sans selection:bg-blue-600 selection:text-white flex flex-col overflow-y-auto custom-scrollbar scroll-smooth z-[100]">
            {/* Navigation Bar */}
            <header className="w-full mx-auto px-6 py-4 flex items-center justify-between sticky top-0 z-[110] bg-white/70 backdrop-blur-xl border-b border-slate-200 shadow-sm">
                <div className="flex items-center gap-3">
                    {adminConfig.appLogo ? (
                        <img src={adminConfig.appLogo} alt="Logo" className="h-9 w-auto object-contain" />
                    ) : (
                        <div className="flex items-center gap-2.5">
                            <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white w-9 h-9 flex items-center justify-center rounded-xl font-black text-xl shadow-lg shadow-blue-900/20">
                                <span className="material-symbols-outlined text-[20px]">dynamic_form</span>
                            </div>
                            <div className="font-extrabold text-xl tracking-tighter text-slate-800">
                                Planner<span className="text-blue-600">Pro</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-4 md:gap-8">
                    <button 
                        onClick={handleLangToggle}
                        className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full"
                    >
                        <span className="material-symbols-outlined text-[16px]">language</span>
                        {lang === 'en' ? '中文' : 'EN'}
                    </button>
                    <button 
                        onClick={onLogin} 
                        className="text-sm font-bold text-slate-700 hover:text-blue-600 transition-colors"
                    >
                        {t('SignIn')}
                    </button>
                    <button 
                        onClick={onRegister} 
                        className="bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 active:scale-95"
                    >
                        {t('SignUp')}
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-grow flex flex-col items-center px-4 text-center max-w-7xl mx-auto w-full pt-20">
                <div className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl relative">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 tracking-widest uppercase shadow-sm text-blue-600">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Enterprise Grade CPM Engine
                    </div>
                    
                    {/* TAGLINE: Using whitespace-nowrap and dynamic scaling to ensure NO LINE BREAKS as requested */}
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-tight mb-8 text-slate-900 tracking-tighter whitespace-nowrap px-4">
                        {t('HeroTitle')}
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
                        {t('HeroDesc')}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                        <button onClick={onRegister} className="bg-slate-900 text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-blue-600 transition-all shadow-2xl hover:-translate-y-1 active:translate-y-0">
                            {t('StartTrial')}
                        </button>
                        <a href="#showcase" className="text-slate-600 font-bold hover:text-blue-600 flex items-center gap-1.5 transition-all group">
                            {lang === 'zh' ? '查看 5 大核心界面' : 'See 5 Core Interfaces'} 
                            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_right_alt</span>
                        </a>
                    </div>
                </div>

                {/* SHOWCASE SECTION */}
                <div id="showcase" className="w-full mb-40 text-left scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">{t('ShowcaseTitle')}</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">{t('ShowcaseDesc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* 1. Gantt Preview */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group hover:border-blue-400 transition-all">
                            <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('Preview1Title')}</span>
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                                </div>
                            </div>
                            <div className="h-72 bg-white flex flex-col">
                                <div className="h-8 bg-slate-100 border-b flex items-center px-4 gap-4">
                                    <div className="w-16 h-2 bg-slate-300 rounded-full"></div>
                                    <div className="w-24 h-2 bg-slate-300 rounded-full"></div>
                                </div>
                                <div className="flex-grow p-4 space-y-4">
                                    {[1,2,3,4,5].map(i => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="w-24 h-2 bg-slate-50 rounded-full"></div>
                                            <div className="flex-grow bg-slate-50 h-5 relative rounded-sm overflow-hidden">
                                                <div className={`h-full rounded-sm shadow-sm ${i===3?'bg-red-500 animate-pulse':'bg-emerald-500'}`} style={{ width: `${20+i*10}%`, marginLeft: `${i*5}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 2. Analytics Engine */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group hover:border-blue-400 transition-all">
                            <div className="bg-slate-800 p-3 border-b border-slate-700">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('Preview2Title')}</span>
                            </div>
                            <div className="h-72 bg-slate-50 p-8 flex items-end gap-2.5">
                                {[40, 65, 80, 100, 75, 90, 50, 60, 35, 95, 45, 70].map((h, i) => (
                                    <div key={i} className={`flex-grow rounded-t-lg transition-all duration-700 ${h >= 90 ? 'bg-red-500' : 'bg-blue-600'}`} style={{ height: `${h}%` }}></div>
                                ))}
                            </div>
                        </div>

                        {/* 3. WBS Hierarchy */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group hover:border-blue-400 transition-all">
                            <div className="bg-slate-800 p-3 border-b border-slate-700">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('Preview3Title')}</span>
                            </div>
                            <div className="h-72 bg-white p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-blue-900 font-black"><span className="material-symbols-outlined text-sm">account_tree</span> PRJ-2024-POWER</div>
                                    <div className="ml-8 space-y-4 border-l-2 border-slate-100 pl-4">
                                        <div className="flex items-center gap-3 text-slate-700 font-bold text-xs"><span className="material-symbols-outlined text-[16px] text-yellow-600">folder_open</span> 01 CIVIL WORKS</div>
                                        <div className="ml-8 space-y-2 opacity-50">
                                            <div className="flex items-center gap-2 text-[10px]"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Excavation Phase</div>
                                            <div className="flex items-center gap-2 text-[10px]"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Piling works</div>
                                        </div>
                                        <div className="flex items-center gap-3 text-slate-700 font-bold text-xs"><span className="material-symbols-outlined text-[16px] text-yellow-600">folder</span> 02 EQUIPMENT</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Details Controller */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group hover:border-blue-400 transition-all">
                            <div className="bg-slate-800 p-3 border-b border-slate-700">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('Preview4Title')}</span>
                            </div>
                            <div className="h-72 bg-white">
                                <div className="flex border-b text-[9px] font-black uppercase tracking-widest">
                                    <div className="px-5 py-3 border-b-2 border-blue-600 bg-blue-50 text-blue-700">General</div>
                                    <div className="px-5 py-3 text-slate-400">Status</div>
                                    <div className="px-5 py-3 text-slate-400">Resources</div>
                                </div>
                                <div className="p-8 grid grid-cols-2 gap-6">
                                    <div className="space-y-2"><div className="h-2 w-12 bg-slate-100 rounded-full"></div><div className="h-9 border border-slate-100 rounded-lg bg-slate-50"></div></div>
                                    <div className="space-y-2"><div className="h-2 w-20 bg-slate-100 rounded-full"></div><div className="h-9 border border-slate-100 rounded-lg"></div></div>
                                    <div className="space-y-2 col-span-2"><div className="h-2 w-32 bg-slate-100 rounded-full"></div><div className="h-20 border border-slate-100 rounded-lg"></div></div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Calendar Preview */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden group md:col-span-2 hover:border-blue-400 transition-all">
                             <div className="bg-slate-800 p-3 border-b border-slate-700">
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{t('Preview5Title')}</span>
                            </div>
                            <div className="h-56 bg-white p-6 grid grid-cols-7 gap-3">
                                {Array.from({length: 28}).map((_, i) => (
                                    <div key={i} className={`aspect-square border rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${i%7>4?'bg-slate-100 text-slate-300 border-slate-50':'bg-white text-slate-600 border-slate-200'}`}>
                                        {i+1}
                                        {i===12 && <div className="absolute w-2 h-2 bg-yellow-400 rounded-full"></div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Capabilities Grid */}
                <div className="w-full mb-40 text-left">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 border-l-4 border-blue-600 pl-6">{t('Capabilities')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div className="group bg-white p-10 rounded-3xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[32px]">timeline</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-800">{t('InteractiveGantt')}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{t('GanttDesc')}</p>
                        </div>
                        <div className="group bg-white p-10 rounded-3xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl">
                            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[32px]">account_tree</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-800">{t('WBSHierarchy')}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{t('WBSDesc')}</p>
                        </div>
                        <div className="group bg-white p-10 rounded-3xl border border-slate-200 hover:border-blue-500 transition-all shadow-sm hover:shadow-xl">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[32px]">bar_chart_4_bars</span>
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-800">{t('ResourceAnalysis')}</h3>
                            <p className="text-slate-600 leading-relaxed font-medium">{t('ResDesc')}</p>
                        </div>
                    </div>
                </div>

                {/* PRICING PLANS SECTION */}
                <div id="plans" className="w-full mb-40 text-left scroll-mt-24">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 border-l-4 border-blue-600 pl-6">{t('Plans')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free Plan */}
                        <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col hover:shadow-lg transition-all group">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{t('FreePlan')}</h3>
                                <div className="flex items-baseline mt-4">
                                    <span className="text-4xl font-black text-slate-900">$0</span>
                                    <span className="text-xs text-slate-400 font-medium ml-1">/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> 20 {t('Activities')}</li>
                                <li className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> 10 {t('Resources')}</li>
                                <li className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> Full CPM Engine</li>
                                <li className="text-sm text-slate-400 flex items-center gap-2"><span className="material-symbols-outlined text-slate-300 text-[18px]">cancel</span> No Printing</li>
                            </ul>
                            <button onClick={onRegister} className="w-full border-2 border-slate-100 text-slate-700 py-3.5 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-sm">
                                {t('SelectPlan')}
                            </button>
                        </div>

                        {/* Professional Plan (Standard) */}
                        <div className="bg-blue-900 border-2 border-blue-800 p-8 rounded-3xl flex flex-col relative shadow-2xl transform md:-translate-y-4 scale-105 z-[90]">
                            <div className="absolute top-0 right-8 bg-blue-500 text-white text-[10px] px-3 py-1 rounded-b-lg font-black tracking-widest uppercase shadow-lg">Most Popular</div>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white">{t('StandardPlan')}</h3>
                                <div className="flex items-baseline mt-4">
                                    <span className="text-4xl font-black text-white">$19</span>
                                    <span className="text-xs text-blue-300 font-medium ml-1">/mo</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="text-sm text-blue-100 flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-blue-400 text-[18px]">check_circle</span> 500 {t('Activities')}</li>
                                <li className="text-sm text-blue-100 flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-blue-400 text-[18px]">check_circle</span> 200 {t('Resources')}</li>
                                <li className="text-sm text-blue-100 flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-blue-400 text-[18px]">check_circle</span> PDF Export & Print</li>
                                <li className="text-sm text-blue-100 flex items-center gap-2 font-medium"><span className="material-symbols-outlined text-blue-400 text-[18px]">check_circle</span> Logic Visualization</li>
                            </ul>
                            <button onClick={onRegister} className="w-full bg-white text-blue-900 py-3.5 rounded-2xl hover:bg-blue-50 transition-all font-bold text-sm shadow-xl">
                                {t('SelectPlan')}
                            </button>
                        </div>

                        {/* Enterprise Plan (Premium) */}
                        <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col hover:shadow-lg transition-all">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-800">{t('PremiumPlan')}</h3>
                                <div className="flex items-baseline mt-4">
                                    <span className="text-4xl font-black text-slate-900">Custom</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-grow">
                                <li className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> {t('Unlimited')} {t('Activities')}</li>
                                <li className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> {t('Unlimited')} {t('Resources')}</li>
                                <li className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> 24/7 Priority Support</li>
                                <li className="text-sm text-slate-600 flex items-center gap-2"><span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span> Cloud Sync API</li>
                            </ul>
                            <button className="w-full border-2 border-slate-100 text-slate-700 py-3.5 rounded-2xl hover:bg-slate-50 hover:border-slate-300 transition-all font-bold text-sm">
                                {lang === 'zh' ? '联系销售' : 'Contact Sales'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Trusted By Section */}
                <div className="w-full mb-40 opacity-40 grayscale pointer-events-none px-6">
                     <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24">
                         {['EPC', 'AEC', 'ENERGY', 'MFG', 'CONSULT'].map(l => (
                             <span key={l} className="text-2xl font-black tracking-widest text-slate-400 italic">{l}</span>
                         ))}
                     </div>
                </div>
            </main>

            {/* Premium Footer */}
            <footer className="w-full bg-slate-900 text-white pt-24 pb-12 overflow-hidden relative shrink-0">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 relative z-10 text-left">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-8">
                             <div className="bg-blue-600 w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm">
                                <span className="material-symbols-outlined text-[18px]">dynamic_form</span>
                             </div>
                             <span className="font-extrabold text-2xl tracking-tighter">Planner Pro</span>
                        </div>
                        <p className="text-slate-400 max-w-sm mb-8 leading-relaxed font-medium">
                            {lang === 'zh' 
                                ? '我们致力于为大型基建、工业制造和能源项目提供最精确的调度支持。' 
                                : 'Empowering global infrastructure and energy projects with precision scheduling and analytics.'}
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-slate-200">{lang === 'zh' ? '产品' : 'Product'}</h4>
                        <ul className="space-y-4 text-slate-400 font-medium">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Enterprise</a></li>
                            <li><a href="#plans" className="hover:text-blue-400 transition-colors">Pricing</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold mb-6 text-slate-200">{lang === 'zh' ? '支持' : 'Support'}</h4>
                        <ul className="space-y-4 text-slate-400 font-medium">
                            <li><a href="#" className="hover:text-blue-400 transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors">API Status</a></li>
                            <li><a href="http://www.planner.cn" target="_blank" className="hover:text-blue-400 transition-colors font-bold text-blue-500">Planner.cn</a></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6 text-sm text-slate-500 font-medium">
                    <div>© {new Date().getFullYear()} {adminConfig.copyrightText || 'Planner Pro'}.</div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-slate-300">Privacy Policy</a>
                        <a href="#" className="hover:text-slate-300">Terms of Service</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
