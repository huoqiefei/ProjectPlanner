
import { User, UserRole, FeatureKey } from '../types';
import { API_ENDPOINTS } from './config';

const SESSION_KEY = 'planner_auth_token';
const USER_KEY = 'planner_user_info';

class AuthService {
    
    async login(email: string, password: string): Promise<User> {
        try {
            // WordPress JWT Auth expects 'username' and 'password'
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    username: email,
                    password: password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Return a user-friendly error message from WP or a default one
                throw new Error(data.message || (response.status === 403 ? 'Invalid username or password' : 'Connection failed'));
            }
            
            // Expected data: { token, user_email, user_display_name, user_role, user_id }
            // Note: user_role/display_name usually require a WP filter 'jwt_auth_token_before_dispatch'
            const user: User = {
                id: String(data.user_id || 0),
                email: data.user_email || email,
                name: data.user_display_name || email.split('@')[0],
                role: (data.user_role as UserRole) || 'trial',
                createdAt: new Date().toISOString()
            };

            this.setSession(data.token, user);
            return user;

        } catch (error: any) {
            console.error("AuthService.login Error:", error);
            throw error;
        }
    }

    async register(email: string, password: string, name: string): Promise<void> {
        try {
            const response = await fetch(API_ENDPOINTS.REGISTER, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Registration failed. The email might already be in use.');
            }
            return;
        } catch (error: any) {
            console.error("AuthService.register Error:", error);
            throw error;
        }
    }

    async resetPassword(email: string): Promise<void> {
        try {
            await fetch(API_ENDPOINTS.RESET_PASSWORD, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            // We return success even if email doesn't exist for security
            return;
        } catch (error: any) {
            throw new Error("Failed to connect to authentication server.");
        }
    }

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

    hasPermission(user: User | null, feature: FeatureKey): boolean {
        if (!user) return false;
        const role = user.role?.toLowerCase() || 'trial';
        if (role === 'admin' || role === 'administrator') return true;

        switch (feature) {
            case 'SAVE_PROJECT':
            case 'EXPORT_FILE':
            case 'PRINT':
                return ['authorized', 'premium', 'administrator', 'admin'].includes(role);
            case 'BATCH_ASSIGN':
            case 'RESOURCE_ANALYSIS':
            case 'CLOUD_BACKUP':
                return ['premium', 'administrator', 'admin'].includes(role);
            default:
                return true;
        }
    }
}

export const authService = new AuthService();
