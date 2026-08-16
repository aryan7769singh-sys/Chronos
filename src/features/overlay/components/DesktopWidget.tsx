"use client";

import { useEffect, useState, useRef, useSyncExternalStore } from "react";
import { format } from "date-fns";
import { Sparkles, Minus, X, Layers } from "lucide-react";
import type { OverlayHUDData } from "../types";
import type { OverlaySettings } from "@/features/settings/types";
import { TimerModule } from "./modules/TimerModule";
import { CurrentTaskModule } from "./modules/CurrentTaskModule";
import { UrgentTasksModule } from "./modules/UrgentTasksModule";
import { NextTimeBlockModule } from "./modules/NextTimeBlockModule";
import { DailyProgressModule } from "./modules/DailyProgressModule";
import { NotificationsModule } from "./modules/NotificationsModule";
import { cn } from "@/lib/utils";

interface DesktopWidgetProps {
  data: OverlayHUDData;
  onSwitchToHud: () => void;
  opacity: number;
}

function subscribeDesktop() {
  return () => {};
}

function getDesktopSnapshot() {
  return (
    typeof window !== "undefined" &&
    !!(window as unknown as { chronosDesktop?: { isDesktop?: boolean } })
      .chronosDesktop?.isDesktop
  );
}

function getServerDesktopSnapshot() {
  return false;
}

export function DesktopWidget({ data, onSwitchToHud, opacity }: DesktopWidgetProps) {
  const [timeStr, setTimeStr] = useState<string>("");
  const [settings, setSettings] = useState<OverlaySettings>(data.userSettings.overlay);
  const widgetRef = useRef<HTMLDivElement>(null);

  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    getDesktopSnapshot,
    getServerDesktopSnapshot
  );

  const {
    activeFocusTask,
    currentBlock,
    nextBlock,
    urgentTasks,
    focusSummary,
    completedTasksCountToday,
    unreadNotificationsCount,
  } = data;

  useEffect(() => {
    const update = () => setTimeStr(format(new Date(), "h:mm a"));
    update();
    const interval = setInterval(update, 10000);
    return () => clearInterval(interval);
  }, []);

  // Real-time Settings Live-Sync Listener via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const channel = new BroadcastChannel("chronos-settings-broadcast");
      channel.onmessage = (event) => {
        if (event.data?.type === "SETTINGS_UPDATED" && event.data?.settings) {
          setSettings(event.data.settings);
        }
      };
      return () => channel.close();
    } catch {
      // ignore
    }
  }, []);

  // Auto-resize Electron window to fit widget content without large empty space
  useEffect(() => {
    if (!isDesktop || !widgetRef.current) return;

    const measureAndResize = () => {
      if (!widgetRef.current) return;
      const rect = widgetRef.current.getBoundingClientRect();
      const contentHeight = Math.ceil(rect.height) + 16; // Add margin
      const contentWidth = Math.ceil(rect.width) + 16;

      const win = typeof window !== "undefined"
        ? (window as unknown as { chronosDesktop?: { setContentSize?: (w: number, h: number) => void } })
        : {};

      if (win.chronosDesktop?.setContentSize) {
        win.chronosDesktop.setContentSize(contentWidth, contentHeight);
      }
    };

    measureAndResize();
    const ro = new ResizeObserver(measureAndResize);
    ro.observe(widgetRef.current);
    return () => ro.disconnect();
  }, [isDesktop, settings]);

  const handleMinimize = () => {
    const win =
      typeof window !== "undefined"
        ? (window as unknown as { chronosDesktop?: { minimizeWindow?: () => void } })
        : {};
    if (win.chronosDesktop?.minimizeWindow) {
      win.chronosDesktop.minimizeWindow();
    }
  };

  const handleClose = () => {
    const win =
      typeof window !== "undefined"
        ? (window as unknown as { chronosDesktop?: { closeWindow?: () => void } })
        : {};
    if (win.chronosDesktop?.closeWindow) {
      win.chronosDesktop.closeWindow();
    }
  };

  const hasOptionalModules =
    settings.overlayShowCurrentTask ||
    settings.overlayShowUrgentTasks ||
    settings.overlayShowNextBlock ||
    settings.overlayShowProgress ||
    settings.overlayShowNotifications;

  // Separate surface opacity from content visibility:
  // The glass background scales its alpha, while timer & text content remain 100% visible!
  const surfaceAlpha = Math.max(0.12, Math.min(0.95, (opacity / 100) * 0.85));
  const borderAlpha = Math.max(0.08, Math.min(0.4, (opacity / 100) * 0.3));

  return (
    <div className="w-full flex flex-col items-center justify-start p-1 bg-transparent select-none">
      <div
        ref={widgetRef}
        id="chronos-desktop-widget"
        style={{
          backgroundColor: `rgba(2, 6, 23, ${surfaceAlpha})`,
          borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
        }}
        className={cn(
          "w-full rounded-2xl border backdrop-blur-2xl shadow-2xl p-3.5 space-y-2.5 text-card-foreground transition-all duration-300 ring-1 ring-white/5",
          hasOptionalModules ? "max-w-[340px]" : "max-w-[280px]"
        )}
      >
        {/* ── Dedicated Draggable Drag Handle & Title Region ── */}
        <div
          className="flex items-center justify-between gap-2 pb-1 cursor-move"
          style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
        >
          <div className="flex items-center gap-1.5 min-w-0 pointer-events-none">
            <div className="size-4 rounded bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Sparkles className="size-2.5 fill-current" />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-slate-400 font-mono uppercase">
              CHRONOS
            </span>
          </div>

          <div
            className="flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
            style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          >
            {timeStr && (
              <span className="text-[9px] font-mono font-medium text-slate-400 mr-1 select-none">
                {timeStr}
              </span>
            )}

            {/* Mode Switcher */}
            <button
              type="button"
              onClick={onSwitchToHud}
              className="size-5 rounded text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
              title="Switch to Floating HUD"
            >
              <Layers className="size-2.5" />
            </button>

            {/* Window controls (Electron only) */}
            {isDesktop && (
              <>
                <button
                  type="button"
                  onClick={handleMinimize}
                  className="size-5 rounded text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
                  title="Minimize Widget"
                >
                  <Minus className="size-2.5" />
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="size-5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
                  title="Hide to Tray"
                >
                  <X className="size-2.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* ── 1. TIMER MODULE (Dominant Visual Element — 100% Crisp at Low Opacity) ── */}
        {settings.overlayShowTimer !== false && (
          <TimerModule compact={settings.overlayCompact} />
        )}

        {/* ── 2. ACTIVE FOCUS TASK MODULE ── */}
        {settings.overlayShowCurrentTask && !settings.overlayCompact && (
          <CurrentTaskModule task={activeFocusTask} />
        )}

        {/* ── 3. TOP PRIORITIES / URGENT TASKS MODULE ── */}
        {settings.overlayShowUrgentTasks && !settings.overlayCompact && (
          <UrgentTasksModule
            tasks={urgentTasks}
            maxTasks={settings.overlayUrgentTaskCount || 3}
          />
        )}

        {/* ── 4. NEXT SCHEDULED TIMEBLOCK MODULE ── */}
        {settings.overlayShowNextBlock && !settings.overlayCompact && (
          <NextTimeBlockModule
            currentBlock={currentBlock}
            nextBlock={nextBlock}
          />
        )}

        {/* ── 5. DAILY FOCUS PROGRESS MODULE ── */}
        {settings.overlayShowProgress && !settings.overlayCompact && (
          <DailyProgressModule
            summary={focusSummary}
            completedTasksCountToday={completedTasksCountToday}
          />
        )}

        {/* ── 6. NOTIFICATIONS ALERT MODULE ── */}
        {settings.overlayShowNotifications && !settings.overlayCompact && (
          <NotificationsModule unreadCount={unreadNotificationsCount} />
        )}
      </div>
    </div>
  );
}
