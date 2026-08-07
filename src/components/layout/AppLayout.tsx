"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface AppLayoutProps {
  children: React.ReactNode;
}

/**
 * AppLayout — the root shell for all authenticated app pages.
 *
 * Manages:
 * - Desktop sidebar collapsed/expanded state
 * - Mobile sidebar Sheet open/close state
 *
 * Renders Sidebar + Header + main content area.
 */
export function AppLayout({ children }: AppLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar (desktop panel + mobile Sheet) */}
      <Sidebar
        isCollapsed={isCollapsed}
        onCollapsedChange={setIsCollapsed}
        isMobileOpen={isMobileOpen}
        onMobileOpenChange={setIsMobileOpen}
      />

      {/* Main content area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMenuClick={() => setIsMobileOpen(true)} />

        <main
          id="app-main-content"
          className="flex-1 overflow-y-auto overflow-x-hidden"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
