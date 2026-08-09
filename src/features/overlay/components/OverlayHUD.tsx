"use client";

import { useState, useEffect } from "react";
import type { OverlayHUDData } from "../types";
import { updateOverlayPreferencesAction } from "../actions";
import { OverlayHeader } from "./OverlayHeader";
import { OverlayFocusModule } from "./OverlayFocusModule";
import { OverlayTaskModule } from "./OverlayTaskModule";
import { OverlayTimeBlockModule } from "./OverlayTimeBlockModule";
import { OverlayProgressModule } from "./OverlayProgressModule";
import { OverlayQuickActions } from "./OverlayQuickActions";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import type { FocusTaskInfo } from "@/features/timer/types";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import { cn } from "@/lib/utils";

import type { ProjectColor, Priority } from "@/features/tasks/types";

interface OverlayHUDProps {
  data: OverlayHUDData;
}

export function OverlayHUD({ data }: OverlayHUDProps) {
  const [hudData] = useState<OverlayHUDData>(data);
  const { userSettings, activeFocusTask, currentBlock, nextBlock, focusSummary, completedTasksCountToday } = hudData;
  const { overlay } = userSettings;

  const [compact, setCompact] = useState(overlay.overlayCompact);
  const [opacity, setOpacity] = useState(overlay.overlayOpacity);

  // Electron IPC global shortcut listener
  useEffect(() => {
    if (typeof window !== "undefined" && (window as unknown as { chronosDesktop?: { onShortcutAction: (cb: (act: string) => void) => void } }).chronosDesktop) {
      (window as unknown as { chronosDesktop: { onShortcutAction: (cb: (act: string) => void) => void } }).chronosDesktop.onShortcutAction((action: string) => {
        if (action === "toggle-timer") {
          const { status, start, pause } = useTimerStore.getState();
          if (status === "running") pause();
          else start();
        } else if (action === "reset-timer") {
          useTimerStore.getState().reset();
        }
      });
    }
  }, []);

  const handleToggleCompact = async () => {
    const nextCompact = !compact;
    setCompact(nextCompact);
    try {
      await updateOverlayPreferencesAction({ overlayCompact: nextCompact });
    } catch {
      // ignore
    }
  };

  const handleOpacityChange = async (newOpacity: number) => {
    setOpacity(newOpacity);
    try {
      await updateOverlayPreferencesAction({ overlayOpacity: newOpacity });
    } catch {
      // ignore
    }
  };

  const handleStartTaskFocus = (task: FocusTaskInfo) => {
    useTimerStore.getState().setActiveTask(task);
    useTimerStore.getState().start();
  };

  const handleStartBlockFocus = (block: TimeBlockWithRelations) => {
    if (block.task) {
      useTimerStore.getState().setActiveTask({
        id: block.task.id,
        projectId: block.projectId || "",
        title: block.task.title,
        projectName: block.project?.name || "Project",
        projectColor: (block.project?.color as ProjectColor) || "violet",
        projectIcon: block.project?.icon || "Layers",
        priority: (block.task.priority as Priority) || "medium",
        estimatedDuration: 60,
        actualDuration: 0,
      });
    }
    useTimerStore.getState().start();
  };


  const opacityDecimal = opacity / 100;

  return (
    <div
      id="chronos-command-hud"
      style={{ opacity: opacityDecimal }}
      className={cn(
        "w-full max-w-md mx-auto p-4 rounded-2xl border border-border/80 shadow-2xl backdrop-blur-xl transition-all duration-300 space-y-4",
        "bg-card/70 text-card-foreground",
        compact && "max-w-xs p-3 space-y-2.5"
      )}
    >
      {/* Header with status & opacity controls */}
      <OverlayHeader
        compact={compact}
        opacity={opacity}
        onToggleCompact={handleToggleCompact}
        onOpacityChange={handleOpacityChange}
      />

      {/* Focus Timer Module */}
      {overlay.overlayShowTimer && (
        <OverlayFocusModule initialTask={activeFocusTask} />
      )}

      {!compact && (
        <>
          {/* Active Task Module */}
          {overlay.overlayShowCurrentTask && (
            <OverlayTaskModule
              task={activeFocusTask}
              onStartFocus={handleStartTaskFocus}
            />
          )}

          {/* Time Block Module */}
          {overlay.overlayShowNextBlock && (
            <OverlayTimeBlockModule
              currentBlock={currentBlock}
              nextBlock={nextBlock}
              onStartFocusFromBlock={handleStartBlockFocus}
            />
          )}

          {/* Progress Module */}
          {overlay.overlayShowProgress && (
            <OverlayProgressModule
              summary={focusSummary}
              completedTasksCountToday={completedTasksCountToday}
            />
          )}

          {/* Quick Navigation Actions */}
          <OverlayQuickActions />
        </>
      )}
    </div>
  );
}
