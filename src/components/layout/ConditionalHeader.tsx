"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export function ConditionalHeader() {
    const pathname = usePathname();
    // Do not render Header on login page
    if (pathname === '/login') return null;
    return <Header />;
}
