"use client";

import { format } from "date-fns";
import { CalendarClock, Play } from "lucide-react";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import type { Priority, ProjectColor } from "@/features/tasks/types";

interface NextTimeBlockModuleProps {
  currentBlock: TimeBlockWithRelations | null;
  nextBlock: TimeBlockWithRelations | null;
}

export function NextTimeBlockModule({
  currentBlock,
  nextBlock,
}: NextTimeBlockModuleProps) {
  const activeBlock = currentBlock || nextBlock;

  const handleStartFocus = () => {
    if (!activeBlock) return;
    if (activeBlock.task) {
      useTimerStore.getState().setActiveTask({
        id: activeBlock.task.id,
        projectId: activeBlock.projectId || "",
        title: activeBlock.task.title,
        projectName: activeBlock.project?.name || "Project",
        projectColor: (activeBlock.project?.color as ProjectColor) || "violet",
        projectIcon: activeBlock.project?.icon || "Layers",
        priority: (activeBlock.task.priority as Priority) || "medium",
        estimatedDuration: 60,
        actualDuration: 0,
      });
    }
    useTimerStore.getState().start();
  };

  if (!activeBlock) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-sm text-center">
        <p className="text-[11px] text-slate-400 italic">
          No upcoming TimeBlocks scheduled for today.
        </p>
      </div>
    );
  }

  const isCurrent = !!currentBlock;
  const startTimeStr = format(new Date(activeBlock.startTime), "h:mm a");
  const endTimeStr = format(new Date(activeBlock.endTime), "h:mm a");

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm space-y-1 select-none text-slate-200">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1">
          <CalendarClock className="size-3 text-blue-400" />
          <span>{isCurrent ? "ACTIVE TIMEBLOCK" : "NEXT TIMEBLOCK"}</span>
        </span>
        <span className="font-mono text-[10px] text-white font-semibold">
          {startTimeStr} — {endTimeStr}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-white truncate">
            {activeBlock.title}
          </h4>
          {activeBlock.project && (
            <span className="text-[9px] text-slate-400 truncate block">
              {activeBlock.project.name}
            </span>
          )}
        </div>

        <div
          className="flex items-center shrink-0"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <button
            type="button"
            onClick={handleStartFocus}
            className="h-6 px-2 text-[10px] font-semibold rounded bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-500/30 flex items-center gap-1 transition-colors cursor-pointer"
            title="Start Focus from TimeBlock"
          >
            <Play className="size-2.5 fill-current" />
            <span>Focus</span>
          </button>
        </div>
      </div>
    </div>
  );
}
