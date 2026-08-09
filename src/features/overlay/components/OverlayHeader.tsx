"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OverlayHeaderProps {
  compact: boolean;
  opacity: number;
  onToggleCompact: () => void;
  onOpacityChange: (newOpacity: number) => void;
}

export function OverlayHeader({
  compact,
  opacity,
  onToggleCompact,
  onOpacityChange,
}: OverlayHeaderProps) {

  const [timeStr, setTimeStr] = useState<string>("");
  const [showOpacitySlider, setShowOpacitySlider] = useState(false);

  useEffect(() => {
    const update = () => setTimeStr(format(new Date(), "EEE, MMM d • h:mm a"));
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/40 select-none">
      {/* Brand & Live Clock */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="size-6 rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-400 flex items-center justify-center shrink-0">
          <Sparkles className="size-3.5 fill-current" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-tight text-foreground">
              CHRONOS HUD
            </span>
            <span className="text-[10px] font-mono font-medium text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded border border-violet-500/20">
              v0.14.0
            </span>
          </div>
          {timeStr && (
            <p className="text-[10px] text-muted-foreground font-medium truncate">
              {timeStr}
            </p>
          )}
        </div>
      </div>

      {/* Control Actions */}
      <div className="flex items-center gap-1 shrink-0">
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
            <div className="absolute right-0 top-8 z-50 p-3 rounded-xl border border-border bg-card/95 shadow-xl backdrop-blur-md w-48 space-y-2">
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

        {/* Return to Web App */}
        <Link
          href="/dashboard"
          className={cn(
            "size-7 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          )}
          title="Open Full App Dashboard"
        >
          <ExternalLink className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
