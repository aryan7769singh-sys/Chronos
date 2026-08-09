"use client";

import { useSyncExternalStore } from "react";
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
import { UserMenu } from "@/components/auth/UserMenu";
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
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-muted-foreground hover:text-foreground"
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
// Header — public component
// ---------------------------------------------------------------------------

export function Header({ onMenuClick, user }: HeaderProps) {
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

        {/* User menu with avatar & sign out */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}
