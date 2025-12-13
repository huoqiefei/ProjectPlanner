
import { LicenseInfo } from '../types';

const STORAGE_KEY = 'planner_license_info';

// Helper to generate a simple UUID-like machine ID
function generateMachineId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export function getLicenseInfo(): LicenseInfo {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("License corrupted");
        }
    }
    
    // Initial Trial State
    const initial: LicenseInfo = {
        status: 'trial',
        machineId: generateMachineId()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
}

// SIMULATED SERVER VALIDATION
// In a real app, this function would verify the key against a database
// ensuring the key hasn't been used by a DIFFERENT machineId.
export async function activateLicense(key: string): Promise<{ success: boolean; msg?: string }> {
    const info = getLicenseInfo();
    
    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const cleanKey = key.trim().toUpperCase();

    // 1. Format Check (Example format: PLAN-XXXX-XXXX-XXXX)
    const regex = /^PLAN-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!regex.test(cleanKey)) {
        return { success: false, msg: "Invalid license key format. Expected: PLAN-XXXX-XXXX-XXXX" };
    }

    // 2. Mock Validation Logic (Backend Simulation)
    // Here we hardcode a "used" key to demonstrate the logic.
    const USED_KEY = "PLAN-USED-8888-9999"; 
    
    if (cleanKey === USED_KEY) {
        return { success: false, msg: "This license key is already in use on another device." };
    }

    // 3. Success
    const newInfo: LicenseInfo = {
        ...info,
        status: 'active',
        key: cleanKey,
        activationDate: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newInfo));
    return { success: true };
}

export function deactivateLicense() {
    const info = getLicenseInfo();
    const newInfo: LicenseInfo = {
        ...info,
        status: 'trial',
        key: undefined,
        activationDate: undefined
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newInfo));
    return newInfo;
}

export const TRIAL_LIMIT = 20;
