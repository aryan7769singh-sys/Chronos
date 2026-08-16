"use client";

import { useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Menu,
  Moon,
  Search,
  Sun,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/auth/UserMenu";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeaderProps {
  /** Triggers the mobile sidebar Sheet */
  onMenuClick: () => void;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

// ---------------------------------------------------------------------------
// useIsMounted — returns false on SSR & hydration, true once mounted on client.
// Uses useSyncExternalStore to avoid set-state-in-effect ESLint warnings.
// ---------------------------------------------------------------------------

const emptySubscribe = () => () => {};

function useIsMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// ---------------------------------------------------------------------------
// ThemeToggle — isolated so it only re-renders on theme change.
// Uses useIsMounted to ensure SSR and initial client hydration HTML match
// perfectly, preventing hydration mismatch errors.
// ---------------------------------------------------------------------------

function ThemeToggle() {
  const isMounted = useIsMounted();
  const { resolvedTheme, setTheme } = useTheme();

  const isDark = isMounted && resolvedTheme === "dark";

  return (
    <Button
      id="header-theme-toggle"
      variant="ghost"
      size="icon"
      aria-label={
        isMounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      title={
        isMounted
          ? isDark
            ? "Switch to light mode"
            : "Switch to dark mode"
          : "Toggle theme"
      }
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground size-8"
    >
      <Sun
        className={cn(
          "size-4 rotate-0 scale-100 transition-all duration-200",
          isMounted && isDark && "-rotate-90 scale-0"
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 rotate-90 scale-0 transition-all duration-200",
          isMounted && isDark && "rotate-0 scale-100"
        )}
      />
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Helper: getBreadcrumbItems
// ---------------------------------------------------------------------------

function getBreadcrumbItems(pathname: string): BreadcrumbItem[] {
  const matchedNav = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );

  if (!matchedNav) {
    return [{ label: "Chronos", href: "/dashboard" }];
  }

  // Exact primary route match
  if (pathname === matchedNav.href) {
    return [
      {
        label: matchedNav.label,
        icon: matchedNav.icon,
      },
    ];
  }

  // Nested route match (e.g. /projects/[projectId] or /projects/[projectId]/[taskId])
  const segments = pathname.replace(matchedNav.href, "").split("/").filter(Boolean);

  const items: BreadcrumbItem[] = [
    {
      label: matchedNav.label,
      href: matchedNav.href,
      icon: matchedNav.icon,
    },
  ];

  if (segments.length === 1) {
    items.push({
      label: "Details",
    });
  } else if (segments.length >= 2) {
    items.push({
      label: "Project",
      href: `${matchedNav.href}/${segments[0]}`,
    });
    items.push({
      label: "Task Details",
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// Header — public component
// ---------------------------------------------------------------------------

export function Header({ onMenuClick, user }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbItems = getBreadcrumbItems(pathname);

  return (
    <header
      id="app-header"
      className={cn(
        "sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-2 sm:gap-3 border-b border-border/50 px-3 sm:px-4 shrink-0",
        "bg-background/80 backdrop-blur-xl backdrop-saturate-150"
      )}
    >
      {/* ── Left: Mobile Hamburger & Breadcrumbs ── */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        {/* Mobile menu trigger */}
        <Button
          id="header-menu-toggle"
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground size-8 shrink-0"
        >
          <Menu className="size-4" />
        </Button>

        {/* Page Breadcrumbs */}
        <div className="min-w-0 flex-1">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      {/* ── Right: Search, Theme, Notifications, HUD, Profile ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Search button (responsive: expanded on tablet/desktop, icon on mobile) */}
        <button
          id="header-search"
          type="button"
          aria-label="Quick search (Ctrl+K)"
          title="Quick search (Ctrl+K)"
          className={cn(
            "hidden sm:inline-flex h-8 w-40 md:w-52 items-center justify-between rounded-lg px-2.5 text-xs",
            "border border-border/60 bg-muted/30 text-muted-foreground transition-colors",
            "hover:bg-muted/60 hover:text-foreground hover:border-border",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="size-3.5 shrink-0" />
            <span className="truncate">Search workspace...</span>
          </div>
          <kbd className="pointer-events-none hidden md:inline-flex h-4.5 select-none items-center gap-0.5 rounded border border-border/80 bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </button>

        {/* Mobile search icon button */}
        <Button
          id="header-search-mobile"
          variant="ghost"
          size="icon"
          aria-label="Search"
          className="sm:hidden text-muted-foreground hover:text-foreground size-8"
        >
          <Search className="size-4" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Proactive Notification Bell & Center */}
        <NotificationBell />

        {/* Command HUD Launcher */}
        <Link
          id="header-hud-launcher"
          href="/overlay"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center justify-center size-8 rounded-lg text-muted-foreground transition-colors",
            "hover:text-foreground hover:bg-muted/60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          title="Open Command HUD (Desktop Companion)"
          aria-label="Open Command HUD Overlay"
        >
          <Monitor className="size-4" />
        </Link>

        {/* User avatar menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
