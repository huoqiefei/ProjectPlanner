
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { User, AdminConfig } from '../types';
import { WP_API_URL } from '../services/config';
import LandingPage from './LandingPage';

interface AuthPageProps {
    onLoginSuccess: (user: User) => void;
    adminConfig: AdminConfig;
}

type AuthMode = 'LANDING' | 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD';

const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, adminConfig }) => {
    const [mode, setMode] = useState<AuthMode>('LANDING');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');

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
                if (password !== confirmPass) throw new Error("Passwords do not match");
                await authService.register(email, password, name);
                setMsg("Registration successful! Please login.");
                setMode('LOGIN');
                setPassword('');
            } else if (mode === 'FORGOT_PASSWORD') {
                await authService.resetPassword(email);
                setMsg("If an account exists, a reset link has been sent to your email.");
                setTimeout(() => setMode('LOGIN'), 5000);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
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
            />
        );
    }

    return (
        <div className="flex h-screen w-screen bg-slate-900 relative overflow-hidden font-sans items-center justify-center">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="z-10 bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700 mx-4">
                <div className="text-center mb-6">
                    {adminConfig.appLogo ? (
                        <img src={adminConfig.appLogo} alt="Logo" className="h-12 mx-auto mb-2 object-contain" />
                    ) : (
                        <h1 className="text-3xl font-black text-slate-800 tracking-tighter cursor-pointer" onClick={() => setMode('LANDING')}>
                            {adminConfig.appName}
                        </h1>
                    )}
                    <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider mt-1">
                        {mode === 'LOGIN' ? 'User Login' : mode === 'REGISTER' ? 'Create Account' : 'Password Recovery'}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2">Connecting to: {WP_API_URL}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'REGISTER' && (
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Full Name</label>
                            <input 
                                required
                                type="text" 
                                className="w-full border border-slate-300 rounded p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="John Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Email Address / Username</label>
                        <input 
                            required
                            type={mode === 'LOGIN' ? "text" : "email"}
                            className="w-full border border-slate-300 rounded p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    {mode !== 'FORGOT_PASSWORD' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Password</label>
                            <input 
                                required
                                type="password" 
                                className="w-full border border-slate-300 rounded p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    )}

                    {mode === 'REGISTER' && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Confirm Password</label>
                            <input 
                                required
                                type="password" 
                                className="w-full border border-slate-300 rounded p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="••••••••"
                                value={confirmPass}
                                onChange={e => setConfirmPass(e.target.value)}
                            />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-2 rounded border border-red-200 text-center">
                            {error}
                        </div>
                    )}
                    
                    {msg && (
                        <div className="bg-green-50 text-green-600 text-sm p-2 rounded border border-green-200 text-center">
                            {msg}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : (mode === 'LOGIN' ? 'Sign In' : mode === 'REGISTER' ? 'Register' : 'Send Reset Link')}
                    </button>
                </form>

                <div className="mt-6 flex justify-between text-xs text-slate-500 font-medium">
                    {mode === 'LOGIN' ? (
                        <>
                            <button onClick={() => setMode('REGISTER')} className="hover:text-blue-600 hover:underline">Create Account</button>
                            <button onClick={() => setMode('FORGOT_PASSWORD')} className="hover:text-blue-600 hover:underline">Forgot Password?</button>
                        </>
                    ) : (
                        <button onClick={() => setMode('LOGIN')} className="hover:text-blue-600 hover:underline w-full text-center">Back to Login</button>
                    )}
                </div>
                
                {mode !== 'LANDING' && (
                    <div className="mt-4 text-center">
                        <button onClick={() => setMode('LANDING')} className="text-xs text-slate-400 hover:text-slate-600 hover:underline">← Back to Home</button>
                    </div>
                )}
            </div>
            
            <div className="absolute bottom-4 text-slate-500 text-xs text-center w-full opacity-60">
                 &copy; {new Date().getFullYear()} {adminConfig.copyrightText || 'Planner Web'}. All rights reserved.
            </div>
        </div>
    );
};

export default AuthPage;
