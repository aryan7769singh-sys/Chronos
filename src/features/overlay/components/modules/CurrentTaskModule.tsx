"use client";

import { CheckSquare, ExternalLink } from "lucide-react";
import type { FocusTaskInfo } from "@/features/timer/types";
import { openChronosRoute } from "../../utils/navigation";

interface CurrentTaskModuleProps {
  task: FocusTaskInfo | null;
}

export function CurrentTaskModule({ task }: CurrentTaskModuleProps) {
  if (!task) {
    return (
      <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 backdrop-blur-sm text-center">
        <p className="text-[11px] text-slate-400 italic">
          No active task selected for deep work.
        </p>
      </div>
    );
  }

  return (
    <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/10 backdrop-blur-sm space-y-1 select-none text-slate-200">
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1">
          <CheckSquare className="size-3 text-emerald-400" />
          <span>CURRENT FOCUS TASK</span>
        </span>
        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 truncate max-w-[120px]">
          {task.projectName}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2 pt-0.5">
        <h4 className="text-xs font-semibold text-white truncate">
          {task.title}
        </h4>
        <button
          type="button"
          onClick={() => openChronosRoute(`/projects/${task.projectId}/${task.id}`)}
          className="text-[10px] font-medium text-violet-300 hover:text-violet-200 hover:underline shrink-0 inline-flex items-center gap-0.5 cursor-pointer"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        >
          <span>Open</span>
          <ExternalLink className="size-2.5" />
        </button>
      </div>
    </div>
  );
}
