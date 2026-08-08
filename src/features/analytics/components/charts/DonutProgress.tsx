"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutProgressProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  centerLabel?: string;
  centerValue?: string;
  className?: string;
}

export function DonutProgress({
  segments,
  size = 140,
  strokeWidth = 14,
  centerLabel,
  centerValue,
  className,
}: DonutProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = useMemo(
    () => segments.reduce((sum, s) => sum + s.value, 0),
    [segments]
  );

  let accumulatedPercent = 0;

  return (
    <div
      className={cn(
        "relative flex items-center justify-center select-none shrink-0",
        className
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 transform"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className="stroke-muted/40"
          strokeWidth={strokeWidth}
        />

        {/* Segments */}
        {total > 0 &&
          segments.map((seg, idx) => {
            const percent = seg.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -(accumulatedPercent * circumference);
            accumulatedPercent += percent;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="butt"
                className="transition-all duration-500 ease-out hover:opacity-85 cursor-pointer"
              />
            );
          })}
      </svg>

      {/* Center Label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          {centerValue && (
            <span className="text-base font-bold font-mono text-foreground leading-none">
              {centerValue}
            </span>
          )}
          {centerLabel && (
            <span className="text-[10px] text-muted-foreground font-medium mt-0.5">
              {centerLabel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
