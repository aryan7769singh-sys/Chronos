"use client";

import { useEffect } from "react";
import { Play, Pause, RotateCcw, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import { TIMER_MODE_LABELS, TIMER_MODE_COLORS } from "@/features/timer/constants/timer";
import type { FocusTaskInfo } from "@/features/timer/types";
import { cn } from "@/lib/utils";

interface OverlayFocusModuleProps {
  initialTask?: FocusTaskInfo | null;
}

function formatTimerDisplay(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;
}

export function OverlayFocusModule({ initialTask }: OverlayFocusModuleProps) {
  const {
    mode,
    status,
    timeLeft,
    activeTask,
    setActiveTask,
    start,
    pause,
    reset,
    skip,
    tick,
  } = useTimerStore();

  // Ensure active task set if available and none selected
  useEffect(() => {
    if (initialTask && !activeTask) {
      setActiveTask(initialTask);
    }
  }, [initialTask, activeTask, setActiveTask]);

  // High frequency delta tick interval when timer is running
  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(() => {
      tick();
    }, 250);
    return () => clearInterval(interval);
  }, [status, tick]);

  const modeColors = TIMER_MODE_COLORS[mode];
  const isRunning = status === "running";

  return (
    <div className="p-3.5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xs space-y-3">
      {/* Mode badge & status */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border",
            modeColors.badge
          )}
        >
          <span className="size-1.5 rounded-full bg-current inline-block animate-pulse" />
          {TIMER_MODE_LABELS[mode]}
        </span>

        <span className="text-[11px] font-medium text-muted-foreground capitalize">
          {status}
        </span>
      </div>

      {/* Timer display & Play/Pause controls */}
      <div className="flex items-center justify-between gap-4">
        <div className="text-3xl font-bold font-mono tracking-tight text-foreground tabular-nums">
          {formatTimerDisplay(timeLeft)}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            id="hud-timer-play-pause-btn"
            size="sm"
            onClick={isRunning ? pause : start}
            className={cn(
              "h-8 px-3 text-xs font-semibold gap-1.5 shadow-xs transition-all",
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            )}
          >
            {isRunning ? (
              <>
                <Pause className="size-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Start</span>
              </>
            )}
          </Button>

          <Button
            id="hud-timer-reset-btn"
            size="icon"
            variant="outline"
            onClick={reset}
            className="size-8 text-muted-foreground hover:text-foreground"
            title="Reset Timer"
          >
            <RotateCcw className="size-3.5" />
          </Button>

          <Button
            id="hud-timer-skip-btn"
            size="icon"
            variant="outline"
            onClick={skip}
            className="size-8 text-muted-foreground hover:text-foreground"
            title="Skip Session"
          >
            <SkipForward className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Linked Task Context */}
      {activeTask && (
        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                activeTask.projectColor ? `bg-${activeTask.projectColor}-500` : "bg-violet-500"
              )}
            />
            <span className="font-semibold text-foreground truncate">
              {activeTask.title}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0 font-medium">
            {activeTask.projectName}
          </span>
        </div>
      )}
    </div>
  );
}
