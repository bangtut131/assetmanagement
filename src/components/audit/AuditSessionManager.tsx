"use client";

import { useStore } from "@/store/useStore";
import { useState } from "react";
import { Play, Scan, StopCircle, CheckCircle, AlertTriangle, Package, Check, Lock } from "lucide-react";
import { BarcodeScanner } from "@/components/scanner/BarcodeScanner";
import { Asset } from "@/types";

export function AuditSessionManager() {
    const { assets, startAudit, completeAudit, scanAuditAsset, currentAuditId, auditSessions } = useStore();
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const [auditorName, setAuditorName] = useState("Admin User");

    const activeSession = auditSessions.find(s => s.id === currentAuditId);

    // Derived state for the active session
    const totalAssets = activeSession ? activeSession.totalAssetsToCheck : assets.length;
    const scannedCount = activeSession ? activeSession.scannedAssets.length : 0;
    const progress = totalAssets > 0 ? (scannedCount / totalAssets) * 100 : 0;

    const unscannedAssets = activeSession
        ? assets.filter(a => !activeSession.scannedAssets.includes(a.id))
        : [];

    const handleStart = () => {
        if (!auditorName) return;
        startAudit(auditorName);
    };

    if (!activeSession) {
        return (
            <div className="bg-white rounded-3xl border border-slate-100 p-8 flex flex-col items-center text-center max-w-2xl mx-auto shadow-xl shadow-indigo-50">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Scan size={40} className="text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Start Stock Opname</h2>
                <p className="text-slate-500 mb-8 max-w-md">Begin a physical asset verification session. You will need to scan assets to verify their presence.</p>

                <div className="w-full max-w-sm space-y-4">
                    <div className="text-left">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Auditor Name</label>
                        <input
                            type="text"
                            value={auditorName}
                            onChange={e => setAuditorName(e.target.value)}
                            className="w-full border border-slate-200 rounded-xl px-4 py-3 mt-1 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                        />
                    </div>
                    {useStore.getState().hasPermission('audit', 'edit') ? (
                        <button
                            onClick={handleStart}
                            className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
                        >
                            <Play size={18} fill="currentColor" /> Start New Session
                        </button>
                    ) : (
                        <div className="w-full py-3.5 bg-slate-100 text-slate-500 rounded-xl font-bold flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200">
                            <Lock size={18} /> Access Denied
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Active Session Header */}
            <div className="bg-indigo-900 text-white rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-2 text-indigo-200 text-sm font-medium mb-1">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                            Audit in Progress
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">{Math.round(progress)}% Complete</h2>
                        <p className="text-indigo-200 mt-1">
                            {scannedCount} of {totalAssets} assets verified
                        </p>
                    </div>

                    <div className="w-full bg-indigo-800/50 rounded-full h-3 md:col-start-2">
                        <div
                            className="bg-emerald-400 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                            style={{ width: `${progress}%` }}
                        ></div>
                        <div className="flex justify-between text-[10px] text-indigo-300 mt-2 font-mono">
                            <span>0%</span>
                            <span>100%</span>
                        </div>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={() => setIsScannerOpen(true)}
                            className="bg-white text-indigo-900 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 shadow-lg"
                        >
                            <Scan size={20} /> Scan
                        </button>
                        <button
                            onClick={() => {
                                if (progress < 100) {
                                    if (confirm("Not all assets are scanned. Finish anyway?")) {
                                        completeAudit();
                                    }
                                } else {
                                    completeAudit();
                                }
                            }}
                            className="bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 border border-indigo-500 transition-colors flex items-center gap-2"
                        >
                            <StopCircle size={20} /> Finish
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Unscanned Assets List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <h3 className="font-bold text-slate-800">Pending Verification</h3>
                        </div>
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full">{unscannedAssets.length} remaining</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {unscannedAssets.map(asset => (
                            <div key={asset.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 group transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                        <Package size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-700">{asset.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-mono">{asset.barcode || 'NO BARCODE'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => scanAuditAsset(asset.id)} // Manual override
                                    className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-xs font-bold rounded-lg shadow-sm hover:text-indigo-600 hover:border-indigo-200 transition-all"
                                >
                                    Manual Check
                                </button>
                            </div>
                        ))}
                        {unscannedAssets.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-emerald-500">
                                <CheckCircle size={48} className="mb-2" />
                                <p className="font-bold">All Clear!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Scanned List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[500px]">
                    <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-emerald-500" />
                            <h3 className="font-bold text-slate-800">Verified Assets</h3>
                        </div>
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">{scannedCount} verified</span>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {/* We can filter assets based on session.scannedAssets id list */}
                        {assets
                            .filter(a => activeSession.scannedAssets.includes(a.id))
                            .map(asset => (
                                <div key={asset.id} className="flex items-center justify-between p-3 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-700">{asset.name}</h4>
                                            <p className="text-[10px] text-emerald-600 font-medium">Verified</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </div>

            {isScannerOpen && (
                <BarcodeScanner
                    onScanSuccess={(code) => {
                        const found = scanAuditAsset(code);
                        if (found) {
                            alert(`Verified: ${code}`);
                            // Keep scanner open for rapid scanning? Or close?
                            // Let's keep it open but maybe show a toast. For now, simple alert or auto-close.
                            // Better UX: Audio feedback or visual overlay in scanner.
                            // For simplicity, we just add it to state. BarcodeScanner component handles continuous scanning? 
                            // Our current BarcodeScanner stops on success. We need to modify it or reopen it.
                            // Let's assuming BarcodeScanner closes on success.
                            setIsScannerOpen(false);
                        } else {
                            alert(`Asset not found or already scanned: ${code}`);
                        }
                    }}
                    onClose={() => setIsScannerOpen(false)}
                />
            )}
        </div>
    );
}
