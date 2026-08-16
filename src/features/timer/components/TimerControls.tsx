"use client";

import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Maximize2,
  Plus,
  Minus,
  Timer,
  Flame,
  Coffee,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import type { TimerMode, TimerStatus } from "../types";
import { cn } from "@/lib/utils";

interface TimerControlsProps {
  mode: TimerMode;
  status: TimerStatus;
  onSetMode: (mode: TimerMode, customSeconds?: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  onToggleZen: () => void;
  isSubmitting?: boolean;
}

const MODES: { id: TimerMode; label: string; icon: typeof Timer }[] = [
  { id: "pomodoro", label: "Focus", icon: Flame },
  { id: "short_break", label: "Short Break", icon: Coffee },
  { id: "long_break", label: "Long Break", icon: Sparkles },
  { id: "custom", label: "Custom", icon: Timer },
  { id: "stopwatch", label: "Stopwatch", icon: Timer },
];

export function TimerControls({
  mode,
  status,
  onSetMode,
  onStart,
  onPause,
  onReset,
  onSkip,
  onAdjustTime,
  onToggleZen,
  isSubmitting = false,
}: TimerControlsProps) {
  const isRunning = status === "running";

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-md mx-auto">
      {/* Mode Selector Tabs */}
      <SegmentedTabs
        size="sm"
        value={mode}
        onValueChange={(m) => onSetMode(m as TimerMode)}
        options={MODES.map((m) => ({
          id: m.id,
          label: m.label,
          icon: m.icon,
        }))}
        aria-label="Timer mode"
        className="w-full justify-center max-w-md overflow-x-auto"
      />

      {/* Quick Test Presets (Only visible when Custom Mode is active) */}
      {mode === "custom" && (
        <div className="flex items-center gap-2 text-xs flex-wrap justify-center animate-in fade-in-50 duration-200">
          <span className="text-muted-foreground text-[11px]">Presets:</span>
          {[
            { label: "10s (Test)", sec: 10 },
            { label: "30s (Test)", sec: 30 },
            { label: "5m", sec: 300 },
            { label: "15m", sec: 900 },
            { label: "45m", sec: 2700 },
            { label: "60m", sec: 3600 },
          ].map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => onSetMode("custom", preset.sec)}
              className="px-2 py-0.5 rounded-md bg-muted/70 hover:bg-muted border border-border/50 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {/* Primary Action Row */}
      <div className="flex items-center justify-center gap-3 w-full">
        {/* Reset Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={status === "idle" || isSubmitting}
          className="size-11 rounded-full cursor-pointer hover:bg-muted"
          aria-label="Reset timer"
          title="Reset timer (R)"
        >
          <RotateCcw className="size-4 text-muted-foreground" />
        </Button>

        {/* Adjust -5m */}
        {mode !== "stopwatch" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAdjustTime(-300)}
            disabled={isSubmitting}
            className="size-9 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            title="Subtract 5 minutes"
          >
            <Minus className="size-3.5" />
          </Button>
        )}

        {/* Start / Pause Button */}
        <Button
          size="lg"
          onClick={isRunning ? onPause : onStart}
          disabled={isSubmitting}
          className={cn(
            "h-14 px-8 rounded-full text-base font-semibold transition-all duration-200 shadow-md cursor-pointer gap-2",
            isRunning
              ? "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-600 dark:hover:bg-amber-500"
              : "bg-primary hover:bg-primary/90 text-primary-foreground"
          )}
          aria-label={isRunning ? "Pause session" : "Start session"}
          title="Space to toggle"
        >
          {isRunning ? (
            <>
              <Pause className="size-5 fill-current" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="size-5 fill-current ml-0.5" />
              <span>{status === "paused" ? "Resume" : "Start Focus"}</span>
            </>
          )}
        </Button>

        {/* Adjust +5m */}
        {mode !== "stopwatch" && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onAdjustTime(300)}
            disabled={isSubmitting}
            className="size-9 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
            title="Add 5 minutes"
          >
            <Plus className="size-3.5" />
          </Button>
        )}

        {/* Skip Button */}
        <Button
          variant="outline"
          size="icon"
          onClick={onSkip}
          disabled={isSubmitting}
          className="size-11 rounded-full cursor-pointer hover:bg-muted"
          aria-label="Skip to next session"
          title="Skip session"
        >
          <SkipForward className="size-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Auxiliary Buttons */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <button
          type="button"
          onClick={onToggleZen}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer border border-transparent hover:border-border/40"
        >
          <Maximize2 className="size-3.5" />
          <span>Distraction-Free Mode (F)</span>
        </button>
      </div>
    </div>
  );
}
