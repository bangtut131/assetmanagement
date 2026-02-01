"use client";

import { useSearchParams, useRouter } from "next/navigation";

import { useStore } from "@/store/useStore";
import { Download, RotateCcw, FileText, Database, History, Upload, AlertTriangle, FileJson, Users, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { ProfileTab } from "../layout/ProfileTab";
import { UserManagementTab } from "../layout/UserManagementTab";
import { RolePermissionEditor } from "../layout/RolePermissionEditor";

export function SettingsContent() {
    const { assets, locations, auditLogs, resetData, currentUser, hasPermission } = useStore();
    const searchParams = useSearchParams();
    const router = useRouter();
    const tabParam = searchParams.get('tab');

    // Determine initial tab from URL or store or default
    const initialTab = (tabParam as 'general' | 'logs' | 'users' | 'permissions' | 'profile') || 'general';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Sync state with URL when tab changes (optional but good for history)
    const handleTabChange = (tab: typeof activeTab) => {
        setActiveTab(tab);
        // Update URL without full reload
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('tab', tab);
        window.history.pushState({}, '', newUrl);
    };

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
                // onClose(); // No longer needed
            }
        }
    };

    const canManageUsers = currentUser?.role === 'SUPER_ADMIN';

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Header for Mobile/Desktop Consistency */}
            <div className="p-6 border-b border-gray-200 bg-white">
                <h2 className="text-2xl font-bold text-slate-800">System Settings</h2>
                <p className="text-slate-500 text-sm">Manage your application preferences and data</p>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200 px-6 gap-6 overflow-x-auto flex sticky top-0 z-10 shadow-sm">
                <button
                    onClick={() => handleTabChange('profile')}
                    className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <AlertTriangle size={16} className={activeTab === 'profile' ? 'text-indigo-600' : 'text-slate-400'} /> My Profile
                </button>
                <button
                    onClick={() => handleTabChange('general')}
                    className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'general' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <Database size={16} /> Data Management
                </button>
                <button
                    onClick={() => handleTabChange('logs')}
                    className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'logs' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                >
                    <History size={16} /> Audit Logs
                </button>
                {canManageUsers && (
                    <>
                        <button
                            onClick={() => handleTabChange('users')}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Users size={16} /> Users
                        </button>
                        <button
                            onClick={() => handleTabChange('permissions')}
                            className={`py-4 px-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'permissions' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        >
                            <Shield size={16} /> Permissions
                        </button>
                    </>
                )}
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 max-w-7xl mx-auto w-full">
                {activeTab === 'profile' && <ProfileTab />}

                {activeTab === 'general' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-6 flex items-center gap-2 pb-4 border-b border-slate-100">
                                <Database size={16} /> Data Export
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button onClick={handleExportCSV} className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                    <div className="bg-emerald-100 text-emerald-600 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                        <FileText size={32} />
                                    </div>
                                    <span className="font-bold text-lg text-slate-700">Export CSV</span>
                                    <span className="text-sm text-slate-400 mt-1">For Excel / Sheets</span>
                                </button>
                                <button onClick={handleExport} className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all group">
                                    <div className="bg-indigo-100 text-indigo-600 p-4 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                                        <FileJson size={32} />
                                    </div>
                                    <span className="font-bold text-lg text-slate-700">Backup JSON</span>
                                    <span className="text-sm text-slate-400 mt-1">Full System Backup</span>
                                </button>
                            </div>
                        </div>

                        {/* Import Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h4 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
                                <Upload size={18} /> Import Data
                            </h4>
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mb-6 flex gap-3">
                                <AlertTriangle className="text-amber-600 shrink-0" size={24} />
                                <div className="text-sm text-amber-800">
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
                                    className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 font-bold hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                >
                                    <Upload size={20} /> Select Backup File
                                </label>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-sm font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <RotateCcw size={16} /> Danger Zone
                            </h3>
                            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-rose-800">Factory Reset</h4>
                                    <p className="text-sm text-rose-600 mt-1">Permanently delete all assets, locations, and history.</p>
                                </div>
                                <button onClick={handleReset} className="w-full md:w-auto bg-white text-rose-600 border border-rose-200 px-6 py-3 rounded-xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-colors shadow-sm">
                                    Reset Data
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 text-lg">Recent Activity</h3>
                            <span className="text-xs font-medium px-3 py-1 bg-slate-100 text-slate-500 rounded-full">{auditLogs.length} events</span>
                        </div>

                        {auditLogs.length === 0 ? (
                            <div className="text-center py-20 text-slate-400">
                                <History size={48} className="mx-auto mb-4 opacity-20" />
                                <p>No activity recorded yet.</p>
                            </div>
                        ) : (
                            <div className="space-y-0 divide-y divide-slate-100">
                                {auditLogs.map(log => (
                                    <div key={log.id} className="flex gap-4 items-start p-4 hover:bg-slate-50 transition-colors -mx-4 px-4">
                                        <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${log.action === 'CREATE' ? 'bg-emerald-500 shadow-md shadow-emerald-200' :
                                            log.action === 'DELETE' ? 'bg-rose-500 shadow-md shadow-rose-200' :
                                                log.action === 'UPDATE' ? 'bg-blue-500 shadow-md shadow-blue-200' : 'bg-slate-500'
                                            }`}></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-800">
                                                <span className={`font-bold uppercase text-[10px] tracking-wider mr-2 px-1.5 py-0.5 rounded ${log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                                                    log.action === 'DELETE' ? 'bg-rose-100 text-rose-700' :
                                                        log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                                                    }`}>{log.action}</span>
                                                {log.details}
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                                {formatDate(log.timestamp)}
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="font-medium text-slate-500">{log.user}</span>
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
    );
}
