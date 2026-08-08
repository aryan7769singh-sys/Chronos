"use client";

import { useEffect } from "react";
import { Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { PROJECT_COLOR_STYLES, ProjectIcon } from "@/features/tasks/constants/domain";
import type { FocusTaskInfo, TimerMode, TimerStatus } from "../types";
import { cn } from "@/lib/utils";

interface ZenOverlayProps {
  open: boolean;
  mode: TimerMode;
  status: TimerStatus;
  timeLeft: number;
  targetDuration: number;
  elapsedSeconds: number;
  pomodorosCompleted: number;
  activeTask: FocusTaskInfo | null;
  onSetMode: (mode: TimerMode, customSeconds?: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onAdjustTime: (deltaSeconds: number) => void;
  onClose: () => void;
}

export function ZenOverlay({
  open,
  mode,
  status,
  timeLeft,
  targetDuration,
  elapsedSeconds,
  pomodorosCompleted,
  activeTask,
  onSetMode,
  onStart,
  onPause,
  onReset,
  onSkip,
  onAdjustTime,
  onClose,
}: ZenOverlayProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (status === "running") {
          onPause();
        } else {
          onStart();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        onReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, status, onStart, onPause, onReset, onClose]);

  if (!open) return null;

  const colorStyles = activeTask
    ? PROJECT_COLOR_STYLES[activeTask.projectColor] ||
      PROJECT_COLOR_STYLES.violet
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Zen Focus Mode
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="gap-1.5 text-xs rounded-full hover:bg-muted cursor-pointer"
          title="Exit Zen Mode (Esc)"
        >
          <Minimize2 className="size-3.5" />
          <span>Exit (Esc)</span>
        </Button>
      </div>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full space-y-6">
        {/* Active Task Callout */}
        {activeTask && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 border border-border/60 shadow-xs max-w-md">
            {colorStyles && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  colorStyles.badge
                )}
              >
                <ProjectIcon
                  iconName={activeTask.projectIcon}
                  className="size-2.5"
                />
                <span className="truncate max-w-[100px]">
                  {activeTask.projectName}
                </span>
              </span>
            )}
            <span className="text-xs font-medium text-foreground truncate">
              {activeTask.title}
            </span>
          </div>
        )}

        {/* Big Ring */}
        <TimerDisplay
          mode={mode}
          status={status}
          timeLeft={timeLeft}
          targetDuration={targetDuration}
          elapsedSeconds={elapsedSeconds}
          pomodorosCompleted={pomodorosCompleted}
        />

        {/* Controls */}
        <TimerControls
          mode={mode}
          status={status}
          onSetMode={onSetMode}
          onStart={onStart}
          onPause={onPause}
          onReset={onReset}
          onSkip={onSkip}
          onAdjustTime={onAdjustTime}
          onToggleZen={onClose}
        />
      </div>

      {/* Bottom Shortcuts Helper */}
      <div className="flex items-center justify-center gap-6 text-[11px] text-muted-foreground w-full max-w-md mx-auto">
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Space</kbd>{" "}
          Play/Pause
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">R</kbd>{" "}
          Reset
        </span>
        <span>
          <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono">Esc</kbd>{" "}
          Exit
        </span>
      </div>
    </div>
  );
}
