"use client";

import Link from "next/link";
import { CalendarClock, ArrowRight, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TimeBlockWithRelations } from "@/features/planning/types";
import { TodaysPlanList } from "@/features/planning/components/TodaysPlan";

interface TodaysPlanWidgetProps {
  blocks: TimeBlockWithRelations[];
}

export function TodaysPlanWidget({ blocks }: TodaysPlanWidgetProps) {
  const remainingCount = blocks.filter(
    (b) => b.status === "planned" || b.status === "in_progress"
  ).length;

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <CalendarClock className="size-4 text-primary" />
          <span>Today&apos;s Plan</span>
          {remainingCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded-full bg-primary/10 text-[0.65rem] font-semibold text-primary tabular-nums border border-primary/20">
              {remainingCount}
            </span>
          )}
        </CardTitle>
        <Link
          href="/calendar"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          )}
        >
          <span>View Calendar</span>
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 border border-dashed border-border/60 rounded-lg bg-card/30">
            <p className="text-xs text-muted-foreground">
              No time blocks planned for today.
            </p>
            <Link
              href="/calendar"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 text-xs gap-1"
              )}
            >
              <Plus className="size-3" />
              <span>Plan Your Day</span>
            </Link>
          </div>
        ) : (
          <TodaysPlanList blocks={blocks} />
        )}
      </CardContent>
    </Card>
  );
}
