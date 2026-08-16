"use client";

import { Eye, Sliders, Info, ListOrdered, Bell, Clock, Layers, Sparkles, Type, Shield, Power } from "lucide-react";
import type { OverlaySettings, OverlayPresetOption, OverlayBorderOption, OverlayTimerSizeOption, OverlayTimerWeightOption, OverlayDensityOption } from "../types";
import { OVERLAY_PRESETS } from "@/features/overlay/presets/overlay-presets";
import { cn } from "@/lib/utils";

interface OverlaySettingsSectionProps {
  settings: OverlaySettings;
  onChange: (patch: Partial<OverlaySettings>) => void;
}

export function OverlaySettingsSection({
  settings,
  onChange,
}: OverlaySettingsSectionProps) {
  // Broadcast settings change to live overlay HUD / Desktop Widget windows & notify Electron
  const handleChange = (patch: Partial<OverlaySettings>) => {
    const updatedOverlay = { ...settings, ...patch };
    onChange(patch);

    // Live sync via BroadcastChannel
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("chronos-settings-broadcast");
        channel.postMessage({
          type: "SETTINGS_UPDATED",
          settings: updatedOverlay,
        });
        channel.close();
      } catch {
        // ignore
      }
    }

    // Sync Windows startup settings with Electron main process
    const win = typeof window !== "undefined"
      ? (window as unknown as { chronosDesktop?: { setStartupSettings?: (input: unknown) => void } })
      : {};
    if (win.chronosDesktop?.setStartupSettings) {
      win.chronosDesktop.setStartupSettings({
        launchOnStartup: patch.launchOnStartup !== undefined ? patch.launchOnStartup : settings.launchOnStartup,
        launchMinimized: patch.launchMinimized !== undefined ? patch.launchMinimized : settings.launchMinimized,
        startupMode: patch.startupMode !== undefined ? patch.startupMode : settings.startupMode,
      });
    }
  };

  const handleApplyPreset = (presetKey: OverlayPresetOption) => {
    const presetDef = OVERLAY_PRESETS[presetKey];
    if (presetDef && presetDef.settings) {
      handleChange(presetDef.settings);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Desktop Companion &amp; Overlay System</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure startup reliability, appearance personalization, widget presets, and visible productivity modules.
        </p>
      </div>

      {/* Info banner */}
      <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-500/5 flex items-start gap-2.5 text-xs text-muted-foreground">
        <Info className="size-4 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Chronos Desktop Companion</span>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            The Desktop Widget sits transparently on your desktop or floats above applications. All settings sync live without restarting Electron.
          </p>
        </div>
      </div>

      {/* ── 1. DESKTOP STARTUP & RELIABILITY ── */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Power className="size-4 text-violet-400" />
          Windows Desktop Startup &amp; Behavior
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Launch on Startup */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-foreground">Start with Windows</span>
              <p className="text-[10px] text-muted-foreground">Automatically launch Chronos on system boot.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.launchOnStartup}
              onChange={(e) => handleChange({ launchOnStartup: e.target.checked })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>

          {/* Launch Minimized */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-foreground">Launch Minimized to Tray</span>
              <p className="text-[10px] text-muted-foreground">Start silently in system tray without opening window.</p>
            </div>
            <input
              type="checkbox"
              checked={settings.launchMinimized}
              onChange={(e) => handleChange({ launchMinimized: e.target.checked })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Preferred Startup Mode */}
        <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-foreground">Default Startup Presentation Mode</span>
            <p className="text-[11px] text-muted-foreground">Select whether Chronos launches as a Desktop Widget or Floating HUD.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleChange({ startupMode: "widget" })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                settings.startupMode === "widget"
                  ? "bg-violet-600 text-white border-violet-500 shadow-sm"
                  : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
              )}
            >
              Desktop Widget
            </button>
            <button
              type="button"
              onClick={() => handleChange({ startupMode: "hud" })}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border",
                settings.startupMode === "hud"
                  ? "bg-violet-600 text-white border-violet-500 shadow-sm"
                  : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
              )}
            >
              Floating HUD
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. PRESETS ── */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sparkles className="size-4 text-amber-400" />
          Widget Presets
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Instantly apply pre-configured layout setups for your workspace needs.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
          {(["minimal", "focus", "productivity", "custom"] as OverlayPresetOption[]).map((key) => {
            const preset = OVERLAY_PRESETS[key];
            const isActive = settings.overlayPreset === key;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handleApplyPreset(key)}
                className={cn(
                  "p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2",
                  isActive
                    ? "bg-violet-500/15 border-violet-500/50 shadow-xs ring-1 ring-violet-500/30"
                    : "bg-muted/20 border-border/40 hover:bg-muted/40"
                )}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{preset.name}</span>
                    {isActive && (
                      <span className="size-2 rounded-full bg-violet-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-violet-400 pt-1">
                  {isActive ? "Active Preset" : "Apply Preset"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. DESKTOP APPEARANCE PERSONALIZATION ── */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Sliders className="size-4 text-emerald-500" />
          Desktop Appearance Personalization
        </h3>

        {/* Glass Opacity & Blur */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Glass Surface Opacity</span>
              <span className="text-xs font-bold tabular-nums text-foreground">{settings.overlayOpacity}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={settings.overlayOpacity}
              onChange={(e) => handleChange({ overlayOpacity: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[10px] text-muted-foreground">Controls glass background transparency only. Content remains 100% crisp.</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Backdrop Blur Intensity</span>
              <span className="text-xs font-bold tabular-nums text-foreground">{settings.overlayBlur ?? 20}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={settings.overlayBlur ?? 20}
              onChange={(e) => handleChange({ overlayBlur: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <p className="text-[10px] text-muted-foreground">Glass frosted blur effect against wallpaper background.</p>
          </div>
        </div>

        {/* Border Style & Layout Density */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/40">
          <div>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <Shield className="size-3.5 text-blue-400" />
              Border Intensity
            </span>
            <div className="grid grid-cols-4 gap-1">
              {(["none", "subtle", "normal", "accent"] as OverlayBorderOption[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => handleChange({ overlayBorder: b })}
                  className={cn(
                    "py-1 text-[10px] font-bold rounded capitalize border cursor-pointer transition-colors text-center",
                    (settings.overlayBorder || "normal") === b
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <Layers className="size-3.5 text-violet-400" />
              Layout Density
            </span>
            <div className="grid grid-cols-3 gap-1">
              {(["minimal", "compact", "comfortable"] as OverlayDensityOption[]).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleChange({ overlayDensity: d })}
                  className={cn(
                    "py-1 text-[10px] font-bold rounded capitalize border cursor-pointer transition-colors text-center",
                    (settings.overlayDensity || "comfortable") === d
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timer Size, Weight & Glow */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Type className="size-3.5 text-amber-400" />
            Timer Typography &amp; Visual Glow
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Size */}
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Timer Size</span>
              <div className="grid grid-cols-3 gap-1">
                {(["normal", "large", "xlarge"] as OverlayTimerSizeOption[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleChange({ overlayTimerSize: s })}
                    className={cn(
                      "py-1 text-[10px] font-bold rounded capitalize border cursor-pointer text-center",
                      (settings.overlayTimerSize || "large") === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Timer Font Weight</span>
              <div className="grid grid-cols-3 gap-1">
                {(["bold", "extrabold", "black"] as OverlayTimerWeightOption[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => handleChange({ overlayTimerWeight: w })}
                    className={cn(
                      "py-1 text-[10px] font-bold rounded capitalize border cursor-pointer text-center",
                      (settings.overlayTimerWeight || "bold") === w
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Glow */}
            <div>
              <span className="text-[11px] text-muted-foreground block mb-1">Luminous Glow</span>
              <label className="flex items-center justify-between p-1.5 rounded-lg border border-border/40 bg-muted/20 cursor-pointer h-7">
                <span className="text-[11px] font-semibold text-foreground">Enable Glow</span>
                <input
                  type="checkbox"
                  checked={settings.overlayTimerGlow ?? true}
                  onChange={(e) => handleChange({ overlayTimerGlow: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-3.5 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. VISIBLE MODULES ── */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Eye className="size-4 text-blue-500" />
          Visible Overlay Modules
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Turn individual modules on or off. Disabling all optional modules collapses the widget into a pure lock-screen clock.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Show Timer */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <span className="text-xs font-semibold text-foreground">Focus Timer Clock</span>
            <input
              type="checkbox"
              checked={settings.overlayShowTimer}
              onChange={(e) => handleChange({ overlayShowTimer: e.target.checked, overlayPreset: "custom" })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>

          {/* Show Task */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <span className="text-xs font-semibold text-foreground">Active Focus Task</span>
            <input
              type="checkbox"
              checked={settings.overlayShowCurrentTask}
              onChange={(e) => handleChange({ overlayShowCurrentTask: e.target.checked, overlayPreset: "custom" })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>

          {/* Show Next Block */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <span className="text-xs font-semibold text-foreground">Next Scheduled TimeBlock</span>
            <input
              type="checkbox"
              checked={settings.overlayShowNextBlock}
              onChange={(e) => handleChange({ overlayShowNextBlock: e.target.checked, overlayPreset: "custom" })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>

          {/* Show Progress */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <span className="text-xs font-semibold text-foreground">Daily Focus Progress Bar</span>
            <input
              type="checkbox"
              checked={settings.overlayShowProgress}
              onChange={(e) => handleChange({ overlayShowProgress: e.target.checked, overlayPreset: "custom" })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>

          {/* Show Urgent Tasks */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <div className="flex items-center gap-1.5">
              <ListOrdered className="size-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-foreground">Top Priorities (Urgent Tasks)</span>
            </div>
            <input
              type="checkbox"
              checked={settings.overlayShowUrgentTasks}
              onChange={(e) => handleChange({ overlayShowUrgentTasks: e.target.checked, overlayPreset: "custom" })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>

          {/* Show Notifications */}
          <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
            <div className="flex items-center gap-1.5">
              <Bell className="size-3.5 text-violet-400" />
              <span className="text-xs font-semibold text-foreground">Notifications Alert Pill</span>
            </div>
            <input
              type="checkbox"
              checked={settings.overlayShowNotifications}
              onChange={(e) => handleChange({ overlayShowNotifications: e.target.checked, overlayPreset: "custom" })}
              className="rounded border-input text-primary focus:ring-primary size-4 cursor-pointer"
            />
          </label>
        </div>

        {/* Urgent Task Count Selector */}
        {settings.overlayShowUrgentTasks && (
          <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/40">
            <div>
              <span className="text-xs font-semibold text-foreground">Max Urgent Tasks to Display</span>
              <p className="text-[11px] text-muted-foreground">Select how many prioritized tasks appear on the widget.</p>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => handleChange({ overlayUrgentTaskCount: count })}
                  className={cn(
                    "size-8 rounded-lg text-xs font-bold transition-colors cursor-pointer border",
                    settings.overlayUrgentTaskCount === count
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 border-border/40 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── 5. SCREEN TIME — ARCHITECTURAL PLACEHOLDER ── */}
      <div className="p-4 rounded-xl border border-dashed border-border/60 bg-muted/10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-violet-400" />
            <span className="text-xs font-bold text-foreground">Screen Time &amp; Digital Habits</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/20">
            Coming Soon
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Application usage insights and digital habit analytics will be available in a future Chronos release.
        </p>
      </div>
    </div>
  );
}
