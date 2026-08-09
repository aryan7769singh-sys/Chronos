"use client";

import { CheckCircle2, Clock, SkipForward } from "lucide-react";
import type { PlanningSummary } from "../types";
import { cn } from "@/lib/utils";

interface PlanningSummaryProps {
  summary: PlanningSummary;
  className?: string;
}

function formatMins(m: number) {
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`;
}

export function PlanningSummaryStrip({ summary, className }: PlanningSummaryProps) {
  const { completionPercentage, completedMinutes, remainingMinutes, skippedMinutes, blocksRemaining, hasConflicts } = summary;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 px-4 py-3 rounded-xl border border-border/60 bg-card/40 backdrop-blur-xs shadow-xs text-xs",
        className
      )}
    >
      {/* Completion bar */}
      <div className="flex items-center gap-2 flex-1 min-w-48">
        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(completionPercentage, 100)}%` }}
          />
        </div>
        <span className="font-semibold text-foreground shrink-0 min-w-8 text-right">
          {completionPercentage}%
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="size-3.5 text-emerald-500" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{formatMins(completedMinutes)}</span> done
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Clock className="size-3.5 text-violet-500" />
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{formatMins(remainingMinutes)}</span> remaining
          </span>
        </div>

        {skippedMinutes > 0 && (
          <div className="flex items-center gap-1.5">
            <SkipForward className="size-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              <span className="font-semibold">{formatMins(skippedMinutes)}</span> skipped
            </span>
          </div>
        )}

        {blocksRemaining > 0 && (
          <span className="text-muted-foreground">
            <span className="font-semibold text-foreground">{blocksRemaining}</span>{" "}
            {blocksRemaining === 1 ? "block" : "blocks"} remaining
          </span>
        )}

        {hasConflicts && (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            ⚠ Conflicts
          </span>
        )}
      </div>
    </div>
  );
}
