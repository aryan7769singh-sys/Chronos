"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
  Minus,
  X,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { cn } from "@/lib/utils";

interface OverlayHeaderProps {
  compact: boolean;
  opacity: number;
  onToggleCompact: () => void;
  onOpacityChange: (newOpacity: number) => void;
  onSwitchToWidget?: () => void;
}

function subscribeDesktop() {
  return () => {};
}

function getDesktopSnapshot() {
  return (
    typeof window !== "undefined" &&
    !!(window as unknown as { chronosDesktop?: { isDesktop?: boolean } })
      .chronosDesktop?.isDesktop
  );
}

function getServerDesktopSnapshot() {
  return false;
}

export function OverlayHeader({
  compact,
  opacity,
  onToggleCompact,
  onOpacityChange,
  onSwitchToWidget,
}: OverlayHeaderProps) {
  const [timeStr, setTimeStr] = useState<string>("");
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot
  );

  useEffect(() => {
    const update = () => setTimeStr(format(new Date(), "EEE, MMM d • h:mm a"));
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleMinimize = () => {
    const win =
      typeof window !== "undefined"
        ? (window as unknown as { chronosDesktop?: { minimizeWindow?: () => void } })
        : {};
    if (win.chronosDesktop?.minimizeWindow) {
      win.chronosDesktop.minimizeWindow();
    }
  };

  const handleClose = () => {
    const win =
      typeof window !== "undefined"
        ? (window as unknown as { chronosDesktop?: { closeWindow?: () => void } })
        : {};
    if (win.chronosDesktop?.closeWindow) {
      win.chronosDesktop.closeWindow();
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-2 pb-2.5 border-b border-border/40 select-none cursor-move"
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
    >
      {/* Brand & Live Clock */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="size-6 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
          <Sparkles className="size-3.5 fill-current" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-xs font-bold tracking-tight text-foreground">
              CHRONOS
            </span>
            <span className="text-[9px] font-mono font-medium text-violet-400 bg-violet-500/10 px-1 py-0.2 rounded border border-violet-500/20">
              HUD
            </span>
          </div>
          {timeStr && (
            <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">
              {timeStr}
            </p>
          )}
        </div>
      </div>

      {/* Control Actions (Interactive - No Drag) */}
      <div
        className="flex items-center gap-0.5 shrink-0"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <NotificationBell />

        {/* Mode Switcher to Desktop Widget */}
        {onSwitchToWidget && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onSwitchToWidget}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Switch to Desktop Widget Mode"
          >
            <LayoutGrid className="size-3.5" />
          </Button>
        )}

        {/* Opacity Control Button & Popover slider */}
        <div className="relative">
          <Button
            id="overlay-opacity-btn"
            size="icon"
            variant="ghost"
            onClick={() => setShowOpacitySlider(!showOpacitySlider)}
            className="size-7 text-muted-foreground hover:text-foreground"
            title={`HUD Opacity (${opacity}%)`}
          >
            <SlidersHorizontal className="size-3.5" />
          </Button>

          {showOpacitySlider && (
            <div className="absolute right-0 top-8 z-50 p-3 rounded-xl border border-border bg-card/95 shadow-xl backdrop-blur-md w-44 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-foreground">
                <span>HUD Opacity</span>
                <span className="tabular-nums text-violet-400">{opacity}%</span>
              </div>
              <input
                id="overlay-opacity-slider-popover"
                type="range"
                min="30"
                max="100"
                value={opacity}
                onChange={(e) => onOpacityChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          )}
        </div>

        {/* Compact Toggle */}
        <Button
          id="overlay-compact-toggle-btn"
          size="icon"
          variant="ghost"
          onClick={onToggleCompact}
          className="size-7 text-muted-foreground hover:text-foreground"
          title={compact ? "Expand HUD" : "Compact HUD"}
        >
          {compact ? <Maximize2 className="size-3.5" /> : <Minimize2 className="size-3.5" />}
        </Button>

        {/* Window controls (Minimize & Close) */}
        {isDesktop && (
          <>
            <div className="h-3.5 w-px bg-border/40 mx-0.5" />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleMinimize}
              className="size-7 text-muted-foreground hover:text-foreground"
              title="Minimize Window"
            >
              <Minus className="size-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleClose}
              className="size-7 text-muted-foreground hover:text-destructive"
              title="Hide to Tray"
            >
              <X className="size-3.5" />
            </Button>
          </>
        )}

        {/* Return to Web App (browser only) */}
        {!isDesktop && (
          <Link
            href="/dashboard"
            className={cn(
              "size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
            )}
            title="Open Full App Dashboard"
          >
            <ExternalLink className="size-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
