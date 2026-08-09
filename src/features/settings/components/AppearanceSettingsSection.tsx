"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Monitor, Check, Sparkles } from "lucide-react";
import type { AppearanceSettings, ThemePreference, DensityPreference } from "../types";
import type { ProjectColor } from "@/features/tasks/types";
import { THEME_OPTIONS, ACCENT_COLOR_OPTIONS, DENSITY_OPTIONS } from "../constants/domain";
import { cn } from "@/lib/utils";

interface AppearanceSettingsSectionProps {
  settings: AppearanceSettings;
  onChange: (patch: Partial<AppearanceSettings>) => void;
}

export function AppearanceSettingsSection({
  settings,
  onChange,
}: AppearanceSettingsSectionProps) {
  const { setTheme } = useTheme();

  const handleThemeChange = (newTheme: ThemePreference) => {
    setTheme(newTheme);
    onChange({ theme: newTheme });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Appearance & Theme</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Customize Chronos theme mode, primary accent palette, and layout density.
        </p>
      </div>

      {/* Theme selection */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Theme Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const isActive = settings.theme === opt.value;
            const Icon = opt.value === "light" ? Sun : opt.value === "dark" ? Moon : Monitor;
            return (
              <button
                key={opt.value}
                id={`setting-theme-${opt.value}`}
                type="button"
                onClick={() => handleThemeChange(opt.value)}
                className={cn(
                  "flex flex-col gap-2 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative",
                  isActive
                    ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary"
                    : "border-border/60 bg-card/40 hover:bg-card/80 hover:border-border"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <Icon className="size-4 text-primary" />
                    <span>{opt.label}</span>
                  </div>
                  {isActive && <Check className="size-4 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground leading-tight">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent Color Palette */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Accent Color Palette
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {ACCENT_COLOR_OPTIONS.map((opt) => {
            const isActive = settings.accentColor === opt.value;
            return (
              <button
                key={opt.value}
                id={`setting-accent-${opt.value}`}
                type="button"
                onClick={() => onChange({ accentColor: opt.value as ProjectColor })}
                className={cn(
                  "flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer",
                  isActive
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border/60 bg-card/40 hover:bg-card/80"
                )}
              >
                <span className={cn("size-4 rounded-full shrink-0", opt.bgClass)} />
                <span className="truncate">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Layout Density */}
      <div className="space-y-3">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
          UI Density & Layout
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {DENSITY_OPTIONS.map((opt) => {
            const isActive = settings.uiDensity === opt.value;
            return (
              <button
                key={opt.value}
                id={`setting-density-${opt.value}`}
                type="button"
                onClick={() => onChange({ uiDensity: opt.value as DensityPreference })}
                className={cn(
                  "flex flex-col gap-1.5 p-3.5 rounded-xl border text-left transition-all cursor-pointer",
                  isActive
                    ? "border-primary bg-primary/10 ring-1 ring-primary"
                    : "border-border/60 bg-card/40 hover:bg-card/80"
                )}
              >
                <div className="flex items-center justify-between font-semibold text-xs text-foreground">
                  <span>{opt.label}</span>
                  {isActive && <Check className="size-3.5 text-primary" />}
                </div>
                <p className="text-[11px] text-muted-foreground">{opt.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reduced Motion Toggle */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-semibold text-xs text-foreground">
            <Sparkles className="size-4 text-violet-500" />
            <span>Reduced Motion</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Minimize smooth transition animations across dashboards and overlays.
          </p>
        </div>

        <button
          id="setting-toggle-motion"
          type="button"
          role="switch"
          aria-checked={settings.reducedMotion}
          onClick={() => onChange({ reducedMotion: !settings.reducedMotion })}
          className={cn(
            "w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer",
            settings.reducedMotion ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "size-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5",
              settings.reducedMotion && "translate-x-5"
            )}
          />
        </button>
      </div>
    </div>
  );
}
