
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User, AdminConfig } from '../types';
import { useTranslation, getInitialLanguage, saveLanguage } from '../utils/i18n';

interface AuthPageProps {
    onLoginSuccess: (user: User) => void;
    adminConfig: AdminConfig;
}

type AuthMode = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, adminConfig }) => {
    const [mode, setMode] = useState<AuthMode>('LOGIN');
    const [lang, setLang] = useState<'en' | 'zh'>(getInitialLanguage());
    
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const { t } = useTranslation(lang);

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
                if (password !== confirmPass) {
                    throw new Error(lang === 'zh' ? "两次密码输入不一致" : "Passwords do not match");
                }
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
            setError(err.message || 'Authentication system error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 w-screen h-screen bg-slate-100 flex items-center justify-center text-slate-900 font-sans z-[200] overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-700 shadow-sm z-[250]"></div>
            
            {/* Background pattern inspired by P6 branding */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
                {Array.from({length: 20}).map((_, i) => (
                    <div key={i} className="whitespace-nowrap text-9xl font-black rotate-[-12deg] mb-10">
                        PLANNER PRO P6 PLANNER PRO P6 PLANNER PRO P6
                    </div>
                ))}
            </div>

            <div className="z-[210] w-full max-w-md mx-6 animate-in fade-in zoom-in-95 duration-500">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4 group transition-all">
                        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white w-12 h-12 flex items-center justify-center rounded-xl font-black text-2xl shadow-xl shadow-blue-900/20">
                             <span className="material-symbols-outlined text-[26px]">grid_view</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                            Planner<span className="text-blue-600">Pro</span>
                            <span className="ml-1 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded align-top">P6</span>
                        </h1>
                    </div>
                    <div className="flex justify-center gap-4 mb-2">
                        <button onClick={() => handleSetLang('zh')} className={`text-[10px] font-bold px-2 py-1 rounded ${lang === 'zh' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border'}`}>中文</button>
                        <button onClick={() => handleSetLang('en')} className={`text-[10px] font-bold px-2 py-1 rounded ${lang === 'en' ? 'bg-blue-600 text-white' : 'bg-white text-slate-400 border'}`}>ENGLISH</button>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-2xl border border-slate-200">
                    <div className="flex border-b border-slate-100 mb-6 gap-6">
                        <button onClick={() => setMode('LOGIN')} className={`pb-3 text-sm font-bold transition-all border-b-2 ${mode === 'LOGIN' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{t('SignIn')}</button>
                        <button onClick={() => setMode('REGISTER')} className={`pb-3 text-sm font-bold transition-all border-b-2 ${mode === 'REGISTER' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400'}`}>{t('SignUp')}</button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'REGISTER' && (
                             <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{t('FullName')}</label>
                                <input required className="w-full bg-slate-50 border p-3 rounded-lg text-sm focus:ring-2 ring-blue-500 outline-none" value={name} onChange={e => setName(e.target.value)} />
                            </div>
                        )}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{t('EmailLabel')}</label>
                            <input required className="w-full bg-slate-50 border p-3 rounded-lg text-sm focus:ring-2 ring-blue-500 outline-none" placeholder="example@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        {mode !== 'FORGOT_PASSWORD' && (
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t('Password')}</label>
                                    {mode === 'LOGIN' && <button type="button" onClick={() => setMode('FORGOT_PASSWORD')} className="text-[10px] font-bold text-blue-600 hover:underline">{t('ForgotPassword')}</button>}
                                </div>
                                <input required type="password" className="w-full bg-slate-50 border p-3 rounded-lg text-sm focus:ring-2 ring-blue-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                            </div>
                        )}
                        {mode === 'REGISTER' && (
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">{t('ConfirmPassword')}</label>
                                <input required type="password" className="w-full bg-slate-50 border p-3 rounded-lg text-sm focus:ring-2 ring-blue-500 outline-none" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                            </div>
                        )}
                        
                        {error && <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">{error}</div>}
                        {msg && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">{msg}</div>}
                        
                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/10 active:scale-95">
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : (mode === 'LOGIN' ? t('SignIn') : mode === 'REGISTER' ? t('SignUp') : t('SendResetLink'))}
                        </button>
                    </form>
                </div>
                
                <p className="mt-8 text-center text-slate-400 text-xs font-medium">
                    {adminConfig.copyrightText}
                </p>
            </div>
        </div>
    );
};

export default AuthPage;
