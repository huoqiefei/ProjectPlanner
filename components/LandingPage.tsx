
import React from 'react';
import { AdminConfig } from '../types';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
    adminConfig: AdminConfig;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, adminConfig }) => {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-800 overflow-y-auto">
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
                    <div className="flex gap-4">
                        <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">Log in</button>
                        <button onClick={onRegister} className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 transition-transform active:scale-95 shadow-md">Get Started</button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 text-center bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
                        Professional Project Scheduling <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Made Simple</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        A web-based Critical Path Method (CPM) scheduler inspired by industry standards. Manage WBS, Activities, and Resources with ease—anytime, anywhere.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={onRegister} className="bg-blue-600 text-white px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:bg-blue-700 hover:-translate-y-1 transition-all">Start Free Trial</button>
                        <button onClick={onLogin} className="bg-white text-slate-700 border border-slate-300 px-8 py-4 rounded-lg font-bold text-lg hover:bg-slate-50 transition-colors">Existing User</button>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">📊</div>
                            <h3 className="text-xl font-bold mb-2">Interactive Gantt Chart</h3>
                            <p className="text-slate-500">Visual timeline with drag-to-zoom, critical path highlighting, and logic lines.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4 text-2xl">🏗️</div>
                            <h3 className="text-xl font-bold mb-2">WBS & Activities</h3>
                            <p className="text-slate-500">Organize complex projects with a multi-level Work Breakdown Structure and activity table.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 text-2xl">👥</div>
                            <h3 className="text-xl font-bold mb-2">Resource Analysis</h3>
                            <p className="text-slate-500">Track labor and material usage with histograms and S-curves to prevent overallocation.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        
                        {/* Trial */}
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col">
                            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Trial</h3>
                            <div className="text-4xl font-bold mb-6">Free</div>
                            <ul className="space-y-4 mb-8 flex-grow text-slate-300 text-sm">
                                <li className="flex items-center gap-2">✓ 20 Activities Limit</li>
                                <li className="flex items-center gap-2">✓ 10 Resources Limit</li>
                                <li className="flex items-center gap-2">✓ Basic Scheduling</li>
                                <li className="flex items-center gap-2 opacity-50">✕ Export/Print</li>
                            </ul>
                            <button onClick={onRegister} className="w-full py-3 rounded-lg border border-slate-600 font-bold hover:bg-slate-700 transition-colors">Try Now</button>
                        </div>

                        {/* Authorized */}
                        <div className="bg-blue-600 rounded-2xl p-8 border-2 border-blue-400 flex flex-col transform md:-translate-y-4 shadow-2xl relative">
                            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg uppercase">Popular</div>
                            <h3 className="text-xl font-bold text-blue-200 uppercase tracking-widest mb-4">Authorized</h3>
                            <div className="text-4xl font-bold mb-1">¥99 <span className="text-lg font-normal text-blue-200">/ year</span></div>
                            <div className="text-xs text-blue-200 mb-6">Great for small projects</div>
                            <ul className="space-y-4 mb-8 flex-grow text-white text-sm">
                                <li className="flex items-center gap-2">✓ 500 Activities</li>
                                <li className="flex items-center gap-2">✓ 200 Resources</li>
                                <li className="flex items-center gap-2">✓ PDF Printing</li>
                                <li className="flex items-center gap-2">✓ File Import/Export</li>
                            </ul>
                            <button onClick={onRegister} className="w-full py-3 rounded-lg bg-white text-blue-600 font-bold hover:bg-blue-50 transition-colors">Subscribe</button>
                        </div>

                        {/* Premium */}
                        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 flex flex-col">
                            <h3 className="text-xl font-bold text-purple-400 uppercase tracking-widest mb-4">Premium</h3>
                            <div className="text-4xl font-bold mb-1">¥199 <span className="text-lg font-normal text-slate-400">/ year</span></div>
                            <div className="text-xs text-slate-400 mb-6">Unlimited Access</div>
                            <ul className="space-y-4 mb-8 flex-grow text-slate-300 text-sm">
                                <li className="flex items-center gap-2 text-white font-bold">✓ Unlimited Activities</li>
                                <li className="flex items-center gap-2 text-white font-bold">✓ Unlimited Resources</li>
                                <li className="flex items-center gap-2">✓ Advanced Analysis</li>
                                <li className="flex items-center gap-2">✓ Priority Support</li>
                            </ul>
                            <button onClick={onRegister} className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:opacity-90 transition-opacity">Go Premium</button>
                        </div>

                    </div>
                </div>
            </section>

            <footer className="bg-slate-900 text-slate-500 py-8 text-center text-sm border-t border-slate-800">
                &copy; {new Date().getFullYear()} {adminConfig.copyrightText}. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;
