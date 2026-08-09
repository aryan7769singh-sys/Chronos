"use client";

import { Monitor, Eye, Sliders, Info } from "lucide-react";
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
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-bold text-foreground">Desktop Overlay Preparation</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Configure preferences for the upcoming Chronos desktop command &amp; heads-up display overlay.
        </p>
      </div>

      {/* Info banner */}
      <div className="p-3.5 rounded-xl border border-violet-500/30 bg-violet-500/5 flex items-start gap-2.5 text-xs text-muted-foreground">
        <Info className="size-4 text-violet-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-foreground">Milestone 14 Preparation</span>
          <p className="text-[11px] mt-0.5 leading-relaxed">
            These preferences control the future Chronos desktop command overlay widget. Settings defined here persist in your account and take effect when launching the desktop app overlay.
          </p>
        </div>
      </div>

      {/* Enable Overlay */}
      <div className="p-4 rounded-xl border border-border/60 bg-card/40 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Monitor className="size-5 text-violet-500 shrink-0" />
          <div>
            <span className="text-xs font-semibold text-foreground">Enable Desktop Overlay</span>
            <p className="text-[11px] text-muted-foreground">
              Allow floating command palette and active timer overlay on your desktop.
            </p>
          </div>
        </div>

        <button
          id="overlay-toggle-enabled"
          type="button"
          role="switch"
          aria-checked={settings.overlayEnabled}
          onClick={() => onChange({ overlayEnabled: !settings.overlayEnabled })}
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
              Display &amp; Opacity
            </h3>

            {/* Opacity slider */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-foreground">Overlay Background Opacity</span>
                <p className="text-[11px] text-muted-foreground">Transparency level for the floating HUD.</p>
              </div>
              <div className="flex items-center gap-3 w-44">
                <input
                  id="overlay-opacity-range"
                  type="range"
                  min="20"
                  max="100"
                  value={settings.overlayOpacity}
                  onChange={(e) =>
                    onChange({ overlayOpacity: parseInt(e.target.value, 10) })
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
                onClick={() => onChange({ overlayCompact: !settings.overlayCompact })}
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

          {/* Visible Elements */}
          <div className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Eye className="size-4 text-blue-500" />
              Visible Overlay Modules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Show Task */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Active Task Name</span>
                <input
                  type="checkbox"
                  checked={settings.overlayShowCurrentTask}
                  onChange={(e) => onChange({ overlayShowCurrentTask: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </label>

              {/* Show Timer */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Focus Timer Clock</span>
                <input
                  type="checkbox"
                  checked={settings.overlayShowTimer}
                  onChange={(e) => onChange({ overlayShowTimer: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </label>

              {/* Show Next Block */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Next Scheduled TimeBlock</span>
                <input
                  type="checkbox"
                  checked={settings.overlayShowNextBlock}
                  onChange={(e) => onChange({ overlayShowNextBlock: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </label>

              {/* Show Progress */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-border/40 bg-muted/20 cursor-pointer">
                <span className="text-xs font-semibold text-foreground">Daily Focus Progress Bar</span>
                <input
                  type="checkbox"
                  checked={settings.overlayShowProgress}
                  onChange={(e) => onChange({ overlayShowProgress: e.target.checked })}
                  className="rounded border-input text-primary focus:ring-primary size-4"
                />
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
