"use client";

import { useState } from "react";
import { AuditReports } from "@/components/audit/AuditReports";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { AuditSessionManager } from "@/components/audit/AuditSessionManager";
import { ClipboardList, BoxSelect, FileBarChart } from "lucide-react";

export default function AuditPage() {
    const [activeTab, setActiveTab] = useState<'logs' | 'session' | 'reports'>('session');

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex gap-4 border-b border-gray-200 overflow-x-auto">
                <button
                    onClick={() => setActiveTab('session')}
                    className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'session'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <BoxSelect size={18} />
                    Stock Opname
                </button>
                <button
                    onClick={() => setActiveTab('reports')}
                    className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'reports'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <FileBarChart size={18} />
                    Audit Reports
                </button>
                <button
                    onClick={() => setActiveTab('logs')}
                    className={`flex items-center gap-2 pb-4 px-2 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'logs'
                        ? 'border-indigo-600 text-indigo-600'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                        }`}
                >
                    <ClipboardList size={18} />
                    Activity Logs
                </button>
            </div>

            <div className="min-h-[600px]">
                {activeTab === 'session' && <AuditSessionManager />}
                {activeTab === 'reports' && <AuditReports />}
                {activeTab === 'logs' && <AuditLogTable />}
            </div>
        </div>
    );
}
