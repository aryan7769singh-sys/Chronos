"use client";

import { Monitor, Eye, Sliders, Info, ListOrdered, Bell, Clock, Layers, LayoutDashboard } from "lucide-react";
import type { OverlaySettings } from "../types";
import { cn } from "@/lib/utils";

interface OverlaySettingsSectionProps {
  settings: OverlaySettings;
  onChange: (patch: Partial<OverlaySettings>) => void;
}

export function OverlaySettingsSection({
  settings,
  onChange,
}: OverlaySettingsSectionProps) {
  // Broadcast settings change to live overlay HUD / Desktop Widget windows
  const handleChange = (patch: Partial<OverlaySettings>) => {
    onChange(patch);
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel("chronos-settings-broadcast");
        channel.postMessage({
          type: "SETTINGS_UPDATED",
          settings: { ...settings, ...patch },
        });
        channel.close();
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Desktop Experience &amp; Overlay System</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure the modular desktop experience, presentation modes, opacity, and visible productivity widgets.
        </p>
      </div>

      {/* Info banner */}
      <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-500/5 flex items-start gap-2.5 text-xs text-muted-foreground">
        <Info className="size-4 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Chronos Desktop Companion</span>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            The Desktop Widget and Floating HUD live directly on your Windows desktop as transparent productivity layers, while normal pages (Projects, Tasks, Settings) open separately in your web browser.
          </p>
        </div>
      </div>

      {/* Presentation Modes Explainer / Selector */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
          <Layers className="size-4 text-violet-500" />
          Presentation Modes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {/* Floating HUD */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-violet-500" />
              <span className="text-xs font-bold text-foreground">Floating HUD</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Always-on-top translucent command center that stays visible above active application windows.
            </p>
          </div>

          {/* Desktop Widget */}
          <div className="p-3 rounded-xl border border-violet-500/40 bg-violet-500/10 space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-bold text-foreground">Desktop Widget</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Wallpaper-integrated productivity layer that sits cleanly on the Windows desktop with low visual noise.
            </p>
          </div>

          {/* Web App */}
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1.5">
            <div className="flex items-center gap-2">
              <LayoutDashboard className="size-3.5 text-blue-400" />
              <span className="text-xs font-bold text-foreground">Web Application</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Full workspace in your browser for in-depth planning, analytics, task boards, and settings.
            </p>
          </div>
        </div>
      </div>

      {/* Enable Overlay */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Monitor className="size-5 text-violet-500 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-foreground">Enable Desktop Overlay &amp; Widget</span>
            <p className="text-[11px] text-muted-foreground">
              Allow floating command palette and wallpaper-integrated widget on your desktop.
            </p>
          </div>
        </div>

        <button
          id="overlay-toggle-enabled"
          type="button"
          role="switch"
          aria-checked={settings.overlayEnabled}
          onClick={() => handleChange({ overlayEnabled: !settings.overlayEnabled })}
          className={cn(
            "w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0",
            settings.overlayEnabled ? "bg-primary" : "bg-muted"
          )}
        >
          <span
            className={cn(
              "size-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5",
              settings.overlayEnabled && "translate-x-5"
            )}
          />
        </button>
      </div>

      {settings.overlayEnabled && (
        <>
          {/* Opacity & Compact */}
          <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Sliders className="size-4 text-emerald-500" />
              Display &amp; Glass Surface Opacity
            </h3>

            {/* Opacity slider */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Glass Background Opacity</span>
                <p className="text-[11px] text-muted-foreground">
                  Controls background transparency. The timer and text content remain 100% sharp and readable at any opacity.
                </p>
              </div>
              <div className="flex items-center gap-3 w-44">
                <input
                  id="overlay-opacity-range"
                  type="range"
                  min="20"
                  max="100"
                  value={settings.overlayOpacity}
                  onChange={(e) =>
                    handleChange({ overlayOpacity: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-xs font-bold tabular-nums text-foreground w-8 text-right">
                  {settings.overlayOpacity}%
                </span>
              </div>
            </div>

            {/* Compact mode toggle */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-border/40">
              <div>
                <span className="text-xs font-semibold text-foreground">Compact HUD Layout</span>
                <p className="text-[11px] text-muted-foreground">
                  Minimalist single-line widget bar instead of expanded card mode.
                </p>
              </div>
              <button
                id="overlay-toggle-compact"
                type="button"
                role="switch"
                aria-checked={settings.overlayCompact}
                onClick={() => handleChange({ overlayCompact: !settings.overlayCompact })}
                className={cn(
                  "w-10 h-5 rounded-full transition-colors relative focus:outline-none cursor-pointer shrink-0",
                  settings.overlayCompact ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "size-4 rounded-full bg-white transition-transform absolute top-0.5 left-0.5",
                    settings.overlayCompact && "translate-x-5"
                  )}
                />
              </button>
            </div>
          </div>

          {/* Visible Modules */}
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
                  onChange={(e) => handleChange({ overlayShowTimer: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </label>

              {/* Show Task */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Active Focus Task</span>
                <input
                  type="checkbox"
                  checked={settings.overlayShowCurrentTask}
                  onChange={(e) => handleChange({ overlayShowCurrentTask: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </label>

              {/* Show Next Block */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Next Scheduled TimeBlock</span>
                <input
                  type="checkbox"
                  checked={settings.overlayShowNextBlock}
                  onChange={(e) => handleChange({ overlayShowNextBlock: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </label>

              {/* Show Progress */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Daily Focus Progress Bar</span>
                <input
                  type="checkbox"
                  checked={settings.overlayShowProgress}
                  onChange={(e) => handleChange({ overlayShowProgress: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
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
                  onChange={(e) => handleChange({ overlayShowUrgentTasks: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
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
                  onChange={(e) => handleChange({ overlayShowNotifications: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
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

          {/* Screen Time - Coming Soon Architectural Placeholder */}
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
        </>
      )}
    </div>
  );
}
