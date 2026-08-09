"use client";

import { format } from "date-fns";
import { CalendarClock, Play } from "lucide-react";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import { TIME_BLOCK_STATUS_LABELS } from "@/features/planning/constants";
import { cn } from "@/lib/utils";

interface OverlayTimeBlockModuleProps {
  currentBlock: TimeBlockWithRelations | null;
  nextBlock: TimeBlockWithRelations | null;
  onStartFocusFromBlock?: (block: TimeBlockWithRelations) => void;
}

function formatBlockTime(isoStr: string): string {
  try {
    return format(new Date(isoStr), "h:mm a");
  } catch {
    return "";
  }
}

export function OverlayTimeBlockModule({
  currentBlock,
  nextBlock,
  onStartFocusFromBlock,
}: OverlayTimeBlockModuleProps) {
  const activeBlock = currentBlock || nextBlock;
  const isNow = !!currentBlock;

  if (!activeBlock) {
    return (
      <div className="p-3.5 rounded-xl border border-dashed border-border/60 bg-card/20 text-center space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <CalendarClock className="size-3.5" />
          <span>No Scheduled TimeBlocks</span>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Schedule time blocks on the Calendar to see them here.
        </p>
      </div>
    );
  }

  const startTimeStr = formatBlockTime(activeBlock.startTime);
  const endTimeStr = formatBlockTime(activeBlock.endTime);

  return (
    <div className="p-3.5 rounded-xl border border-border/50 bg-card/50 backdrop-blur-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border",
            isNow
              ? "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30"
              : "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
          )}
        >
          {isNow ? "CURRENT TIME BLOCK" : "NEXT SCHEDULED BLOCK"}
        </span>

        <span className="text-[11px] font-mono font-semibold text-foreground tabular-nums">
          {startTimeStr} – {endTimeStr}
        </span>
      </div>

      <div>
        <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">
          {activeBlock.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
          {activeBlock.project && <span>{activeBlock.project.name}</span>}
          {activeBlock.task && (
            <>
              {activeBlock.project && <span>•</span>}
              <span className="truncate">Task: {activeBlock.task.title}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border/40 gap-2">
        <span className="text-[10px] text-muted-foreground capitalize font-medium">
          Status: {TIME_BLOCK_STATUS_LABELS[activeBlock.status]}
        </span>

        {onStartFocusFromBlock && (
          <button
            id={`hud-block-focus-btn-${activeBlock.id}`}
            type="button"
            onClick={() => onStartFocusFromBlock(activeBlock)}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 hover:bg-violet-500/20 transition-colors cursor-pointer"
          >
            <Play className="size-3 fill-current" />
            <span>Focus Block</span>
          </button>
        )}
      </div>
    </div>
  );
}
