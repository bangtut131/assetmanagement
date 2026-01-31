"use client";

import { useStore } from "@/store/useStore";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Check, X, CheckSquare, FileCheck, AlertTriangle } from "lucide-react";

export function ApprovalManager() {
    const { assets, locations, approveDeleteAsset, rejectDeleteAsset } = useStore();
    const pendingAssets = assets.filter(a => a.deletionStatus === 'pending');

    const getLocationName = (locationId: string) => {
        const loc = locations.find(l => l.id === locationId);
        return loc ? loc.name : 'Unknown Location';
    };

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-100/50 rounded-2xl text-amber-600 border border-amber-200 shadow-sm">
                        <FileCheck size={28} />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Deletion Requests</h2>
                        <p className="text-slate-500 text-sm mt-0.5">Review and approve asset disposal requests.</p>
                    </div>
                </div>
                <div className="text-sm font-bold bg-white px-4 py-2 rounded-xl border border-slate-200 text-slate-600 shadow-sm">
                    Failed to Load: <span className="text-slate-900 ml-1">0</span>
                </div>
            </div>

            {pendingAssets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-10 bg-slate-50/30">
                    <div className="bg-white p-6 rounded-full shadow-sm mb-4">
                        <CheckSquare size={48} className="text-emerald-100" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">All Caught Up!</h3>
                    <p className="text-sm">There are no pending approval requests at the moment.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-auto p-6">
                    <div className="grid gap-4">
                        {pendingAssets.map(asset => {
                            const locName = getLocationName(asset.locationId);
                            return (
                                <div key={asset.id} className="bg-white border boundary-l-4 border-l-amber-500 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center justify-between gap-6 group">
                                    <div className="flex items-center gap-5 flex-1">
                                        <div className="h-16 w-16 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                            {asset.image ? (
                                                <img src={asset.image} className="w-full h-full object-cover" alt={asset.name} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-slate-300">NO IMG</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase tracking-wider">{asset.category}</span>
                                                <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono">{asset.barcode}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg">{asset.name}</h3>
                                            <div className="flex gap-4 text-xs text-slate-500 mt-1">
                                                <span><span className="font-semibold text-slate-700">Loc:</span> {locName}</span>
                                                <span><span className="font-semibold text-slate-700">Price:</span> {formatCurrency(asset.price)}</span>
                                                <span><span className="font-semibold text-slate-700">Requested:</span> {asset.deletionRequestDate ? formatDate(asset.deletionRequestDate) : '-'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 w-full md:w-auto">
                                        <button
                                            onClick={() => rejectDeleteAsset(asset.id)}
                                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 hover:text-slate-800 transition-colors text-sm flex items-center justify-center gap-2"
                                        >
                                            <X size={16} /> Reject
                                        </button>
                                        <button
                                            onClick={() => approveDeleteAsset(asset.id)}
                                            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 shadow-lg shadow-amber-200 transition-all text-sm flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} /> Approve
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
