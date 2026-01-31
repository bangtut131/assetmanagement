"use client";

import { useStore } from "@/store/useStore";
import { calculateDepreciation, formatCurrency } from "@/lib/utils";
import { Box, TrendingDown, AlertCircle, Clock, ChevronRight, Activity, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Asset } from "@/types";

export function StatsGrid() {
    const { assets } = useStore();

    const stats = {
        total: assets.filter((a: Asset) => a.deletionStatus !== 'pending').length,
        currentValue: assets.filter((a: Asset) => a.deletionStatus !== 'pending')
            .reduce((sum: number, item: Asset) => sum + calculateDepreciation(item.price, item.purchaseDate, item.usefulLife).currentValue, 0),
        pending: assets.filter((a: Asset) => a.deletionStatus === 'pending').length,
        bad: assets.filter((a: Asset) => ['Rusak', 'Hilang'].includes(a.status) && a.deletionStatus !== 'pending').length
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Assets Card */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-500/10"></div>

                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 shadow-sm">
                            <Box size={24} />
                        </div>
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                            <ArrowUpRight size={12} className="mr-1" /> +2.5%
                        </span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.total}</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Total Active Assets</p>
                    </div>
                </div>

                {/* Valuation Card */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/10"></div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 shadow-sm">
                            <Activity size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">IDR</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-bold text-slate-900 tracking-tight truncate" title={formatCurrency(stats.currentValue)} suppressHydrationWarning>
                            {formatCurrency(stats.currentValue)}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Total Book Value</p>
                    </div>
                </div>

                {/* Pending Requests Card */}
                <div className={`p-6 rounded-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border hover:shadow-lg transition-shadow relative overflow-hidden group ${stats.pending > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className={`p-3 rounded-2xl shadow-sm ${stats.pending > 0 ? 'bg-white text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                            <Clock size={24} />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <h3 className={`text-4xl font-bold tracking-tight ${stats.pending > 0 ? 'text-amber-900' : 'text-slate-900'}`}>{stats.pending}</h3>
                        <p className={`text-sm mt-1 font-medium ${stats.pending > 0 ? 'text-amber-700' : 'text-slate-500'}`}>Pending Approvals</p>
                    </div>
                </div>

                {/* Issues Card */}
                <div className="bg-white p-6 rounded-3xl shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg transition-shadow relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-rose-500/10"></div>
                    <div className="flex items-start justify-between mb-4 relative z-10">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 shadow-sm">
                            <AlertCircle size={24} />
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attention</span>
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-4xl font-bold text-slate-900 tracking-tight">{stats.bad}</h3>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Damaged / Lost</p>
                    </div>
                </div>
            </div>

            {stats.pending > 0 && (
                <Link href="/approvals">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-1 rounded-2xl shadow-lg shadow-orange-500/20 cursor-pointer group hover:scale-[1.01] transition-transform">
                        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl flex justify-between items-center text-white">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <Clock className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">Action Required</h3>
                                    <p className="text-white/90 text-sm">You have <span className="font-bold border-b border-white/50">{stats.pending} deletion requests</span> pending review.</p>
                                </div>
                            </div>
                            <div className="bg-white text-amber-600 px-4 py-2 rounded-lg font-bold text-sm group-hover:bg-white/90 transition-colors flex items-center gap-2">
                                Review Now <ChevronRight size={16} />
                            </div>
                        </div>
                    </div>
                </Link>
            )}
        </div>
    );
}
