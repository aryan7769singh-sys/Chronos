"use client";

import {
  Sparkles,
  Sun,
  TrendingUp,
  Clock,
  CheckCircle2,
  Flame,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductivityInsight } from "../types";
import { cn } from "@/lib/utils";

interface ProductivityInsightsCardProps {
  insights: ProductivityInsight[];
  hasSufficientData: boolean;
}

const INSIGHT_ICONS = {
  Sparkles,
  Sun,
  TrendingUp,
  Clock,
  CheckCircle2,
  Flame,
  Info,
};

export function ProductivityInsightsCard({
  insights,
  hasSufficientData,
}: ProductivityInsightsCardProps) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-violet-500" />
            <span>Productivity Intelligence &amp; Insights</span>
          </CardTitle>
          <span
            className={cn(
              "text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border",
              hasSufficientData
                ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30"
                : "bg-muted text-muted-foreground border-border/50"
            )}
          >
            {hasSufficientData ? "Live Analysis" : "Calibrating"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {insights.map((ins) => {
            const Icon = (INSIGHT_ICONS as Record<string, typeof Sparkles>)[ins.icon] || Sparkles;

            return (
              <div
                key={ins.id}
                className={cn(
                  "p-3.5 rounded-xl border flex items-start gap-3 transition-colors",
                  ins.impact === "positive" && "bg-emerald-500/5 border-emerald-500/20",
                  ins.impact === "warning" && "bg-amber-500/5 border-amber-500/20",
                  ins.impact === "neutral" && "bg-muted/30 border-border/50"
                )}
              >
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    ins.impact === "positive" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                    ins.impact === "warning" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                    ins.impact === "neutral" && "bg-muted text-muted-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-xs text-foreground">{ins.title}</p>
                    {ins.metric && (
                      <span className="font-mono text-[10px] font-bold text-foreground px-1.5 py-0.2 rounded bg-background/80 border border-border/40 shrink-0">
                        {ins.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {ins.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
