"use client";

import Link from "next/link";
import { Play, ArrowRight, Target } from "lucide-react";
import type { FocusTaskInfo } from "@/features/timer/types";
import {
  PRIORITY_LABEL,
  PRIORITY_BADGE_CLASSES,
} from "@/features/tasks/constants/domain";
import { cn } from "@/lib/utils";

interface OverlayTaskModuleProps {
  task: FocusTaskInfo | null;
  onStartFocus?: (task: FocusTaskInfo) => void;
}

export function OverlayTaskModule({ task, onStartFocus }: OverlayTaskModuleProps) {
  if (!task) {
    return (
      <div className="p-3.5 rounded-xl border border-dashed border-border/60 bg-card/20 text-center space-y-1.5">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Target className="size-3.5" />
          <span>No Active Task</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          All tasks complete or none scheduled.
        </p>
      </div>
    );
  }

  return (
    <div className="p-3.5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
          RECOMMENDED TASK
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
            PRIORITY_BADGE_CLASSES[task.priority]
          )}
        >
          {PRIORITY_LABEL[task.priority]}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-2">
          {task.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          <span>{task.projectName}</span>
          {task.currentStep && (
            <>
              <span>•</span>
              <span className="truncate italic font-medium text-foreground/80">
                Next: {task.currentStep}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
        <Link
          href={`/projects/${task.projectId}/${task.id}`}
          className="text-[11px] font-semibold text-violet-500 hover:text-violet-400 flex items-center gap-1"
        >
          <span>View Task Details</span>
          <ArrowRight className="size-3" />
        </Link>

        {onStartFocus && (
          <button
            id={`hud-start-task-focus-${task.id}`}
            type="button"
            onClick={() => onStartFocus(task)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer"
          >
            <Play className="size-3 fill-current" />
            <span>Focus This Task</span>
          </button>
        )}
      </div>
    </div>
  );
}
