"use client";

import { useTransition } from "react";
import { format, differenceInMinutes, parseISO } from "date-fns";
import {
  CheckCircle2,
  SkipForward,
  Play,
  Timer,
  FolderKanban,
  ListTodo,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { TimeBlockWithRelations } from "../types";
import {
  completeTimeBlockAction,
  skipTimeBlockAction,
} from "../actions";
import {
  TIME_BLOCK_STATUS_LABELS,
  TIME_BLOCK_STATUS_COLORS,
  TIME_BLOCK_STATUS_DOT,
} from "../constants";
import { EVENT_COLOR_STYLES } from "@/features/calendar/constants/calendar";
import { cn } from "@/lib/utils";

interface TodaysPlanProps {
  blocks: TimeBlockWithRelations[];
}

function BlockItem({ block }: { block: TimeBlockWithRelations }) {
  const [isPending, startTransition] = useTransition();

  const start = parseISO(block.startTime);
  const end = parseISO(block.endTime);
  const duration = differenceInMinutes(end, start);
  const colorStyle =
    EVENT_COLOR_STYLES[block.color as keyof typeof EVENT_COLOR_STYLES] ??
    EVENT_COLOR_STYLES.violet;
  const isActionable =
    block.status === "planned" || block.status === "in_progress";

  const handleComplete = () =>
    startTransition(async () => {
      await completeTimeBlockAction(block.id);
    });

  const handleSkip = () =>
    startTransition(async () => {
      await skipTimeBlockAction(block.id);
    });

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-xl border border-border/50 bg-card/40 hover:bg-card/70 transition-colors",
        block.status === "completed" && "opacity-70",
        block.status === "skipped" || block.status === "cancelled"
          ? "opacity-50 grayscale"
          : ""
      )}
    >
      {/* Color bar */}
      <div
        className={cn(
          "mt-0.5 w-1 h-full min-h-8 rounded-full shrink-0",
          colorStyle.indicator
        )}
      />

      <div className="flex-1 min-w-0">
        {/* Time */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-foreground tabular-nums">
            {format(start, "h:mm a")}
          </span>
          <span className="text-[10px] text-muted-foreground">–</span>
          <span className="text-[10px] text-muted-foreground">
            {format(end, "h:mm a")}
          </span>
          <span
            className={cn(
              "size-1.5 rounded-full ml-auto shrink-0",
              TIME_BLOCK_STATUS_DOT[block.status]
            )}
          />
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-foreground leading-tight truncate mb-0.5">
          {block.title}
        </p>

        {/* Project / Task */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground mb-2">
          {block.project && (
            <span className="flex items-center gap-1">
              <FolderKanban className="size-3" />
              {block.project.name}
            </span>
          )}
          {block.task && (
            <span className="flex items-center gap-1">
              <ListTodo className="size-3" />
              <span className="truncate max-w-32">{block.task.title}</span>
            </span>
          )}
          <span className="flex items-center gap-1 ml-auto">
            <Timer className="size-3" />
            {duration}m
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {block.task && isActionable && (
            <Link href={`/focus?taskId=${block.task.id}&blockId=${block.id}`}>
              <Button
                id={`plan-focus-${block.id}`}
                size="xs"
                className="gap-1 text-[11px]"
              >
                <Play className="size-2.5 fill-current" />
                Focus
              </Button>
            </Link>
          )}
          {isActionable && (
            <>
              <Button
                id={`plan-complete-${block.id}`}
                size="xs"
                variant="outline"
                onClick={handleComplete}
                disabled={isPending}
                className="gap-1 text-[11px] text-emerald-600 border-emerald-500/30"
              >
                <CheckCircle2 className="size-2.5" />
                Done
              </Button>
              <Button
                id={`plan-skip-${block.id}`}
                size="xs"
                variant="ghost"
                onClick={handleSkip}
                disabled={isPending}
                className="gap-1 text-[11px] text-muted-foreground"
              >
                <SkipForward className="size-2.5" />
                Skip
              </Button>
            </>
          )}
          {block.status !== "planned" && block.status !== "in_progress" && (
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-medium ml-auto",
                TIME_BLOCK_STATUS_COLORS[block.status]
              )}
            >
              {TIME_BLOCK_STATUS_LABELS[block.status]}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function TodaysPlanList({ blocks }: TodaysPlanProps) {
  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center gap-2 border border-dashed border-border/60 rounded-xl bg-card/20">
        <CalendarClock className="size-6 text-muted-foreground/40" />
        <p className="text-xs text-muted-foreground">
          No time blocks planned for today.
        </p>
        <Link
          href="/calendar"
          className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Open Calendar to plan →
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {blocks.map((b) => (
        <BlockItem key={b.id} block={b} />
      ))}
    </div>
  );
}
