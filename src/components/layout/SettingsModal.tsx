"use client";

import { useStore } from "@/store/useStore";
import { X, Download, RotateCcw, FileText, Database, History, Upload, AlertTriangle, FileJson, Users, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { ProfileTab } from "./ProfileTab";
import { UserManagementTab } from "./UserManagementTab";
import { RolePermissionEditor } from "./RolePermissionEditor";

export function SettingsModal({ onClose }: { onClose: () => void }) {
    const { assets, locations, auditLogs, resetData, currentUser, hasPermission, settingsActiveTab } = useStore();
    const [activeTab, setActiveTab] = useState<'general' | 'logs' | 'users' | 'permissions' | 'profile'>((settingsActiveTab as any) || 'general');

    const handleExport = () => {
        const data = {
            assets,
            locations,
            users: useStore.getState().users, // Include users in backup
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proasset-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Category', 'LocationID', 'Price', 'PurchaseDate', 'Status', 'Barcode'];
        const rows = assets.map(a => [
            a.id, `"${a.name}"`, a.category, a.locationId, a.price, a.purchaseDate, a.status, a.barcode
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `assets-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReset = () => {
        if (confirm('WARNING: This will delete ALL data. Are you sure?')) {
            if (confirm('Double Check: This cannot be undone. Confirm reset?')) {
                resetData();
                onClose();
            }
        }
    };

    const canManageUsers = currentUser?.role === 'SUPER_ADMIN';

    return (
        <div className="fixed inset-0 z-[80] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-gray-100 px-6 gap-6 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <AlertTriangle size={14} className={activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'} /> My Profile
                    </button>
                    <button
                        onClick={() => setActiveTab('general')}
                        className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <Database size={14} /> Data Management
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        <History size={14} /> Audit Logs
                    </button>
                    {canManageUsers && (
                        <>
                            <button
                                onClick={() => setActiveTab('users')}
                                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Users size={14} /> Users
                            </button>
                            <button
                                onClick={() => setActiveTab('permissions')}
                                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'permissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                            >
                                <Shield size={14} /> Permissions
                            </button>
                        </>
                    )}
                </div>

                <div className="p-6 overflow-y-auto flex-1 bg-white">
                    {activeTab === 'profile' && <ProfileTab />}

                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Database size={16} /> Data Export
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button onClick={handleExportCSV} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                        <div className="bg-emerald-100 text-emerald-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                            <FileText size={24} />
                                        </div>
                                        <span className="font-bold text-slate-700">Export CSV</span>
                                        <span className="text-xs text-slate-400 mt-1">For Excel / Sheets</span>
                                    </button>
                                    <button onClick={handleExport} className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                        <div className="bg-indigo-100 text-indigo-600 p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform">
                                            <FileJson size={24} />
                                        </div>
                                        <span className="font-bold text-slate-700">Backup JSON</span>
                                        <span className="text-xs text-slate-400 mt-1">Full System Backup</span>
                                    </button>
                                </div>
                            </div>

                            {/* Import Section */}
                            <div className="pt-6 border-t border-slate-100">
                                <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                                    <Upload size={16} /> Import Data
                                </h4>
                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-4 flex gap-3">
                                    <AlertTriangle className="text-amber-600 shrink-0" size={20} />
                                    <div className="text-xs text-amber-800">
                                        <p className="font-bold mb-1">Warning: Destructive Action</p>
                                        Importing a backup file will <strong>permanently overwrite</strong> all current application data.
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <input
                                        type="file"
                                        accept=".json"
                                        id="import-file"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            if (!confirm("Are you sure you want to restore this backup? Current data will be lost.")) {
                                                e.target.value = ''; // Reset input
                                                return;
                                            }

                                            const reader = new FileReader();
                                            reader.onload = (event) => {
                                                try {
                                                    const json = JSON.parse(event.target?.result as string);
                                                    if (!json.assets || !json.locations) {
                                                        throw new Error("Invalid backup file format");
                                                    }
                                                    useStore.getState().importData(json);
                                                    alert("Data restored successfully!");
                                                    onClose();
                                                    window.location.reload(); // Reload to refresh all components
                                                } catch (err) {
                                                    alert("Failed to import data: " + err);
                                                }
                                            };
                                            reader.readAsText(file);
                                        }}
                                    />
                                    <label
                                        htmlFor="import-file"
                                        className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                    >
                                        <Upload size={18} /> Select Backup File
                                    </label>
                                </div>
                            </div>

                            <div className="pt-8 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <RotateCcw size={16} /> Danger Zone
                                </h3>
                                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <h4 className="font-bold text-rose-800">Factory Reset</h4>
                                        <p className="text-xs text-rose-600 mt-1">Permanently delete all assets and locations.</p>
                                    </div>
                                    <button onClick={handleReset} className="bg-white text-rose-600 border border-rose-200 px-4 py-2 rounded-lg text-sm font-bold hover:bg-rose-600 hover:text-white transition-colors shadow-sm">
                                        Reset Data
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-slate-800">Recent Activity</h3>
                                <span className="text-xs text-slate-400">{auditLogs.length} events recorded</span>
                            </div>

                            {auditLogs.length === 0 ? (
                                <div className="text-center py-10 text-slate-400">
                                    <History size={32} className="mx-auto mb-2 opacity-20" />
                                    <p>No activity recorded yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {auditLogs.map(log => (
                                        <div key={log.id} className="flex gap-3 items-start p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${log.action === 'CREATE' ? 'bg-emerald-500' :
                                                log.action === 'DELETE' ? 'bg-rose-500' :
                                                    log.action === 'UPDATE' ? 'bg-blue-500' : 'bg-slate-500'
                                                }`}></div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-800">
                                                    <span className="font-bold uppercase text-[10px] tracking-wider text-slate-400 mr-2">{log.action}</span>
                                                    {log.details}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {formatDate(log.timestamp)} • {log.user}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'users' && <UserManagementTab />}
                    {activeTab === 'permissions' && <RolePermissionEditor />}
                </div>
            </div>
        </div>
    );
}
