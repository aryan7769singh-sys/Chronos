"use client";

import { useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import { cn } from "@/lib/utils";

interface TimerModuleProps {
  compact?: boolean;
}

function formatTimerTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const remSecs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;
}

export function TimerModule({ compact = false }: TimerModuleProps) {
  const { status, mode, timeLeft, start, pause, reset, tick } = useTimerStore();

  const isRunning = status === "running";

  // Tick timer
  useEffect(() => {
    if (status !== "running") return;
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [status, tick]);

  const modeLabel = mode === "pomodoro"
    ? "DEEP WORK"
    : mode === "short_break"
    ? "SHORT BREAK"
    : mode === "long_break"
    ? "LONG BREAK"
    : mode === "stopwatch"
    ? "STOPWATCH"
    : "CUSTOM FOCUS";

  if (compact) {
    return (
      <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="size-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xl font-extrabold font-mono tracking-tight text-white tabular-nums">
            {formatTimerTime(timeLeft)}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
            {modeLabel}
          </span>
        </div>

        <div
          className="flex items-center gap-1 shrink-0"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <Button
            size="sm"
            onClick={isRunning ? pause : start}
            className={cn(
              "h-6 px-2 text-[10px] font-semibold gap-1 rounded-lg",
              isRunning
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : "bg-violet-600 hover:bg-violet-500 text-white"
            )}
          >
            {isRunning ? <Pause className="size-2.5 fill-current" /> : <Play className="size-2.5 fill-current" />}
            <span>{isRunning ? "Pause" : "Start"}</span>
          </Button>

          <Button
            size="icon"
            variant="ghost"
            onClick={reset}
            className="size-6 text-slate-400 hover:text-white hover:bg-white/10"
            title="Reset Timer"
          >
            <RotateCcw className="size-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-1.5 py-1 select-none">
      {/* Large Dominant Countdown Timer Typography */}
      <div className="relative flex flex-col items-center">
        <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white tabular-nums drop-shadow-[0_2px_12px_rgba(255,255,255,0.15)] leading-none">
          {formatTimerTime(timeLeft)}
        </div>

        {/* Mode Label */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="inline-block size-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-violet-300 font-mono">
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Subtle Control Buttons */}
      <div
        className="flex items-center justify-center gap-2 pt-2"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <Button
          size="sm"
          onClick={isRunning ? pause : start}
          className={cn(
            "h-8 px-3.5 text-xs font-semibold rounded-lg shadow-sm gap-1.5 transition-all cursor-pointer",
            isRunning
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-violet-600 hover:bg-violet-500 text-white"
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
          size="icon"
          variant="outline"
          onClick={reset}
          className="size-8 rounded-lg text-slate-400 hover:text-white border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer"
          title="Reset Timer"
        >
          <RotateCcw className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
