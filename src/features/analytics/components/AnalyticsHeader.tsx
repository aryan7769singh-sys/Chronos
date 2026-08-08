"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, BarChart3 } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { AnalyticsTimeRange, AnalyticsDateInterval } from "../types";
import { cn } from "@/lib/utils";

interface AnalyticsHeaderProps {
  timeRange: AnalyticsTimeRange;
  interval: AnalyticsDateInterval;
}

const RANGES: { id: AnalyticsTimeRange; label: string }[] = [
  { id: "7d", label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "90d", label: "90 Days" },
  { id: "all", label: "All Time" },
];

export function AnalyticsHeader({ timeRange, interval }: AnalyticsHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleRangeChange = (newRange: AnalyticsTimeRange) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (newRange === "30d") {
        params.delete("range");
      } else {
        params.set("range", newRange);
      }
      const query = params.toString();
      router.push(query ? `/analytics?${query}` : "/analytics");
    });
  };

  const formattedStart = format(parseISO(interval.startDate), "MMM d, yyyy");
  const formattedEnd = format(parseISO(interval.endDate), "MMM d, yyyy");

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-border/40">
      <div>
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <BarChart3 className="size-4" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Productivity Analytics
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
          <Calendar className="size-3.5" />
          <span>
            {formattedStart} &ndash; {formattedEnd} ({interval.daysInRange} days)
          </span>
        </p>
      </div>

      {/* Segmented Range Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/60 border border-border/60 shrink-0 self-start sm:self-auto">
        {RANGES.map((r) => {
          const isActive = timeRange === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRangeChange(r.id)}
              disabled={isPending}
              className={cn(
                "px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-background text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
                isPending && "opacity-60 cursor-wait"
              )}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
