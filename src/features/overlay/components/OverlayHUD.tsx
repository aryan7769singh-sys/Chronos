"use client";

import { useState, useEffect } from "react";
import type { OverlayHUDData } from "../types";
import type { OverlaySettings } from "@/features/settings/types";
import { updateOverlayPreferencesAction } from "../actions";
import { OverlayHeader } from "./OverlayHeader";
import { TimerModule } from "./modules/TimerModule";
import { CurrentTaskModule } from "./modules/CurrentTaskModule";
import { UrgentTasksModule } from "./modules/UrgentTasksModule";
import { NextTimeBlockModule } from "./modules/NextTimeBlockModule";
import { DailyProgressModule } from "./modules/DailyProgressModule";
import { NotificationsModule } from "./modules/NotificationsModule";
import { OverlayQuickActions } from "./OverlayQuickActions";
import { DesktopWidget } from "./DesktopWidget";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import { cn } from "@/lib/utils";

interface OverlayHUDProps {
  data: OverlayHUDData;
}

export function OverlayHUD({ data }: OverlayHUDProps) {
  const [hudData] = useState<OverlayHUDData>(data);
  const [settings, setSettings] = useState<OverlaySettings>(data.userSettings.overlay);
  const [desktopMode, setDesktopMode] = useState<"hud" | "widget">("hud");
  const [opacity, setOpacity] = useState(settings.overlayOpacity);

  const {
    activeFocusTask,
    currentBlock,
    nextBlock,
    urgentTasks,
    focusSummary,
    completedTasksCountToday,
    unreadNotificationsCount,
  } = hudData;

  // Electron IPC global shortcut & mode change listeners
  useEffect(() => {
    const win = typeof window !== "undefined" ? (window as unknown as {
      chronosDesktop?: {
        onShortcutAction: (cb: (act: string) => void) => void;
        onDesktopModeChange: (cb: (mode: string) => void) => void;
        setDesktopMode: (mode: string) => void;
      };
    }) : {};

    if (win.chronosDesktop) {
      win.chronosDesktop.onShortcutAction((action: string) => {
        if (action === "toggle-timer") {
          const { status, start, pause } = useTimerStore.getState();
          if (status === "running") pause();
          else start();
        } else if (action === "reset-timer") {
          useTimerStore.getState().reset();
        }
      });

      win.chronosDesktop.onDesktopModeChange((mode: string) => {
        setDesktopMode(mode === "widget" ? "widget" : "hud");
      });
    }
  }, []);

  // Real-time Settings Live-Sync Listener via BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;
    try {
      const channel = new BroadcastChannel("chronos-settings-broadcast");
      channel.onmessage = (event) => {
        if (event.data?.type === "SETTINGS_UPDATED" && event.data?.settings) {
          setSettings(event.data.settings);
          if (event.data.settings.overlayOpacity !== undefined) {
            setOpacity(event.data.settings.overlayOpacity);
          }
        }
      };
      return () => channel.close();
    } catch {
      // ignore
    }
  }, []);

  const handleSwitchMode = (mode: "hud" | "widget") => {
    setDesktopMode(mode);
    const win = typeof window !== "undefined" ? (window as unknown as { chronosDesktop?: { setDesktopMode?: (m: string) => void } }) : {};
    if (win.chronosDesktop?.setDesktopMode) {
      win.chronosDesktop.setDesktopMode(mode);
    }
  };

  const handleToggleCompact = async () => {
    const nextCompact = !settings.overlayCompact;
    setSettings((prev) => ({ ...prev, overlayCompact: nextCompact }));
    try {
      await updateOverlayPreferencesAction({ overlayCompact: nextCompact });
    } catch {
      // ignore
    }
  };

  const handleOpacityChange = async (newOpacity: number) => {
    setOpacity(newOpacity);
    setSettings((prev) => ({ ...prev, overlayOpacity: newOpacity }));
    try {
      await updateOverlayPreferencesAction({ overlayOpacity: newOpacity });
    } catch {
      // ignore
    }
  };

  if (desktopMode === "widget") {
    return (
      <DesktopWidget
        data={hudData}
        onSwitchToHud={() => handleSwitchMode("hud")}
        opacity={opacity}
      />
    );
  }

  const surfaceAlpha = Math.max(0.2, Math.min(0.95, (opacity / 100) * 0.85));
  const borderAlpha = Math.max(0.1, Math.min(0.4, (opacity / 100) * 0.35));

  return (
    <div
      id="chronos-command-hud"
      style={{
        backgroundColor: `rgba(2, 6, 23, ${surfaceAlpha})`,
        borderColor: `rgba(255, 255, 255, ${borderAlpha})`,
      }}
      className={cn(
        "w-full max-w-md mx-auto p-4 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 space-y-3.5 ring-1 ring-white/5",
        "text-card-foreground",
        settings.overlayCompact && "max-w-xs p-3 space-y-2.5"
      )}
    >

      {/* Header with status, opacity, drag handle & window controls */}
      <OverlayHeader
        compact={settings.overlayCompact}
        opacity={opacity}
        onToggleCompact={handleToggleCompact}
        onOpacityChange={handleOpacityChange}
        onSwitchToWidget={() => handleSwitchMode("widget")}
      />

      {/* 1. Focus Timer Module */}
      {settings.overlayShowTimer !== false && (
        <TimerModule compact={settings.overlayCompact} />
      )}

      {!settings.overlayCompact && (
        <>
          {/* 2. Active Focus Task Module */}
          {settings.overlayShowCurrentTask && (
            <CurrentTaskModule task={activeFocusTask} />
          )}

          {/* 3. Top Priorities / Urgent Tasks Module */}
          {settings.overlayShowUrgentTasks && (
            <UrgentTasksModule
              tasks={urgentTasks}
              maxTasks={settings.overlayUrgentTaskCount || 3}
            />
          )}

          {/* 4. Scheduled TimeBlock Module */}
          {settings.overlayShowNextBlock && (
            <NextTimeBlockModule
              currentBlock={currentBlock}
              nextBlock={nextBlock}
            />
          )}

          {/* 5. Daily Progress Module */}
          {settings.overlayShowProgress && (
            <DailyProgressModule
              summary={focusSummary}
              completedTasksCountToday={completedTasksCountToday}
            />
          )}

          {/* 6. Notifications Module */}
          {settings.overlayShowNotifications && (
            <NotificationsModule unreadCount={unreadNotificationsCount} />
          )}

          {/* Quick Navigation Actions */}
          <OverlayQuickActions />
        </>
      )}
    </div>
  );
}
