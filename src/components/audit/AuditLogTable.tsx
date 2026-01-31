"use client";

import { useStore } from "@/store/useStore";
import { formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Search, Filter, History, Download, Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export function AuditLogTable() {
    const { auditLogs } = useStore();
    const [search, setSearch] = useState("");
    const [filterAction, setFilterAction] = useState("ALL");
    const [dateRange, setDateRange] = useState({ start: "", end: "" });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, filterAction, dateRange]);

    const filteredLogs = auditLogs.filter(log => {
        const matchesSearch = log.details.toLowerCase().includes(search.toLowerCase()) ||
            log.target.toLowerCase().includes(search.toLowerCase()) ||
            log.user.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filterAction === "ALL" ||
            (filterAction === 'AUDIT' ? log.action.startsWith('AUDIT_') : log.action === filterAction);

        let matchesDate = true;
        if (dateRange.start) {
            const start = new Date(dateRange.start);
            start.setHours(0, 0, 0, 0);
            if (new Date(log.timestamp) < start) matchesDate = false;
        }
        if (dateRange.end && matchesDate) { // Optimization: only check end if start matched
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999);
            if (new Date(log.timestamp) > end) matchesDate = false;
        }

        return matchesSearch && matchesFilter && matchesDate;
    });

    // Pagination Logic
    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
    const paginatedLogs = filteredLogs.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExport = () => {
        const headers = ["ID", "Timestamp", "Action", "Target", "Details", "User"];
        const csvContent = [
            headers.join(","),
            ...filteredLogs.map(log => [
                log.id,
                `"${new Date(log.timestamp).toLocaleString()}"`, // Quote timestamps for safety
                log.action,
                `"${log.target.replace(/"/g, '""')}"`, // Escape quotes
                `"${log.details.replace(/"/g, '""')}"`,
                log.user
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const actionColors = {
        CREATE: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        UPDATE: 'text-blue-600 bg-blue-50 border-blue-100',
        DELETE: 'text-rose-600 bg-rose-50 border-rose-100',
        APPROVE: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        REJECT: 'text-orange-600 bg-orange-50 border-orange-100',
        RESET: 'text-red-700 bg-red-100 border-red-200',
        AUDIT_START: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        AUDIT_SCAN: 'text-indigo-600 bg-indigo-50 border-indigo-100',
        AUDIT_COMPLETE: 'text-purple-600 bg-purple-50 border-purple-100',
    };

    return (
        <div className="space-y-6">
            {/* Controls Header */}
            <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    {/* Search */}
                    <div className="relative w-full md:w-64 group">
                        <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Date Inputs */}
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-sm">
                        <Calendar size={16} className="text-slate-400" />
                        <input
                            type="date"
                            className="outline-none bg-transparent text-slate-600 w-28 md:w-auto text-xs md:text-sm"
                            value={dateRange.start}
                            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <span className="text-slate-300">-</span>
                        <input
                            type="date"
                            className="outline-none bg-transparent text-slate-600 w-28 md:w-auto text-xs md:text-sm"
                            value={dateRange.end}
                            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto justify-between md:justify-end items-center">
                    {/* Filter Buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar max-w-full">
                        {['ALL', 'CREATE', 'UPDATE', 'DELETE', 'AUDIT'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterAction(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all whitespace-nowrap ${filterAction === f
                                    ? 'bg-slate-800 text-white border-slate-800'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                                    }`}
                            >
                                {f === 'AUDIT' ? 'AUDIT & SCANS' : f}
                            </button>
                        ))}
                    </div>

                    {/* Export Button */}
                    <button
                        onClick={handleExport}
                        disabled={filteredLogs.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                {filteredLogs.length === 0 ? (
                    <div className="flex-1 p-12 text-center text-slate-400 flex flex-col items-center justify-center">
                        <History size={48} className="mb-4 opacity-20" />
                        <p className="font-medium">No system activity found matching your criteria.</p>
                        {(search || dateRange.start || dateRange.end || filterAction !== 'ALL') && (
                            <button
                                onClick={() => { setSearch(''); setFilterAction('ALL'); setDateRange({ start: '', end: '' }); }}
                                className="mt-4 text-indigo-600 text-sm font-bold hover:underline"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
                                    <tr>
                                        <th className="px-6 py-4 w-40">Timestamp</th>
                                        <th className="px-6 py-4 w-32">Action</th>
                                        <th className="px-6 py-4 w-48">Target</th>
                                        <th className="px-6 py-4">Details</th>
                                        <th className="px-6 py-4 w-40">User</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">
                                                {formatDate(log.timestamp)}
                                                <div className="hidden">{new Date(log.timestamp).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wide inline-block text-center min-w-[80px] ${actionColors[log.action as keyof typeof actionColors] || 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-medium text-slate-700 truncate max-w-[200px]" title={log.target}>{log.target}</td>
                                            <td className="px-6 py-4 text-slate-600">{log.details}</td>
                                            <td className="px-6 py-4 text-slate-500">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-400 to-purple-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                                        {log.user.charAt(0)}
                                                    </div>
                                                    <span className="truncate max-w-[100px]" title={log.user}>{log.user}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Footer */}
                        <div className="mt-auto border-t border-slate-100 p-4 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-xs text-slate-500 font-medium">
                                Showing <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-slate-700">{filteredLogs.length}</span> results
                            </p>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="First Page"
                                >
                                    <ChevronsLeft size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Previous Page"
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                <span className="text-xs font-bold text-slate-700 px-2">
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Next Page"
                                >
                                    <ChevronRight size={16} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(totalPages)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    title="Last Page"
                                >
                                    <ChevronsRight size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
