"use client";

import { Timer, Volume2, VolumeX, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { FocusSettings, SoundThemeOption } from "../types";
import { SOUND_THEME_OPTIONS, FOCUS_NUMERIC_LIMITS } from "../constants/domain";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import { cn } from "@/lib/utils";

interface FocusSettingsSectionProps {
  settings: FocusSettings;
  onChange: (patch: Partial<FocusSettings>) => void;
}

export function FocusSettingsSection({
  settings,
  onChange,
}: FocusSettingsSectionProps) {
  const updateTimerStore = useTimerStore((s) => s.updateSettings);

  const handleUpdate = (patch: Partial<FocusSettings>) => {
    onChange(patch);
    // Sync immediately to Zustand timer store for live execution
    updateTimerStore({
      ...(patch.pomodoroMinutes !== undefined && { pomodoroWorkMinutes: patch.pomodoroMinutes }),
      ...(patch.shortBreakMinutes !== undefined && { shortBreakMinutes: patch.shortBreakMinutes }),
      ...(patch.longBreakMinutes !== undefined && { longBreakMinutes: patch.longBreakMinutes }),
      ...(patch.pomodoroCycles !== undefined && { pomodorosUntilLongBreak: patch.pomodoroCycles }),
      ...(patch.autoStartBreaks !== undefined && { autoStartBreaks: patch.autoStartBreaks }),
      ...(patch.autoStartWork !== undefined && { autoStartPomodoros: patch.autoStartWork }),
      ...(patch.soundEnabled !== undefined && { soundEnabled: patch.soundEnabled }),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Focus & Deep Work Engine</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure Pomodoro session intervals, break cycles, auto-advance rules, and audio themes.
        </p>
      </div>

      {/* Interval Durations */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Timer className="size-4 text-violet-500" />
          Interval Durations (Minutes)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Pomodoro Work */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="focus-pomo-mins" className="text-xs font-semibold text-foreground">
              Focus Work Session
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="focus-pomo-mins"
                type="number"
                min={FOCUS_NUMERIC_LIMITS.pomodoroMinutes.min}
                max={FOCUS_NUMERIC_LIMITS.pomodoroMinutes.max}
                value={settings.pomodoroMinutes}
                onChange={(e) =>
                  handleUpdate({ pomodoroMinutes: parseInt(e.target.value, 10) || 25 })
                }
                className="h-9 text-xs tabular-nums"
              />
              <span className="text-xs text-muted-foreground shrink-0">mins</span>
            </div>
          </div>

          {/* Short Break */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="focus-short-mins" className="text-xs font-semibold text-foreground">
              Short Break
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="focus-short-mins"
                type="number"
                min={FOCUS_NUMERIC_LIMITS.shortBreakMinutes.min}
                max={FOCUS_NUMERIC_LIMITS.shortBreakMinutes.max}
                value={settings.shortBreakMinutes}
                onChange={(e) =>
                  handleUpdate({ shortBreakMinutes: parseInt(e.target.value, 10) || 5 })
                }
                className="h-9 text-xs tabular-nums"
              />
              <span className="text-xs text-muted-foreground shrink-0">mins</span>
            </div>
          </div>

          {/* Long Break */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="focus-long-mins" className="text-xs font-semibold text-foreground">
              Long Break
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="focus-long-mins"
                type="number"
                min={FOCUS_NUMERIC_LIMITS.longBreakMinutes.min}
                max={FOCUS_NUMERIC_LIMITS.longBreakMinutes.max}
                value={settings.longBreakMinutes}
                onChange={(e) =>
                  handleUpdate({ longBreakMinutes: parseInt(e.target.value, 10) || 15 })
                }
                className="h-9 text-xs tabular-nums"
              />
              <span className="text-xs text-muted-foreground shrink-0">mins</span>
            </div>
          </div>
        </div>

        {/* Cycles count */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-4 flex-wrap">
          <div>
            <span className="text-xs font-semibold text-foreground">Cycles Before Long Break</span>
            <p className="text-[11px] text-muted-foreground">
              Number of completed Focus work intervals before triggering a Long Break.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              id="focus-cycles"
              type="number"
              min={FOCUS_NUMERIC_LIMITS.pomodoroCycles.min}
              max={FOCUS_NUMERIC_LIMITS.pomodoroCycles.max}
              value={settings.pomodoroCycles}
              onChange={(e) =>
                handleUpdate({ pomodoroCycles: parseInt(e.target.value, 10) || 4 })
              }
              className="h-9 w-20 text-xs tabular-nums"
            />
            <span className="text-xs text-muted-foreground">cycles</span>
          </div>
        </div>
      </div>

      {/* Auto Start Rules */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Play className="size-4 text-emerald-500" />
          Auto-Advance Rules
        </h3>

        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-foreground">Auto-start Breaks</span>
            <p className="text-[11px] text-muted-foreground">
              Automatically begin break countdown as soon as a Focus session completes.
            </p>
          </div>
          <button
            id="focus-toggle-autostart-breaks"
            type="button"
            role="switch"
            aria-checked={settings.autoStartBreaks}
            onClick={() => handleUpdate({ autoStartBreaks: !settings.autoStartBreaks })}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer",
              settings.autoStartBreaks ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "size-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5",
                settings.autoStartBreaks && "translate-x-5"
              )}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
          <div>
            <span className="text-xs font-semibold text-foreground">Auto-start Work Sessions</span>
            <p className="text-[11px] text-muted-foreground">
              Automatically start next Focus session when break timer finishes.
            </p>
          </div>
          <button
            id="focus-toggle-autostart-work"
            type="button"
            role="switch"
            aria-checked={settings.autoStartWork}
            onClick={() => handleUpdate({ autoStartWork: !settings.autoStartWork })}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer",
              settings.autoStartWork ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "size-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5",
                settings.autoStartWork && "translate-x-5"
              )}
            />
          </button>
        </div>
      </div>

      {/* Sound Settings */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            {settings.soundEnabled ? (
              <Volume2 className="size-4 text-violet-500" />
            ) : (
              <VolumeX className="size-4 text-muted-foreground" />
            )}
            Sound & Audio Alerts
          </h3>
          <button
            id="focus-toggle-sound"
            type="button"
            role="switch"
            aria-checked={settings.soundEnabled}
            onClick={() => handleUpdate({ soundEnabled: !settings.soundEnabled })}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer",
              settings.soundEnabled ? "bg-primary" : "bg-muted"
            )}
          >
            <span
              className={cn(
                "size-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5",
                settings.soundEnabled && "translate-x-5"
              )}
            />
          </button>
        </div>

        {settings.soundEnabled && (
          <div className="space-y-4 pt-2 border-t border-border/40">
            {/* Volume slider */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Alert Volume</span>
                <p className="text-[11px] text-muted-foreground">Volume level for completion chimes.</p>
              </div>
              <div className="flex items-center gap-3 w-40">
                <input
                  id="focus-volume-range"
                  type="range"
                  min="0"
                  max="100"
                  value={settings.soundVolume}
                  onChange={(e) =>
                    handleUpdate({ soundVolume: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xs font-bold tabular-nums text-foreground w-8 text-right">
                  {settings.soundVolume}%
                </span>
              </div>
            </div>

            {/* Sound Theme */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Sound Theme</span>
                <p className="text-[11px] text-muted-foreground">Audio tone played on session completion.</p>
              </div>
              <select
                id="focus-sound-theme"
                value={settings.soundTheme}
                onChange={(e) =>
                  handleUpdate({ soundTheme: e.target.value as SoundThemeOption })
                }
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {SOUND_THEME_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
