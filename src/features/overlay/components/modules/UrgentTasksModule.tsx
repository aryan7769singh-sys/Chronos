"use client";

import { ListOrdered, AlertCircle, Play } from "lucide-react";
import type { OverlayUrgentTask } from "@/features/overlay/types";
import { useTimerStore } from "@/features/timer/store/useTimerStore";
import { openChronosRoute } from "../../utils/navigation";

interface UrgentTasksModuleProps {
  tasks: OverlayUrgentTask[];
  maxTasks?: number;
}

export function UrgentTasksModule({
  tasks,
  maxTasks = 3,
}: UrgentTasksModuleProps) {
  const visibleTasks = tasks.slice(0, maxTasks);

  const handleStartFocus = (task: OverlayUrgentTask) => {
    useTimerStore.getState().setActiveTask({
      id: task.id,
      projectId: task.projectId,
      title: task.title,
      projectName: task.projectName,
      projectColor: task.projectColor,
      projectIcon: "CheckSquare",
      priority: task.priority,
      estimatedDuration: 60,
      actualDuration: 0,
    });
    useTimerStore.getState().start();
  };

  if (visibleTasks.length === 0) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-sm text-center">
        <p className="text-[11px] text-slate-400 italic">
          No urgent tasks remaining. Great job!
        </p>
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm space-y-2 select-none text-slate-200">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1">
          <ListOrdered className="size-3 text-amber-400" />
          <span>TOP PRIORITIES</span>
        </span>
        <span className="text-[9px] font-mono text-slate-400">
          Top {visibleTasks.length}
        </span>
      </div>

      <div className="space-y-1.5 pt-0.5">
        {visibleTasks.map((task, idx) => {
          const numStr = String(idx + 1).padStart(2, "0");

          return (
            <div
              key={task.id}
              className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[10px] font-mono font-bold text-violet-300 bg-violet-500/20 px-1 py-0.2 rounded border border-violet-500/30 shrink-0">
                  {numStr}
                </span>
                <div className="min-w-0">
                  <h5 className="text-xs font-medium text-white truncate group-hover:text-violet-200 transition-colors">
                    {task.title}
                  </h5>
                  <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                    <span className="truncate max-w-[90px]">{task.projectName}</span>
                    <span>•</span>
                    {task.isOverdue ? (
                      <span className="text-rose-400 font-semibold flex items-center gap-0.5">
                        <AlertCircle className="size-2.5" />
                        <span>Overdue</span>
                      </span>
                    ) : task.isToday ? (
                      <span className="text-amber-400 font-semibold">Due today</span>
                    ) : task.isTomorrow ? (
                      <span className="text-blue-400 font-semibold">Due tomorrow</span>
                    ) : (
                      <span>Active</span>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center gap-1 shrink-0"
                style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
              >
                <button
                  type="button"
                  onClick={() => handleStartFocus(task)}
                  className="size-5 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-violet-500/30 transition-colors cursor-pointer"
                  title="Start Focus on Task"
                >
                  <Play className="size-2.5 fill-current" />
                </button>
                <button
                  type="button"
                  onClick={() => openChronosRoute(`/projects/${task.projectId}/${task.id}`)}
                  className="text-[10px] text-violet-300 hover:text-violet-200 hover:underline px-1 py-0.5 cursor-pointer"
                >
                  Open
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
