
import React, { useState } from 'react';
import { LicenseInfo } from '../types';
import { activateLicense, TRIAL_LIMIT } from '../services/licenseService';

interface LicenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    licenseInfo: LicenseInfo;
    onLicenseUpdate: (info: LicenseInfo) => void;
}

const LicenseModal: React.FC<LicenseModalProps> = ({ isOpen, onClose, licenseInfo, onLicenseUpdate }) => {
    const [keyInput, setKeyInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleActivate = async () => {
        setIsLoading(true);
        setError('');
        
        try {
            const result = await activateLicense(keyInput);
            if (result.success) {
                setSuccess(true);
                // Refresh local state
                const stored = localStorage.getItem('planner_license_info');
                if (stored) onLicenseUpdate(JSON.parse(stored));
                setTimeout(() => {
                    onClose();
                    setSuccess(false);
                    setKeyInput('');
                }, 1500);
            } else {
                setError(result.msg || "Activation failed");
            }
        } catch (e) {
            setError("Network error connecting to activation server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[100] backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-2xl w-96 overflow-hidden">
                <div className={`px-6 py-4 flex justify-between items-center ${licenseInfo.status === 'active' ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 'bg-slate-800'}`}>
                    <h3 className="text-white font-bold text-lg">Product Activation</h3>
                    <button onClick={onClose} className="text-white hover:text-slate-300">×</button>
                </div>
                
                <div className="p-6">
                    {licenseInfo.status === 'active' ? (
                        <div className="text-center space-y-4">
                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl">
                                ✓
                            </div>
                            <h4 className="text-xl font-bold text-slate-800">Product Activated</h4>
                            <p className="text-sm text-slate-500">
                                Thank you for purchasing P6 Professional Web. 
                                <br/>You have access to all features.
                            </p>
                            <div className="bg-slate-100 p-2 rounded text-xs text-left">
                                <p><strong>License Key:</strong> {licenseInfo.key}</p>
                                <p><strong>Machine ID:</strong> <span className="font-mono">{licenseInfo.machineId.substring(0, 12)}...</span></p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-3 text-sm text-orange-700">
                                <strong>Trial Mode Active</strong>
                                <p className="mt-1">
                                    Limited to {TRIAL_LIMIT} activities. Purchase a license key to unlock unlimited projects.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-1 uppercase">Enter License Key</label>
                                <input 
                                    className="w-full border border-slate-300 rounded p-2 text-sm font-mono uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="PLAN-XXXX-XXXX-XXXX"
                                    value={keyInput}
                                    onChange={e => setKeyInput(e.target.value.toUpperCase())}
                                    disabled={isLoading || success}
                                />
                            </div>

                            {error && <div className="text-red-600 text-xs font-bold">{error}</div>}
                            {success && <div className="text-green-600 text-xs font-bold">Activation Successful!</div>}

                            <button 
                                onClick={handleActivate} 
                                disabled={isLoading || success || !keyInput}
                                className={`w-full py-2 rounded text-white font-bold transition-all ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isLoading ? 'Verifying...' : 'Activate Now'}
                            </button>
                            
                            <div className="text-[10px] text-slate-400 text-center mt-2">
                                Machine ID: {licenseInfo.machineId}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LicenseModal;
