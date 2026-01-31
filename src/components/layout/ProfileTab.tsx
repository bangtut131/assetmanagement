import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Lock, Save, AlertCircle, Check } from "lucide-react";

export function ProfileTab() {
    const { currentUser, changePassword } = useStore();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChangePassword = () => {
        if (!currentUser) return;

        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: "All fields are required" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: "New passwords do not match" });
            return;
        }

        if (currentUser.password && currentUser.password !== currentPassword) {
            setMessage({ type: 'error', text: "Current password is incorrect" });
            return;
        }

        // Change password
        changePassword(currentUser.id, newPassword);
        setMessage({ type: 'success', text: "Password changed successfully" });

        // Reset form
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                    <Lock size={24} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Security Settings</h3>
                    <p className="text-slate-500 text-sm">Manage your password and account security</p>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Lock size={16} /> Change Password
                </h4>

                {message && (
                    <div className={`p-3 mb-4 rounded-lg text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                        {message.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                        {message.text}
                    </div>
                )}

                <div className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Current Password</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Confirm New Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        onClick={handleChangePassword}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
                    >
                        <Save size={16} /> Update Password
                    </button>
                </div>
            </div>
        </div>
    );
}
