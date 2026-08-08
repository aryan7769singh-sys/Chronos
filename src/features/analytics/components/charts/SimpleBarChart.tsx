"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BarChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  tooltipText?: string;
}

interface SimpleBarChartProps {
  data: BarChartDataPoint[];
  height?: number;
  barColor?: string;
  secondaryBarColor?: string;
  valueFormatter?: (val: number) => string;
  emptyMessage?: string;
  className?: string;
}

export function SimpleBarChart({
  data,
  height = 200,
  barColor = "#8b5cf6", // violet-500
  secondaryBarColor = "#10b981", // emerald-500
  valueFormatter = (v) => `${v}`,
  emptyMessage = "No activity in this period",
  className,
}: SimpleBarChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          "flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-xl",
          className
        )}
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const maxValue = Math.max(
    1,
    ...data.map((d) => Math.max(d.value, d.secondaryValue || 0))
  );

  const hasSecondary = data.some((d) => (d.secondaryValue || 0) > 0);

  return (
    <div className={cn("relative w-full flex flex-col justify-end pt-6", className)}>
      {/* Chart Canvas */}
      <div className="flex items-end gap-1.5 sm:gap-2.5 w-full justify-between" style={{ height }}>
        {data.map((d, idx) => {
          const heightPercent = Math.max(4, Math.round((d.value / maxValue) * 100));
          const secondaryHeightPercent = d.secondaryValue
            ? Math.max(4, Math.round((d.secondaryValue / maxValue) * 100))
            : 0;

          const isHovered = hoveredIdx === idx;

          return (
            <div
              key={idx}
              className="group relative flex-1 flex flex-col items-center justify-end h-full cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Tooltip on Hover */}
              {isHovered && (
                <div className="absolute -top-10 z-20 px-2.5 py-1 rounded-md bg-popover border border-border/80 text-[11px] font-medium text-popover-foreground shadow-md whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                  <p className="font-semibold text-xs">{d.label}</p>
                  <p>
                    {valueFormatter(d.value)}
                    {hasSecondary && d.secondaryValue !== undefined && (
                      <span className="text-muted-foreground ml-1">
                        / {valueFormatter(d.secondaryValue)}
                      </span>
                    )}
                  </p>
                </div>
              )}

              {/* Bars Container */}
              <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                {/* Primary Bar */}
                <div
                  className="w-full max-w-[28px] rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: barColor,
                    opacity: d.value > 0 ? 0.85 : 0.15,
                  }}
                />

                {/* Optional Secondary Bar */}
                {hasSecondary && (
                  <div
                    className="w-full max-w-[28px] rounded-t-sm transition-all duration-300 group-hover:brightness-110"
                    style={{
                      height: `${secondaryHeightPercent}%`,
                      backgroundColor: secondaryBarColor,
                      opacity: (d.secondaryValue || 0) > 0 ? 0.85 : 0.15,
                    }}
                  />
                )}
              </div>

              {/* X-Axis Label */}
              <span
                className={cn(
                  "text-[10px] text-muted-foreground truncate w-full text-center transition-colors",
                  isHovered && "text-foreground font-semibold"
                )}
              >
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
