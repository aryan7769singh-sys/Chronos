"use client";

import { useMemo } from "react";
import { TIMER_MODE_COLORS, TIMER_MODE_LABELS } from "../constants/timer";
import type { TimerMode, TimerStatus } from "../types";
import { cn } from "@/lib/utils";

interface TimerDisplayProps {
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;
  targetDuration: number;
  elapsedSeconds: number;
  pomodorosCompleted: number;
}

export function TimerDisplay({
  mode,
  status,
  timeLeft,
  targetDuration,
  pomodorosCompleted,
}: TimerDisplayProps) {
  const modeColor = TIMER_MODE_COLORS[mode] || TIMER_MODE_COLORS.pomodoro;
  const isRunning = status === "running";

  // Calculate percentage (0 to 1)
  const progressRatio = useMemo(() => {
    if (mode === "stopwatch") {
      // Rotate ring based on 60-second cycle for stopwatch
      return (timeLeft % 60) / 60;
    }
    if (targetDuration <= 0) return 0;
    return Math.max(0, Math.min(1, (targetDuration - timeLeft) / targetDuration));
  }, [mode, timeLeft, targetDuration]);

  // Format MM:SS
  const timeFormatted = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }, [timeLeft]);

  // SVG ring properties
  const size = 320;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progressRatio * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* Circular Progress Ring */}
      <div className="relative size-[280px] sm:size-[320px] flex items-center justify-center">
        {/* Background ambient glow when running */}
        <div
          className={cn(
            "absolute inset-4 rounded-full transition-opacity duration-700 blur-2xl pointer-events-none -z-10",
            isRunning ? "opacity-30" : "opacity-0"
          )}
          style={{ backgroundColor: modeColor.ring }}
        />

        <svg
          className="size-full -rotate-90 transform"
          viewBox={`0 0 ${size} ${size}`}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="stroke-muted/40 fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Animated active stroke */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={modeColor.ring}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>

        {/* Inner Content */}
        <div className="absolute flex flex-col items-center justify-center text-center space-y-2">
          {/* Mode Pill */}
          <span
            className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border",
              modeColor.badge
            )}
          >
            {TIMER_MODE_LABELS[mode]}
          </span>

          {/* Large Time Display */}
          <span className="text-5xl sm:text-6xl font-bold tracking-tight text-foreground font-mono tabular-nums">
            {timeFormatted}
          </span>

          {/* Pomodoro Cycles Count / Status subtitle */}
          <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
            {mode === "pomodoro" ? (
              <div className="flex items-center gap-1">
                <span>Cycle #{pomodorosCompleted + 1}</span>
                <div className="flex gap-1 ml-1">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={cn(
                        "size-1.5 rounded-full",
                        i < (pomodorosCompleted % 4)
                          ? "bg-violet-600 dark:bg-violet-400"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <span>
                {status === "running"
                  ? "In Session"
                  : status === "paused"
                  ? "Paused"
                  : "Ready"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
