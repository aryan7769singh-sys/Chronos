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
  onItemClick?: () => void;
}

function SidebarNavItem({
  item,
  isCollapsed,
  isActive,
  onItemClick,
}: SidebarNavItemProps) {
  const isInteractive = !item.disabled && !item.soon;

  const linkContent = (
    <Link
      href={isInteractive ? item.href : "#"}
      onClick={isInteractive ? onItemClick : undefined}
      aria-current={isActive ? "page" : undefined}
      aria-disabled={!isInteractive}
      tabIndex={isInteractive ? undefined : -1}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors duration-150 min-h-[38px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        !isInteractive && "pointer-events-none opacity-40",
        isCollapsed && "justify-center px-2"
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span
          className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-primary"
          aria-hidden="true"
        />
      )}

      <item.icon
        className={cn(
          "shrink-0 transition-transform duration-150",
          isCollapsed ? "size-5" : "size-4",
          isActive
            ? "text-primary"
            : "text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground"
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
              <span className="inline-flex items-center justify-center min-w-[1.25rem] h-4.5 rounded-full bg-primary px-1.5 text-[0.65rem] font-semibold text-primary-foreground leading-none">
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
      <TooltipProvider delay={200}>
        <Tooltip>
          <TooltipTrigger>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
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
  onItemClick?: () => void;
}

function SidebarContent({
  isCollapsed,
  pathname,
  onItemClick,
}: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col select-none">
      {/* Logo / Branding */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-sidebar-border px-3 shrink-0",
          isCollapsed ? "justify-center" : "gap-2.5"
        )}
      >
        <Link
          href="/dashboard"
          onClick={onItemClick}
          className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
          aria-label="Chronos Dashboard"
        >
          <div className="flex items-center justify-center size-7 rounded-lg bg-primary text-primary-foreground shadow-xs shrink-0">
            <Timer className="size-4" strokeWidth={2.2} />
          </div>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.span
                key="brand-name"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15, ease: "easeInOut" }}
                className="overflow-hidden whitespace-nowrap font-bold text-sm tracking-tight text-sidebar-foreground"
              >
                Chronos
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation items */}
      <nav
        aria-label="Main workspace navigation"
        className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5 scrollbar-none"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(`${item.href}/`));

          return (
            <SidebarNavItem
              key={item.href}
              item={item}
              isCollapsed={isCollapsed}
              isActive={isActive}
              onItemClick={onItemClick}
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
            type="button"
            onClick={() => onCollapsedChange(!isCollapsed)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "flex size-8 items-center justify-center rounded-lg text-sidebar-foreground/60 transition-colors duration-150",
              "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        <SheetContent side="left" className="w-64 p-0 bg-sidebar border-r border-sidebar-border" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent
            isCollapsed={false}
            pathname={pathname}
            onItemClick={() => onMobileOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
