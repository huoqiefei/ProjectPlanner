
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
        <div className="absolute inset-0 w-full h-full bg-slate-50 text-[#1F1F1F] font-sans selection:bg-blue-600 selection:text-white flex flex-col overflow-y-auto custom-scrollbar scroll-smooth z-[100]">
            {/* Navigation Bar */}
            <header className="w-full mx-auto px-6 py-4 flex items-center justify-between sticky top-0 z-[110] bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
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
            <main className="flex-grow flex flex-col items-center px-4 text-center max-w-7xl mx-auto w-full pt-20 pb-32">
                <div className="mb-20 animate-in fade-in slide-in-from-bottom-6 duration-1000 max-w-6xl relative">
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10"></div>
                    <div className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 tracking-widest uppercase shadow-sm text-blue-600">
                        <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                        Enterprise Grade CPM Engine
                    </div>
                    
                    {/* Tagline: whitespace-nowrap enforced */}
                    <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black leading-[1.1] mb-8 text-slate-900 tracking-tighter whitespace-nowrap overflow-hidden text-ellipsis px-4">
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

                {/* Showcase Section with detailed mocks */}
                <div id="showcase" className="w-full mb-40 text-left scroll-mt-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-black text-slate-900 mb-4">{t('ShowcaseTitle')}</h2>
                        <p className="text-slate-500 font-medium max-w-2xl mx-auto">{t('ShowcaseDesc')}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden group">
                            <div className="bg-slate-800 p-4 flex justify-between">
                                <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{t('Preview1Title')}</div>
                                <div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500"></div><div className="w-2 h-2 rounded-full bg-yellow-500"></div><div className="w-2 h-2 rounded-full bg-green-500"></div></div>
                            </div>
                            <div className="h-64 bg-white p-6 relative">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="flex items-center gap-4 mb-5">
                                        <div className="w-24 h-2 bg-slate-100 rounded"></div>
                                        <div className="flex-grow h-6 bg-slate-50 relative rounded shadow-inner">
                                            <div className={`h-full rounded ${i===2?'bg-red-500':'bg-blue-600'}`} style={{width:`${30+i*10}%`, marginLeft: `${i*8}%`}}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden group">
                            <div className="bg-slate-800 p-4"><div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{t('Preview2Title')}</div></div>
                            <div className="h-64 bg-slate-50 p-8 flex items-end gap-3">
                                {[40,70,90,100,60,85,50,75,40,95].map((h, i) => (
                                    <div key={i} className={`flex-grow rounded-t-lg ${h>80?'bg-red-500':'bg-indigo-600'}`} style={{height:`${h}%`}}></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div id="plans" className="w-full mb-40 text-left scroll-mt-24">
                    <h2 className="text-3xl font-black text-slate-900 mb-12 border-l-4 border-blue-600 pl-6">{t('Plans')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col hover:shadow-xl transition-all">
                            <h3 className="text-xl font-bold mb-4">{t('FreePlan')}</h3>
                            <div className="text-4xl font-black mb-6">$0<span className="text-sm font-normal text-slate-400">/mo</span></div>
                            <button onClick={onRegister} className="w-full py-3 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50 transition-colors">{t('SelectPlan')}</button>
                        </div>
                        <div className="bg-blue-900 text-white p-8 rounded-3xl flex flex-col scale-105 shadow-2xl relative">
                            <div className="absolute top-0 right-8 bg-blue-500 px-3 py-1 rounded-b-lg text-[10px] font-black uppercase">Most Popular</div>
                            <h3 className="text-xl font-bold mb-4">{t('StandardPlan')}</h3>
                            <div className="text-4xl font-black mb-6">$19<span className="text-sm font-normal text-blue-300">/mo</span></div>
                            <button onClick={onRegister} className="w-full py-3 rounded-2xl bg-white text-blue-900 font-bold hover:bg-blue-50 transition-colors shadow-lg">{t('SelectPlan')}</button>
                        </div>
                        <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col hover:shadow-xl transition-all">
                            <h3 className="text-xl font-bold mb-4">{t('PremiumPlan')}</h3>
                            <div className="text-4xl font-black mb-6">Custom</div>
                            <button className="w-full py-3 rounded-2xl border-2 border-slate-100 font-bold hover:bg-slate-50 transition-colors">{lang==='zh'?'联系销售':'Contact Sales'}</button>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full bg-slate-900 text-white py-12 shrink-0">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                         <div className="bg-blue-600 w-8 h-8 flex items-center justify-center rounded-lg font-black text-sm">P</div>
                         <span className="font-extrabold text-xl tracking-tighter">Planner Pro</span>
                    </div>
                    <div className="text-sm text-slate-500">© {new Date().getFullYear()} {adminConfig.copyrightText}.</div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
