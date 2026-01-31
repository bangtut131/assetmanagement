"use client";

import { useStore } from "@/store/useStore";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
    const { currentUser, fetchInitialData } = useStore();
    const router = useRouter();
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (!currentUser && pathname !== '/login') {
            router.push('/login');
        } else if (currentUser && pathname === '/login') {
            router.push('/');
        }
    }, [currentUser, pathname, router, mounted]);

    // Show nothing while checking auth (to prevent flash)
    if (!mounted) return null;
    if (!currentUser && pathname !== '/login') return null;

    return <>{children}</>;
}
