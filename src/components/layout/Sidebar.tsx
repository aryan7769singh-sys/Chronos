"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Timer } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, type NavItem } from "@/constants/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SidebarProps {
  isCollapsed: boolean;
  onCollapsedChange: (value: boolean) => void;
  isMobileOpen: boolean;
  onMobileOpenChange: (value: boolean) => void;
}

// ---------------------------------------------------------------------------
// SidebarNavItem — a single navigation link
// ---------------------------------------------------------------------------

interface SidebarNavItemProps {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}

function SidebarNavItem({ item, isCollapsed, isActive }: SidebarNavItemProps) {
  const isInteractive = !item.disabled && !item.soon;

  const linkContent = (
    <Link
      href={isInteractive ? item.href : "#"}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={!isInteractive}
      tabIndex={isInteractive ? undefined : -1}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
        (!isInteractive) && "pointer-events-none opacity-40",
        isCollapsed && "justify-center px-2"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-primary" />
      )}

      <item.icon
        className={cn(
          "shrink-0 transition-transform duration-150",
          isCollapsed ? "size-5" : "size-4",
          isActive ? "text-primary" : "text-current"
        )}
        strokeWidth={isActive ? 2 : 1.75}
      />

      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            key="label"
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "auto" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="overflow-hidden whitespace-nowrap flex-1"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Badges & pills — only visible when expanded */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.span
            key="meta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="ml-auto flex items-center gap-1"
          >
            {item.badge !== undefined && (
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-primary px-1.5 text-[0.65rem] font-semibold text-primary-foreground leading-none">
                {item.badge}
              </span>
            )}
            {item.soon && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-muted text-[0.6rem] font-medium text-muted-foreground uppercase tracking-wide">
                Soon
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );

  // When collapsed, wrap with a tooltip showing the label
  if (isCollapsed) {
    return (
      <TooltipProvider delay={300}>
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right">
            <span>{item.label}</span>
            {item.soon && (
              <span className="ml-1.5 opacity-60 text-[0.65rem] uppercase tracking-wide">
                Soon
              </span>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return linkContent;
}

// ---------------------------------------------------------------------------
// SidebarContent — shared between desktop panel and mobile Sheet
// ---------------------------------------------------------------------------

interface SidebarContentProps {
  isCollapsed: boolean;
  pathname: string;
}

function SidebarContent({ isCollapsed, pathname }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo / Branding */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-3 shrink-0",
          isCollapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <div className="flex items-center justify-center size-7 rounded-lg bg-primary shrink-0">
          <Timer className="size-4 text-primary-foreground" strokeWidth={2} />
        </div>

        <AnimatePresence initial={false}>
          {!isCollapsed && (
            <motion.span
              key="brand-name"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="overflow-hidden whitespace-nowrap font-semibold text-sm tracking-tight text-foreground"
            >
              Chronos
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav
        aria-label="Main navigation"
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <SidebarNavItem
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
            />
          );
        })}
      </nav>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar — public component
// ---------------------------------------------------------------------------

export function Sidebar({
  isCollapsed,
  onCollapsedChange,
  isMobileOpen,
  onMobileOpenChange,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop Sidebar ───────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: isCollapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="relative hidden lg:flex flex-col h-full shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar"
      >
        <SidebarContent isCollapsed={isCollapsed} pathname={pathname} />

        {/* Collapse toggle button */}
        <div className="shrink-0 border-t border-sidebar-border p-2 flex justify-center">
          <button
            id="sidebar-collapse-toggle"
            onClick={() => onCollapsedChange(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/50 transition-colors duration-150",
              "hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        </div>
      </motion.aside>

      {/* ── Mobile Sheet ──────────────────────────────────────────────── */}
      <Sheet open={isMobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-60 p-0" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent isCollapsed={false} pathname={pathname} />
        </SheetContent>
      </Sheet>
    </>
  );
}
