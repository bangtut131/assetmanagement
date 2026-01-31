"use client";

import { LayoutDashboard, List, Map, FileCheck, Box, Download, Settings, LogOut, ChevronRight, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { SettingsModal } from "./SettingsModal";
import { useStore } from "@/store/useStore";

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: List, label: 'Assets', href: '/assets' },
    { icon: Map, label: 'Locations', href: '/locations' },
    { icon: FileCheck, label: 'Approvals', href: '/approvals' },
    { icon: Box, label: 'Audit & Opname', href: '/audit' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { currentUser, hasPermission, isSettingsOpen, openSettings, closeSettings, isMobileMenuOpen, setMobileMenuOpen } = useStore();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname, setMobileMenuOpen]);

    if (!currentUser) return null; // Safety check

    const filteredItems = menuItems.filter(item => {
        if (item.label === 'Approvals') return hasPermission('approvals', 'view');
        if (item.label === 'Audit & Opname') return hasPermission('audit', 'view');
        return true; // Dashboard, Assets, Locations visible to all authenticated (but maybe check permissions?)
    });

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            <aside className={cn(
                "flex flex-col w-72 bg-[#0f172a] text-slate-300 h-screen border-r border-slate-800 shadow-2xl z-50",
                "fixed inset-y-0 left-0 transition-transform duration-300 md:translate-x-0 md:relative md:flex",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                {/* Brand Section */}
                <div className="p-6 flex flex-col items-center gap-3 text-center border-b border-slate-800/50 mb-4 relative">
                    {/* Close Button for Mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="absolute right-4 top-4 md:hidden text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                    <div className="relative w-full h-12">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/gas-logo.png" alt="GAS Logo" className="w-full h-full object-contain" />
                    </div>
                    <div>
                        <h1 className="font-bold text-white text-sm tracking-tight">GAS Asset Management</h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-2 mt-2">
                    <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Main Menu</p>
                    {filteredItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        // Also check basic visibility for other items if needed, but for now filteredItems handles it
                        // Actually, let's enforce view permission for all
                        let hasView = true;
                        if (item.label === 'Dashboard') hasView = hasPermission('dashboard', 'view');
                        if (item.label === 'Assets') hasView = hasPermission('assets', 'view');
                        if (item.label === 'Locations') hasView = hasPermission('locations', 'view');

                        if (!hasView) return null;

                        return (
                            <Link key={item.href} href={item.href} className="block relative group">
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className={cn(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive ? "text-white font-medium" : "hover:bg-white/5 hover:text-white"
                                )}>
                                    <Icon size={20} className={cn("transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-white")} />
                                    <span>{item.label}</span>
                                    {item.label === 'Approvals' && (
                                        <span className="ml-auto bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md hidden">
                                            3
                                        </span>
                                    )}
                                    {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Footer */}
                <div className="p-4 mx-4 mb-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 p-0.5">
                            <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center border-2 border-transparent">
                                <span className="font-bold text-white text-xs">{currentUser.username.substring(0, 2).toUpperCase()}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-slate-400 truncate capitalize">{currentUser.role.replace('_', ' ')}</p>
                        </div>
                        <button onClick={() => useStore.getState().logout()} className="text-slate-500 hover:text-rose-500 transition-colors">
                            <LogOut size={16} />
                        </button>
                    </div>

                    {hasPermission('settings', 'view') && (
                        <button
                            onClick={() => openSettings('general')}
                            className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-colors py-2 rounded-lg hover:bg-white/5 w-full border border-transparent hover:border-slate-600 mb-2"
                        >
                            <Settings size={14} /> System Settings
                        </button>
                    )}
                    <div className="text-[10px] text-center text-slate-600 pt-2 border-t border-slate-700/50 font-mono">
                        v1.0.2 Stable
                    </div>
                </div>

                {isSettingsOpen && <SettingsModal onClose={closeSettings} />}
            </aside>
        </>
    );
}
