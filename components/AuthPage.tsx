
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { User, AdminConfig } from '../types';
import LandingPage from './LandingPage';
import { useTranslation, getInitialLanguage, saveLanguage } from '../utils/i18n';

interface AuthPageProps {
    onLoginSuccess: (user: User) => void;
    adminConfig: AdminConfig;
}

type AuthMode = 'LANDING' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, adminConfig }) => {
    const [mode, setMode] = useState<AuthMode>('LANDING');
    const [lang, setLang] = useState<'en' | 'zh'>(getInitialLanguage());
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const { t } = useTranslation(lang);

    // Sync language choice if changed in landing
    const handleSetLang = (l: 'en' | 'zh') => {
        setLang(l);
        saveLanguage(l);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);

        try {
            if (mode === 'LOGIN') {
                const user = await authService.login(email, password);
                onLoginSuccess(user);
            } else if (mode === 'REGISTER') {
                if (password !== confirmPass) throw new Error(lang === 'zh' ? "两次密码输入不一致" : "Passwords do not match");
                await authService.register(email, password, name);
                setMsg(lang === 'zh' ? "注册成功！现在请登录您的账号。" : "Registration successful! You can now sign in.");
                setMode('LOGIN');
                setPassword('');
            } else if (mode === 'FORGOT_PASSWORD') {
                await authService.resetPassword(email);
                setMsg(t('ResetLinkSent'));
                setTimeout(() => setMode('LOGIN'), 5000);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication error');
        } finally {
            setLoading(false);
        }
    };

    if (mode === 'LANDING') {
        return (
            <LandingPage 
                onLogin={() => setMode('LOGIN')} 
                onRegister={() => setMode('REGISTER')} 
                adminConfig={adminConfig} 
                lang={lang}
                setLang={handleSetLang}
            />
        );
    }

    return (
        <div className="fixed inset-0 w-screen h-screen bg-slate-50 flex items-center justify-center text-slate-900 font-sans z-[100] overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600 shadow-sm z-50"></div>
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="z-10 w-full max-w-md mx-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-10">
                    <div 
                        className="cursor-pointer inline-flex items-center gap-3 mb-6 group transition-all" 
                        onClick={() => setMode('LANDING')}
                    >
                        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white w-12 h-12 flex items-center justify-center rounded-2xl font-black text-2xl group-hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                             <span className="material-symbols-outlined text-[24px]">dynamic_form</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                            Planner<span className="text-blue-600">Pro</span>
                        </h1>
                    </div>
                    <p className="text-slate-400 text-[11px] font-black tracking-[0.2em] uppercase">
                        {mode === 'LOGIN' ? t('WelcomeBack') : mode === 'REGISTER' ? t('CreateAccount') : t('ResetPassword')}
                    </p>
                </div>

                <div className="bg-white/80 backdrop-blur-2xl p-10 rounded-[32px] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-white relative overflow-hidden">
                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {mode === 'REGISTER' && (
                             <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('FullName')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">person</span>
                                    <input 
                                        required
                                        type="text" 
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-slate-900 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                                        placeholder="John Carter"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('EmailLabel')}</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">alternate_email</span>
                                <input 
                                    required
                                    type={mode === 'LOGIN' ? "text" : "email"}
                                    className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-slate-900 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                                    placeholder={t('EmailPlaceholder')}
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {mode !== 'FORGOT_PASSWORD' && (
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Password')}</label>
                                    {mode === 'LOGIN' && (
                                        <button 
                                            type="button"
                                            onClick={() => setMode('FORGOT_PASSWORD')} 
                                            className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest"
                                        >
                                            {t('ForgotPassword')}
                                        </button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">lock</span>
                                    <input 
                                        required
                                        type="password" 
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-slate-900 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {mode === 'REGISTER' && (
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">{t('ConfirmPassword')}</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg group-focus-within:text-blue-600 transition-colors">security</span>
                                    <input 
                                        required
                                        type="password" 
                                        className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl p-3.5 pl-12 text-slate-900 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 text-sm font-medium"
                                        placeholder="••••••••"
                                        value={confirmPass}
                                        onChange={e => setConfirmPass(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 text-red-600 text-[11px] p-3.5 rounded-xl border border-red-100 font-bold flex items-center gap-2.5 animate-pulse">
                                <span className="material-symbols-outlined text-[16px]">warning</span>
                                {error}
                            </div>
                        )}
                        
                        {msg && (
                            <div className="bg-emerald-50 text-emerald-700 text-[11px] p-3.5 rounded-xl border border-emerald-100 font-bold flex items-center gap-2.5">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                {msg}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-900/10 transition-all active:transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-sm flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    {mode === 'LOGIN' ? t('SignIn') : mode === 'REGISTER' ? t('CreateAccount') : t('SendResetLink')}
                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-slate-100 flex flex-col items-center gap-4">
                        {mode === 'LOGIN' ? (
                            <button 
                                onClick={() => setMode('REGISTER')} 
                                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                {t('NoAccountYet')}
                            </button>
                        ) : (
                            <button 
                                onClick={() => setMode('LOGIN')} 
                                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
                            >
                                {t('AlreadyHaveAccount')}
                            </button>
                        )}
                    </div>
                </div>
                
                <div className="mt-10 text-center">
                    <button 
                        onClick={() => setMode('LANDING')} 
                        className="text-[10px] font-black text-slate-400 hover:text-slate-900 transition-all flex items-center justify-center gap-1.5 mx-auto uppercase tracking-[0.2em]"
                    >
                        <span className="material-symbols-outlined text-[16px]">west</span> {t('BackToHome')}
                    </button>
                </div>
            </div>
            
            <div className="absolute bottom-8 text-slate-400 text-[10px] text-center w-full font-bold opacity-30 tracking-widest uppercase">
                 &copy; {new Date().getFullYear()} {adminConfig.copyrightText || 'Planner Pro'}.
            </div>
        </div>
    );
};

export default AuthPage;
