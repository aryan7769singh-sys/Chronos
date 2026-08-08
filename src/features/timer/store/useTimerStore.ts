"use client";

import { create } from "zustand";
import type {
  TimerMode,
  TimerStatus,
  FocusTaskInfo,
  TimerSettings,
} from "../types";
import { DEFAULT_TIMER_SETTINGS } from "../constants/timer";
import { soundSynth } from "../utils/audio";

interface TimerStoreState {
  mode: TimerMode;
  status: TimerStatus;
  targetDuration: number; // in seconds
  timeLeft: number; // in seconds
  elapsedSeconds: number; // in seconds
  pomodorosCompleted: number;
  activeTask: FocusTaskInfo | null;
  settings: TimerSettings;
  isZenMode: boolean;
  isSubmitting: boolean;

  // Internal timestamp tracking for delta calculation
  startTimestamp: number | null;
  accumulatedElapsed: number; // in seconds before current segment

  // Actions
  setMode: (mode: TimerMode, customSeconds?: number) => void;
  setActiveTask: (task: FocusTaskInfo | null) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  tick: () => boolean; // returns true if session just completed
  setZenMode: (enabled: boolean) => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
  setIsSubmitting: (submitting: boolean) => void;
  adjustTime: (deltaSeconds: number) => void;
}

function getDurationForMode(mode: TimerMode, settings: TimerSettings): number {
  switch (mode) {
    case "pomodoro":
      return settings.pomodoroWorkMinutes * 60;
    case "short_break":
      return settings.shortBreakMinutes * 60;
    case "long_break":
      return settings.longBreakMinutes * 60;
    case "custom":
      return 15 * 60;
    case "stopwatch":
      return 0;
  }
}

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  mode: "pomodoro",
  status: "idle",
  targetDuration: DEFAULT_TIMER_SETTINGS.pomodoroWorkMinutes * 60,
  timeLeft: DEFAULT_TIMER_SETTINGS.pomodoroWorkMinutes * 60,
  elapsedSeconds: 0,
  pomodorosCompleted: 0,
  activeTask: null,
  settings: DEFAULT_TIMER_SETTINGS,
  isZenMode: false,
  isSubmitting: false,

  startTimestamp: null,
  accumulatedElapsed: 0,

  setMode: (newMode, customSeconds) => {
    const { settings } = get();
    const duration =
      customSeconds !== undefined
        ? customSeconds
        : getDurationForMode(newMode, settings);

    set({
      mode: newMode,
      status: "idle",
      targetDuration: duration,
      timeLeft: duration,
      elapsedSeconds: 0,
      startTimestamp: null,
      accumulatedElapsed: 0,
    });
  },

  setActiveTask: (task) => set({ activeTask: task }),

  start: () => {
    const { status } = get();
    if (status === "running") return;

    set({
      status: "running",
      startTimestamp: Date.now(),
    });
  },

  pause: () => {
    const { status, startTimestamp, accumulatedElapsed } = get();
    if (status !== "running" || !startTimestamp) return;

    const segmentElapsed = Math.floor((Date.now() - startTimestamp) / 1000);
    const totalElapsed = accumulatedElapsed + segmentElapsed;

    set({
      status: "paused",
      startTimestamp: null,
      accumulatedElapsed: totalElapsed,
    });
  },

  reset: () => {
    const { mode, settings, targetDuration } = get();
    const duration =
      mode === "custom" ? targetDuration : getDurationForMode(mode, settings);

    set({
      status: "idle",
      targetDuration: duration,
      timeLeft: duration,
      elapsedSeconds: 0,
      startTimestamp: null,
      accumulatedElapsed: 0,
    });
  },

  skip: () => {
    const { mode, pomodorosCompleted, settings } = get();
    let nextMode: TimerMode = "pomodoro";

    if (mode === "pomodoro") {
      const nextCount = pomodorosCompleted + 1;
      const isLongBreak =
        nextCount % settings.pomodorosUntilLongBreak === 0;
      nextMode = isLongBreak ? "long_break" : "short_break";
      set({ pomodorosCompleted: nextCount });
    } else {
      nextMode = "pomodoro";
    }

    const duration = getDurationForMode(nextMode, settings);
    set({
      mode: nextMode,
      status: "idle",
      targetDuration: duration,
      timeLeft: duration,
      elapsedSeconds: 0,
      startTimestamp: null,
      accumulatedElapsed: 0,
    });
  },

  tick: () => {
    const state = get();
    if (state.status !== "running" || !state.startTimestamp) return false;

    const segmentElapsed = Math.floor(
      (Date.now() - state.startTimestamp) / 1000
    );
    const currentTotalElapsed = state.accumulatedElapsed + segmentElapsed;

    if (state.mode === "stopwatch") {
      set({
        elapsedSeconds: currentTotalElapsed,
        timeLeft: currentTotalElapsed,
      });
      return false;
    }

    // Countdown modes (pomodoro, short_break, long_break, custom)
    const remaining = Math.max(0, state.targetDuration - currentTotalElapsed);

    if (remaining <= 0) {
      // Completed!
      if (state.settings.soundEnabled) {
        soundSynth.playCompletionChime();
      }

      set({
        timeLeft: 0,
        elapsedSeconds: state.targetDuration,
        status: "idle",
        startTimestamp: null,
        accumulatedElapsed: state.targetDuration,
      });

      return true;
    }

    set({
      timeLeft: remaining,
      elapsedSeconds: currentTotalElapsed,
    });

    return false;
  },

  adjustTime: (deltaSeconds) => {
    const { targetDuration, timeLeft, mode } = get();
    if (mode === "stopwatch") return;

    const newTarget = Math.max(10, targetDuration + deltaSeconds);
    const newRemaining = Math.max(0, timeLeft + deltaSeconds);

    set({
      targetDuration: newTarget,
      timeLeft: newRemaining,
    });
  },

  setZenMode: (enabled) => set({ isZenMode: enabled }),

  updateSettings: (newSettings) => {
    set((state) => {
      const merged = { ...state.settings, ...newSettings };
      return { settings: merged };
    });
  },

  setIsSubmitting: (submitting) => set({ isSubmitting: submitting }),
}));
