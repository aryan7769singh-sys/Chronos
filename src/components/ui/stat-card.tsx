import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type StatCardTone =
  | "default"
  | "primary"
  | "amber"
  | "emerald"
  | "destructive"
  | "cyan"
  | "violet"
  | "blue";

export interface StatCardTrend {
  value: number | string;
  direction?: "up" | "down" | "neutral";
  label?: string;
}

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Metric title */
  title: string;
  /** Primary metric value (e.g. 12, "85%", "2h 45m") */
  value: React.ReactNode;
  /** Optional icon component */
  icon?: LucideIcon;
  /** Color tone for the icon container and accents */
  tone?: StatCardTone;
  /** Secondary subtitle or comparison caption */
  subtitle?: React.ReactNode;
  /** Optional trend pill metadata */
  trend?: StatCardTrend;
  /** Optional progress percentage (0 - 100) */
  progress?: number;
}

const TONE_STYLES: Record<StatCardTone, { bg: string; text: string }> = {
  default: { bg: "bg-muted text-muted-foreground", text: "text-foreground" },
  primary: { bg: "bg-primary/10", text: "text-primary" },
  amber: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400" },
  emerald: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400" },
  destructive: { bg: "bg-destructive/10", text: "text-destructive" },
  cyan: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400" },
  violet: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400" },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  subtitle,
  trend,
  progress,
  className,
  ...props
}: StatCardProps) {
  const toneStyle = TONE_STYLES[tone] || TONE_STYLES.primary;

  return (
    <Card
      className={cn(
        "border-border/60 bg-card/60 backdrop-blur-xs shadow-xs hover:border-border/80 transition-colors",
        className
      )}
      {...props}
    >
      <CardContent className="p-4 space-y-3">
        {/* Top Header: Title + Icon */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-muted-foreground truncate">
            {title}
          </span>
          {Icon && (
            <div
              className={cn(
                "size-8 rounded-lg flex items-center justify-center shrink-0",
                toneStyle.bg,
                toneStyle.text
              )}
              aria-hidden="true"
            >
              <Icon className="size-4" />
            </div>
          )}
        </div>

        {/* Primary Value */}
        <div className="space-y-1">
          <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </div>

          {/* Trend / Subtitle row */}
          {(trend || subtitle) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              {trend && (
                <div
                  className={cn(
                    "inline-flex items-center gap-0.5 font-semibold px-1.5 py-0.5 rounded text-[10px]",
                    trend.direction === "up" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    trend.direction === "down" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    (!trend.direction || trend.direction === "neutral") && "bg-muted text-muted-foreground"
                  )}
                >
                  {trend.direction === "up" && <TrendingUp className="size-3" />}
                  {trend.direction === "down" && <TrendingDown className="size-3" />}
                  {(!trend.direction || trend.direction === "neutral") && <Minus className="size-3" />}
                  <span>{trend.value}</span>
                </div>
              )}

              {subtitle && (
                <span className="text-[11px] text-muted-foreground truncate">
                  {subtitle}
                </span>
              )}
            </div>
          )}

          {/* Optional Progress Bar */}
          {typeof progress === "number" && (
            <div className="pt-1.5">
              <Progress value={Math.max(0, Math.min(100, progress))} className="h-1.5">
                <ProgressLabel className="sr-only">{title} progress</ProgressLabel>
                <ProgressValue className="sr-only">{progress}%</ProgressValue>
              </Progress>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
