"use client";

import { useStore } from "@/store/useStore";
import { formatDate } from "@/lib/utils";
import { useState } from "react";
import { FileText, Calendar, User, CheckCircle, AlertTriangle, ChevronRight, ArrowLeft, Printer } from "lucide-react";

export function AuditReports() {
    const { auditSessions, assets } = useStore();
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

    const completedSessions = auditSessions.filter(s => s.status === 'Completed' || s.status === 'Cancelled');

    if (selectedSessionId) {
        const session = auditSessions.find(s => s.id === selectedSessionId);
        if (!session) return <div className="p-8 text-center">Session not found</div>;

        const totalAssets = session.totalAssetsToCheck;
        const scannedCount = session.scannedAssets.length;
        const missingCount = session.missingAssets.length;
        const accuracy = totalAssets > 0 ? (scannedCount / totalAssets) * 100 : 0;

        // Get missing asset details
        const missingAssetsList = assets.filter(a => session.missingAssets.includes(a.id));

        const handleExportDetail = () => {
            const allAssetsInScope = assets.filter(a =>
                session.scannedAssets.includes(a.id) ||
                session.missingAssets.includes(a.id)
            );

            const headers = ["Asset Name", "Barcode", "Category", "Status in Audit", "Current Price"];
            const csvContent = [
                `"Audit Session Report - ${formatDate(session.startDate)}"`,
                `"Auditor: ${session.auditorName}"`,
                `"Accuracy: ${accuracy.toFixed(1)}%"`,
                "",
                headers.join(","),
                ...allAssetsInScope.map(a => {
                    const status = session.scannedAssets.includes(a.id) ? "FOUND" : "MISSING";
                    return [
                        `"${a.name.replace(/"/g, '""')}"`,
                        `"${(a.barcode || 'N/A').replace(/"/g, '""')}"`,
                        `"${a.category}"`,
                        status,
                        a.price
                    ].join(",");
                })
            ].join("\n");

            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `audit_report_${session.id}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                {/* Header / Back */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedSessionId(null)}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-600" />
                    </button>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Session Report</h2>
                        <p className="text-sm text-slate-500">
                            {formatDate(session.startDate)} • Auditor: {session.auditorName}
                        </p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-medium text-slate-500 mb-1">Total Assets</p>
                        <p className="text-3xl font-bold text-slate-900">{totalAssets}</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-medium text-emerald-600 mb-1">Verified Found</p>
                        <p className="text-3xl font-bold text-emerald-600">{scannedCount}</p>
                        <p className="text-xs text-emerald-500 mt-1">{accuracy.toFixed(1)}% Coverage</p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-sm font-medium text-rose-600 mb-1">Missing / Unscanned</p>
                        <p className="text-3xl font-bold text-rose-600">{missingCount}</p>
                    </div>
                </div>

                {/* Missing Assets Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-rose-500" />
                            Missing Assets ({missingCount})
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportDetail}
                                className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                            >
                                <FileText size={16} /> Export Detail
                            </button>
                            <button
                                onClick={() => window.print()}
                                className="text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
                            >
                                <Printer size={16} /> Print Report
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Asset Name</th>
                                    <th className="px-6 py-4">Barcode</th>
                                    <th className="px-6 py-4">Last Known Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {missingAssetsList.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-emerald-500 font-medium">
                                            No missing assets! Perfect score.
                                        </td>
                                    </tr>
                                ) : (
                                    missingAssetsList.map(asset => (
                                        <tr key={asset.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4 font-bold text-slate-700">{asset.name}</td>
                                            <td className="px-6 py-4 font-mono text-xs text-slate-500 bg-slate-100/50 rounded inline-block my-3 mx-6 w-auto">{asset.barcode || 'N/A'}</td>
                                            <td className="px-6 py-4 text-slate-500">{asset.category}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {completedSessions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                        <FileText size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">No completed audit reports found.</p>
                        <p className="text-sm opacity-70 mt-1">Complete a stock opname session to see reports here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Auditor</th>
                                    <th className="px-6 py-4">Accuracy</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {completedSessions.map(session => {
                                    const accuracy = (session.scannedAssets.length / session.totalAssetsToCheck) * 100;
                                    return (
                                        <tr key={session.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => setSelectedSessionId(session.id)}>
                                            <td className="px-6 py-4 text-slate-700 font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-slate-400" />
                                                    {formatDate(session.startDate)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-slate-400" />
                                                    {session.auditorName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${accuracy === 100 ? 'bg-emerald-500' : accuracy > 80 ? 'bg-indigo-500' : 'bg-rose-500'}`}
                                                            style={{ width: `${accuracy}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600">{Math.round(accuracy)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide inline-block ${session.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                    }`}>
                                                    {session.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <ChevronRight size={18} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
