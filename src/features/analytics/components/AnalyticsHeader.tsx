"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, parseISO } from "date-fns";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import type { AnalyticsTimeRange, AnalyticsDateInterval } from "../types";

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
    <PageHeader
      title="Productivity Analytics"
      description={`${formattedStart} – ${formattedEnd} (${interval.daysInRange} days)`}
      action={
        <SegmentedTabs
          size="sm"
          value={timeRange}
          onValueChange={(val) => handleRangeChange(val as AnalyticsTimeRange)}
          options={RANGES.map((r) => ({
            id: r.id,
            label: r.label,
            disabled: isPending,
          }))}
          aria-label="Analytics time range"
        />
      }
    />
  );
}
