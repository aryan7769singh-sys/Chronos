"use client";

import { useEffect, useRef, useTransition } from "react";
import { TimerDisplay } from "./TimerDisplay";
import { TimerControls } from "./TimerControls";
import { FocusTaskSelector } from "./FocusTaskSelector";
import { FocusSessionHistory } from "./FocusSessionHistory";
import { ZenOverlay } from "./ZenOverlay";
import { useTimerStore } from "../store/useTimerStore";
import { recordFocusSessionAction } from "../actions";
import type {
  FocusSession,
  FocusSummary,
  FocusTaskInfo,
} from "../types";

interface FocusViewProps {
  tasks: FocusTaskInfo[];
  recentSessions: FocusSession[];
  summary: FocusSummary;
  initialTask?: FocusTaskInfo | null;
  /** Planned duration from a linked TimeBlock (minutes) — displayed as context only */
  plannedDurationMinutes?: number;
  /** ID of the linked TimeBlock, if started from a time block */
  blockId?: string;
}

export function FocusView({
  tasks,
  recentSessions,
  summary,
  initialTask,
  plannedDurationMinutes,
}: FocusViewProps) {
  const [isPending, startTransition] = useTransition();

  const {
    mode,
    status,
    timeLeft,
    targetDuration,
    elapsedSeconds,
    pomodorosCompleted,
    activeTask,
    isZenMode,
    isSubmitting,
    setMode,
    setActiveTask,
    start,
    pause,
    reset,
    skip,
    tick,
    adjustTime,
    setZenMode,
    setIsSubmitting,
  } = useTimerStore();

  // Set initial task if provided and none selected
  const initialTaskRef = useRef(false);
  useEffect(() => {
    if (!initialTaskRef.current && initialTask && !activeTask) {
      setActiveTask(initialTask);
      initialTaskRef.current = true;
    }
  }, [initialTask, activeTask, setActiveTask]);

  // Main high-frequency delta timer loop
  useEffect(() => {
    if (status !== "running") return;

    const interval = setInterval(() => {
      const completed = tick();
      if (completed) {
        // Complete session!
        const state = useTimerStore.getState();
        if (state.isSubmitting) return;

        setIsSubmitting(true);
        startTransition(async () => {
          try {
            await recordFocusSessionAction({
              mode: state.mode,
              duration: state.targetDuration,
              targetDuration: state.targetDuration,
              taskId: state.activeTask?.id || null,
              projectId: state.activeTask?.projectId || null,
              completed: true,
            });

            // Automatically advance to break or next pomodoro
            state.skip();
          } catch (err) {
            console.error("Failed to record focus session:", err);
          } finally {
            setIsSubmitting(false);
          }
        });
      }
    }, 250); // Check delta every 250ms for smooth UI updates and accurate timestamps

    return () => clearInterval(interval);
  }, [status, tick, skip, setIsSubmitting]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        if (status === "running") {
          pause();
        } else {
          start();
        }
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        setZenMode(!isZenMode);
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [status, isZenMode, start, pause, reset, setZenMode]);

  return (
    <>
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              Focus &amp; Deep Work
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Execute deep work sessions and track your focus time.
            </p>
          </div>

          {/* Time Block context badge — informational only */}
          {plannedDurationMinutes && plannedDurationMinutes > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-600 dark:text-violet-400 font-medium">
              <span className="size-1.5 rounded-full bg-violet-500 inline-block" />
              Planned block: {plannedDurationMinutes}m
            </div>
          )}
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* Left Column: Task Card + Circular Timer + Controls */}
          <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-xs space-y-6">
            <FocusTaskSelector
              activeTask={activeTask}
              tasks={tasks}
              onSelectTask={setActiveTask}
            />

            <TimerDisplay
              mode={mode}
              status={status}
              timeLeft={timeLeft}
              targetDuration={targetDuration}
              elapsedSeconds={elapsedSeconds}
              pomodorosCompleted={pomodorosCompleted}
            />

            <TimerControls
              mode={mode}
              status={status}
              onSetMode={setMode}
              onStart={start}
              onPause={pause}
              onReset={reset}
              onSkip={skip}
              onAdjustTime={adjustTime}
              onToggleZen={() => setZenMode(true)}
              isSubmitting={isSubmitting || isPending}
            />
          </div>

          {/* Right Column: Today's Focus Metrics + Recent Sessions Timeline */}
          <div className="space-y-6">
            <FocusSessionHistory
              sessions={recentSessions}
              summary={summary}
            />
          </div>
        </div>
      </div>

      {/* Zen Distraction-Free Fullscreen View */}
      <ZenOverlay
        open={isZenMode}
        mode={mode}
        status={status}
        timeLeft={timeLeft}
        targetDuration={targetDuration}
        elapsedSeconds={elapsedSeconds}
        pomodorosCompleted={pomodorosCompleted}
        activeTask={activeTask}
        onSetMode={setMode}
        onStart={start}
        onPause={pause}
        onReset={reset}
        onSkip={skip}
        onAdjustTime={adjustTime}
        onClose={() => setZenMode(false)}
      />
    </>
  );
}
