
import React, { useState } from 'react';
import { AdminConfig } from '../types';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
    adminConfig: AdminConfig;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, adminConfig }) => {
    const [lang, setLang] = useState<'en' | 'zh'>('zh');

    const content = {
        en: {
            login: "Log in",
            getStarted: "Get Started",
            heroTitle: "Professional Project Scheduling",
            heroSubtitle: "Made Simple",
            heroDesc: "A web-based Critical Path Method (CPM) scheduler inspired by industry standards. Manage WBS, Activities, and Resources with ease—anytime, anywhere.",
            trial: "Start Free Trial",
            existing: "Existing User",
            features: {
                gantt: { t: "Interactive Gantt Chart", d: "Visual timeline with drag-to-zoom, critical path highlighting, and logic lines." },
                wbs: { t: "WBS & Activities", d: "Organize complex projects with a multi-level Work Breakdown Structure and activity table." },
                res: { t: "Resource Analysis", d: "Track labor and material usage with histograms and S-curves to prevent overallocation." }
            },
            plans: {
                choose: "Choose Your Plan",
                trial: { t: "Trial", p: "Free", sub: "Forever free for small tasks" },
                auth: { t: "Authorized", p: "$29.99", sub: "/ year", note: "Great for small projects" },
                prem: { t: "Premium", p: "$69.99", sub: "/ year", note: "Unlimited Access" },
                feats: {
                    limit20: "20 Activities Limit",
                    limit10: "10 Resources Limit",
                    basic: "Basic Scheduling",
                    noPrint: "Watermark Printing",
                    limit500: "500 Activities",
                    limit200: "200 Resources",
                    pdf: "PDF Printing",
                    export: "File Import/Export",
                    unlimited: "Unlimited Activities",
                    unlimitedRes: "Unlimited Resources",
                    adv: "Advanced Analysis",
                    sup: "Priority Support"
                },
                btn: { try: "Try Now", sub: "Subscribe", go: "Go Premium" }
            },
            footer: "All rights reserved."
        },
        zh: {
            login: "登录",
            getStarted: "立即开始",
            heroTitle: "专业级项目进度管理",
            heroSubtitle: "简单高效",
            heroDesc: "基于关键路径法 (CPM) 的 Web 端项目管理工具。轻松管理 WBS、作业和资源，随时随地掌控项目进度。",
            trial: "免费试用",
            existing: "现有用户",
            features: {
                gantt: { t: "交互式甘特图", d: "可视化时间轴，支持拖拽缩放、关键路径高亮及逻辑关系线显示。" },
                wbs: { t: "WBS 与作业", d: "通过多层级工作分解结构 (WBS) 和作业表组织复杂的项目计划。" },
                res: { t: "资源分析", d: "通过资源直方图和 S 曲线跟踪人工与材料使用情况，防止资源超负荷。" }
            },
            plans: {
                choose: "选择您的计划",
                trial: { t: "试用版", p: "免费", sub: "永久免费 (受限)" },
                auth: { t: "授权版", p: "¥99", sub: "/ 年", note: "适合小型项目" },
                prem: { t: "高级版", p: "¥199", sub: "/ 年", note: "无限制访问" },
                feats: {
                    limit20: "限制 20 条作业",
                    limit10: "限制 10 个资源",
                    basic: "基础排程功能",
                    noPrint: "带水印打印",
                    limit500: "500 条作业",
                    limit200: "200 个资源",
                    pdf: "PDF 打印 / 导出",
                    export: "文件导入 / 导出",
                    unlimited: "无限作业数量",
                    unlimitedRes: "无限资源数量",
                    adv: "高级资源分析",
                    sup: "优先技术支持"
                },
                btn: { try: "立即试用", sub: "立即订阅", go: "升级高级版" }
            },
            footer: "版权所有。"
        }
    };

    const t = content[lang];

    return (
        // Added overflow-y-auto and fixed height to ensure scrolling works within the app container
        <div className="h-full w-full bg-white font-sans text-slate-800 overflow-y-auto">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {adminConfig.appLogo ? (
                            <img src={adminConfig.appLogo} alt="Logo" className="h-8 w-auto" />
                        ) : (
                            <div className="text-2xl font-black text-blue-900 tracking-tighter">PLANNER<span className="text-blue-500">WEB</span></div>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="flex border rounded overflow-hidden text-xs font-bold">
                            <button onClick={() => setLang('en')} className={`px-2 py-1 ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>EN</button>
                            <button onClick={() => setLang('zh')} className={`px-2 py-1 ${lang === 'zh' ? 'bg-blue-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'}`}>中</button>
                        </div>
                        <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">{t.login}</button>
                        <button onClick={onRegister} className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-transform active:scale-95 shadow-md">{t.getStarted}</button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                        {t.heroTitle} <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">{t.heroSubtitle}</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        {t.heroDesc}
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={onRegister} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all">{t.trial}</button>
                        <button onClick={onLogin} className="bg-white text-slate-700 border border-slate-300 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-50 transition-colors">{t.existing}</button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">📊</div>
                            <h3 className="text-xl font-bold mb-2">{t.features.gantt.t}</h3>
                            <p className="text-slate-500">{t.features.gantt.d}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 text-2xl">🏗️</div>
                            <h3 className="text-xl font-bold mb-2">{t.features.wbs.t}</h3>
                            <p className="text-slate-500">{t.features.wbs.d}</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 text-2xl">👥</div>
                            <h3 className="text-xl font-bold mb-2">{t.features.res.t}</h3>
                            <p className="text-slate-500">{t.features.res.d}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">{t.plans.choose}</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        
                        {/* Trial */}
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">{t.plans.trial.t}</h3>
                            <div className="text-4xl font-bold mb-6">{t.plans.trial.p}</div>
                            <ul className="space-y-4 mb-8 flex-grow text-slate-300 text-sm">
                                <li className="flex items-center gap-2">✓ {t.plans.feats.limit20}</li>
                                <li className="flex items-center gap-2">✓ {t.plans.feats.limit10}</li>
                                <li className="flex items-center gap-2">✓ {t.plans.feats.basic}</li>
                                <li className="flex items-center gap-2 opacity-70">✓ {t.plans.feats.noPrint}</li>
                            </ul>
                            <button onClick={onRegister} className="w-full py-3 rounded-lg border border-slate-600 font-bold hover:bg-slate-700 transition-colors">{t.plans.btn.try}</button>
                        </div>

                        {/* Authorized */}
                        <div className="bg-blue-600 rounded-2xl p-8 border-2 border-blue-400 flex flex-col transform md:-translate-y-4 shadow-2xl relative">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase">Popular</div>
                            <h3 className="text-xl font-bold text-blue-200 uppercase tracking-widest mb-4">{t.plans.auth.t}</h3>
                            <div className="text-4xl font-bold mb-1">{t.plans.auth.p} <span className="text-lg font-normal text-blue-200">{t.plans.auth.sub}</span></div>
                            <div className="text-xs text-blue-200 mb-6">{t.plans.auth.note}</div>
                            <ul className="space-y-4 mb-8 flex-grow text-white text-sm">
                                <li className="flex items-center gap-2">✓ {t.plans.feats.limit500}</li>
                                <li className="flex items-center gap-2">✓ {t.plans.feats.limit200}</li>
                                <li className="flex items-center gap-2">✓ {t.plans.feats.pdf}</li>
                                <li className="flex items-center gap-2">✓ {t.plans.feats.export}</li>
                            </ul>
                            <button onClick={onRegister} className="w-full py-3 rounded-lg bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors">{t.plans.btn.sub}</button>
                        </div>

                        {/* Premium */}
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col">
                            <h3 className="text-xl font-bold text-purple-400 uppercase tracking-widest mb-4">{t.plans.prem.t}</h3>
                            <div className="text-4xl font-bold mb-1">{t.plans.prem.p} <span className="text-lg font-normal text-slate-400">{t.plans.prem.sub}</span></div>
                            <div className="text-xs text-slate-400 mb-6">{t.plans.prem.note}</div>
                            <ul className="space-y-4 mb-8 flex-grow text-slate-300 text-sm">
                                <li className="flex items-center gap-2 text-white font-bold">✓ {t.plans.feats.unlimited}</li>
                                <li className="flex items-center gap-2 text-white font-bold">✓ {t.plans.feats.unlimitedRes}</li>
                                <li className="flex items-center gap-2">✓ {t.plans.feats.adv}</li>
                                <li className="flex items-center gap-2">✓ {t.plans.feats.sup}</li>
                            </ul>
                            <button onClick={onRegister} className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity">{t.plans.btn.go}</button>
                        </div>

                    </div>
                </div>
            </section>

            <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
                &copy; {new Date().getFullYear()} {adminConfig.copyrightText}. {t.footer}
            </footer>
        </div>
    );
};

export default LandingPage;
