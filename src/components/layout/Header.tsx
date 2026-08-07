"use client";

import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NAV_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeaderProps {
  /** Triggers the mobile sidebar Sheet */
  onMenuClick: () => void;
}

// ---------------------------------------------------------------------------
// ThemeToggle — isolated so it only re-renders on theme change.
// Uses resolvedTheme (undefined on SSR) as a mount guard to prevent
// hydration mismatches without violating the set-state-in-effect lint rule.
// ---------------------------------------------------------------------------

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // resolvedTheme is undefined until next-themes hydrates on the client.
  // Render a neutral placeholder during SSR / before hydration.
  if (resolvedTheme === undefined) {
    return (
      <Button
        id="header-theme-toggle"
        variant="ghost"
        size="icon"
        aria-label="Toggle theme"
        className="text-muted-foreground hover:text-foreground"
        suppressHydrationWarning
      >
        <Sun className="size-4" />
      </Button>
    );
  }

  return (
    <Button
      id="header-theme-toggle"
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
    >
      <Sun
        className={cn(
          "size-4 rotate-0 scale-100 transition-all duration-200",
          isDark && "-rotate-90 scale-0"
        )}
      />
      <Moon
        className={cn(
          "absolute size-4 rotate-90 scale-0 transition-all duration-200",
          isDark && "rotate-0 scale-100"
        )}
      />
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Header — public component
// ---------------------------------------------------------------------------

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  const currentPage =
    NAV_ITEMS.find(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`)
    )?.label ?? "Chronos";

  return (
    <header
      id="app-header"
      className={cn(
        "sticky top-0 z-50 flex h-14 w-full items-center gap-3 border-b border-border/50 px-4",
        "bg-background/70 backdrop-blur-xl backdrop-saturate-150"
      )}
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile hamburger */}
        <Button
          id="header-menu-toggle"
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="lg:hidden text-muted-foreground hover:text-foreground shrink-0"
        >
          <Menu className="size-4" />
        </Button>

        {/* Page title */}
        <h2 className="text-sm font-semibold tracking-tight text-foreground truncate">
          {currentPage}
        </h2>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Search (placeholder) */}
        <Button
          id="header-search"
          variant="ghost"
          size="icon"
          aria-label="Search"
          className="text-muted-foreground hover:text-foreground"
        >
          <Search className="size-4" />
        </Button>

        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications (placeholder) */}
        <Button
          id="header-notifications"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-muted-foreground hover:text-foreground"
        >
          <Bell className="size-4" />
        </Button>

        {/* User avatar */}
        <Avatar
          id="header-user-avatar"
          size="sm"
          className="ml-1 cursor-pointer"
          aria-label="User menu"
        >
          <AvatarFallback className="text-xs font-semibold">
            U
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
