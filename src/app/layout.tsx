import type { Metadata } from "next";
import React from "react";
import { Inter } from "next/font/google"; // Using Inter as requested
import "./globals.css";
import "./globals.css";
import { ConditionalHeader } from "@/components/layout/ConditionalHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { ConditionalSidebar } from "@/components/layout/ConditionalSidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ProAsset - Manajemen Aset Perusahaan",
  description: "Aplikasi manajemen aset perusahaan yang modern dan efisien.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased overflow-hidden`}>
        <AuthGuard>
          <div className="flex h-screen">
            {/* Show Sidebar only if not on login page */}
            <ConditionalSidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
              <React.Suspense fallback={<div className="h-16 bg-white/80 border-b border-gray-100" />}>
                <ConditionalHeader />
              </React.Suspense>
              <main className="flex-1 overflow-auto p-6 pb-20 md:pb-6 relative scroll-smooth">
                {children}
              </main>
            </div>
          </div>
        </AuthGuard>
      </body>
    </html>
  );
}
