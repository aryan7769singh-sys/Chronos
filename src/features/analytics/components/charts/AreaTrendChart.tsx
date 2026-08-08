"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";

export interface AreaDataPoint {
  label: string;
  value: number;
}

interface AreaTrendChartProps {
  data: AreaDataPoint[];
  height?: number;
  strokeColor?: string;
  valueFormatter?: (val: number) => string;
  emptyMessage?: string;
  className?: string;
}

export function AreaTrendChart({
  data,
  height = 180,
  strokeColor = "#8b5cf6",
  valueFormatter = (v) => `${v}`,
  emptyMessage = "No trend data available",
  className,
}: AreaTrendChartProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const { points, pathD, areaD } = useMemo(() => {
    if (!data || data.length === 0) {
      return { points: [], pathD: "", areaD: "" };
    }

    const max = Math.max(1, ...data.map((d) => d.value));
    const width = 600;
    const chartHeight = height - 30;

    const computedPoints = data.map((d, idx) => {
      const x = (idx / Math.max(1, data.length - 1)) * width;
      const y = chartHeight - (d.value / max) * chartHeight + 10;
      return { x, y, value: d.value, label: d.label };
    });

    if (computedPoints.length === 1) {
      const p = computedPoints[0];
      return {
        points: computedPoints,
        pathD: `M 0 ${p.y} L ${width} ${p.y}`,
        areaD: `M 0 ${p.y} L ${width} ${p.y} L ${width} ${height} L 0 ${height} Z`,
        maxValue: max,
      };
    }

    // Build smooth curve string
    let pD = `M ${computedPoints[0].x} ${computedPoints[0].y}`;
    for (let i = 0; i < computedPoints.length - 1; i++) {
      const p0 = computedPoints[i];
      const p1 = computedPoints[i + 1];
      const cx = (p0.x + p1.x) / 2;
      pD += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    const aD = `${pD} L ${width} ${height} L 0 ${height} Z`;

    return { points: computedPoints, pathD: pD, areaD: aD, maxValue: max };
  }, [data, height]);

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

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className={cn("relative w-full flex flex-col pt-4", className)}>
      {/* Tooltip */}
      {activePoint && (
        <div
          className="absolute -top-6 z-20 px-2 py-0.5 rounded bg-popover border border-border/80 text-[11px] font-medium text-popover-foreground shadow-md pointer-events-none -translate-x-1/2 transition-all duration-75"
          style={{ left: `${(activePoint.x / 600) * 100}%` }}
        >
          <span className="font-semibold">{activePoint.label}: </span>
          <span>{valueFormatter(activePoint.value)}</span>
        </div>
      )}

      {/* SVG Canvas */}
      <svg
        viewBox={`0 0 600 ${height}`}
        className="w-full overflow-visible"
        style={{ height }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line
          x1="0"
          y1={height - 20}
          x2="600"
          y2={height - 20}
          className="stroke-border/40"
          strokeDasharray="4 4"
        />
        <line
          x1="0"
          y1={(height - 20) / 2}
          x2="600"
          y2={(height - 20) / 2}
          className="stroke-border/20"
          strokeDasharray="4 4"
        />

        {/* Area fill */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Stroke line */}
        <path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Data points */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredIdx === idx ? 5 : 3}
            fill={strokeColor}
            className="transition-all duration-150 cursor-pointer"
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </svg>

      {/* X Axis Labels */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1.5 px-1">
        <span>{data[0]?.label}</span>
        {data.length > 2 && (
          <span>{data[Math.floor(data.length / 2)]?.label}</span>
        )}
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}
