
import { User, UserRole, FeatureKey } from '../types';
import { API_ENDPOINTS } from './config';

const SESSION_KEY = 'planner_auth_token';
const USER_KEY = 'planner_user_info';

class AuthService {
    
    // --- API Interactions ---

    async login(email: string, password: string): Promise<User> {
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: email, // WordPress JWT plugin typically expects 'username'
                    password: password
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Login failed');
            }

            const data = await response.json();
            
            // data.token is the JWT
            // data.user_email, data.user_display_name, data.user_role come from our custom PHP filter
            
            const user: User = {
                id: String(data.user_id || 0),
                email: data.user_email,
                name: data.user_display_name,
                role: (data.user_role as UserRole) || 'trial',
                createdAt: new Date().toISOString() // API doesn't usually return this in token, placeholder
            };

            this.setSession(data.token, user);
            return user;

        } catch (error: any) {
            console.error("Login Error:", error);
            throw new Error(error.message || "Connection to server failed");
        }
    }

    async register(email: string, password: string, name: string): Promise<void> {
        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Registration failed');
            }
            
            // Registration successful, user must now login
            return;
        } catch (error: any) {
            throw new Error(error.message || "Registration failed");
        }
    }

    async resetPassword(email: string): Promise<void> {
        try {
            const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                 // We generally don't want to expose if email exists or not for security,
                 // but for debugging we log it.
                 console.warn("Reset password request failed");
            }
            return;
        } catch (error: any) {
            throw new Error(error.message || "Failed to send reset link");
        }
    }

    // Note: mockForceChangePassword is removed as we now rely on WP email flow

    // --- Session Management ---

    logout() {
        localStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(USER_KEY);
    }

    getCurrentUser(): User | null {
        const userStr = localStorage.getItem(USER_KEY);
        if (!userStr) return null;
        try {
            return JSON.parse(userStr);
        } catch (e) {
            this.logout();
            return null;
        }
    }

    getToken(): string | null {
        return localStorage.getItem(SESSION_KEY);
    }

    private setSession(token: string, user: User) {
        localStorage.setItem(SESSION_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    // --- Permissions Logic (Same as before) ---

    hasPermission(user: User | null, feature: FeatureKey): boolean {
        if (!user) return false;
        // Map WP 'administrator' to our internal 'admin' role if needed
        const role = user.role === 'administrator' ? 'admin' : user.role;

        if (role === 'admin') return true;

        switch (feature) {
            case 'SAVE_PROJECT':
            case 'EXPORT_FILE':
            case 'PRINT':
                return ['authorized', 'premium', 'administrator'].includes(role);
            
            case 'BATCH_ASSIGN':
            case 'RESOURCE_ANALYSIS':
                return ['premium', 'administrator'].includes(role);
            
            case 'ADMIN_CONFIG':
                return false; // Only strict admin
            
            default:
                return true;
        }
    }

    getRoleLabel(role: string): string {
        switch(role) {
            case 'trial': return 'Trial User';
            case 'authorized': return 'Authorized User';
            case 'premium': return 'Premium User';
            case 'admin': case 'administrator': return 'Administrator';
            default: return 'User';
        }
    }
}

export const authService = new AuthService();
