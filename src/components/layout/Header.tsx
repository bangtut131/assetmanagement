"use client";

import { Bell, Search, HelpCircle, ChevronRight, Home, Menu } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { auditLogs, openSettings, setMobileMenuOpen } = useStore();

    // Breadcrumb logic
    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs = paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        const label = path.charAt(0).toUpperCase() + path.slice(1);
        return { href, label };
    });

    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [searchValue, setSearchValue] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);

    // Sync search with URL for assets page
    useEffect(() => {
        if (pathname === '/assets') {
            const q = searchParams.get('q');
            if (q) setSearchValue(q);
        } else {
            setSearchValue("");
        }
    }, [pathname, searchParams]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchValue(val);

        if (pathname === '/assets') {
            // In a real app, you might debounce this
            router.replace(`/assets?q=${val}`);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pathname !== '/assets') {
            router.push(`/assets?q=${searchValue}`);
        }
    };

    const recentLogs = auditLogs.slice(0, 5);
    const hasUnread = recentLogs.length > 0; // Simplified for now

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-100 shadow-sm px-8 py-4">
            <div className="flex items-center justify-between gap-8">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <nav className="hidden md:flex items-center gap-2 text-sm text-slate-500">
                        <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
                            <Home size={14} />
                        </div>
                        {breadcrumbs.length > 0 && <ChevronRight size={14} className="text-slate-300" />}

                        {breadcrumbs.length === 0 ? (
                            <span className="font-bold text-slate-800">Dashboard</span>
                        ) : (
                            breadcrumbs.map((crumb, index) => (
                                <div key={crumb.href} className="flex items-center gap-2">
                                    <span className={cn(
                                        "font-medium transition-colors",
                                        index === breadcrumbs.length - 1 ? "text-slate-900 font-bold" : "hover:text-slate-800"
                                    )}>
                                        {crumb.label === 'Audit' ? 'Audit & Inspection' : crumb.label}
                                    </span>
                                    {index < breadcrumbs.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                                </div>
                            ))
                        )}
                    </nav>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative group">
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200",
                        isSearchFocused ? "text-indigo-500" : "text-slate-400"
                    )} size={18} />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-400"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                        value={searchValue}
                        onChange={handleSearch}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <kbd className="hidden md:inline-flex items-center h-5 px-1.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded shadow-sm">⌘K</kbd>
                    </div>
                </form>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="relative p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all group">
                        <HelpCircle size={20} />
                        <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrappointer-events-none">Help Center</span>
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={cn(
                                "relative p-2.5 rounded-xl transition-all",
                                showNotifications ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                            )}>
                            <Bell size={20} />
                            {hasUnread && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>}
                        </button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 p-1"
                                >
                                    <div className="p-3 border-b border-slate-50 flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Notifications</h4>
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-medium">{auditLogs.length}</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto">
                                        {recentLogs.map(log => (
                                            <div key={log.id} className="p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer border-b border-transparent hover:border-slate-100 last:mb-0">
                                                <div className="flex gap-3">
                                                    <div className={cn(
                                                        "w-2 h-2 mt-1.5 rounded-full shrink-0",
                                                        log.action === 'CREATE' ? 'bg-emerald-500' :
                                                            log.action === 'DELETE' ? 'bg-rose-500' : 'bg-blue-500'
                                                    )}></div>
                                                    <div>
                                                        <p className="text-xs font-medium text-slate-700 leading-snug">{log.details}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">{new Date(log.timestamp).toLocaleTimeString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {recentLogs.length === 0 && (
                                            <div className="p-8 text-center text-slate-400 text-xs">No notifications</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            openSettings('logs');
                                            setShowNotifications(false);
                                        }}
                                        className="w-full p-2 text-center text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-b-xl transition-colors"
                                    >
                                        View All Activity
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </header>
    );
}
