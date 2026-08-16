"use client";

import { Flame, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_STREAK, MOCK_RECOMMENDATION } from "../constants/mockData";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function WelcomeHero() {
  const greeting = getGreeting();

  return (
    <Card className="relative overflow-hidden border border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardContent className="p-4 sm:p-5 space-y-3.5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              {greeting} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Here&apos;s an overview of your productivity operating system today.
            </p>
          </div>

          {/* Streak badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Flame className="size-4" strokeWidth={2} />
            <span className="text-xs sm:text-sm font-semibold">{MOCK_STREAK}-day streak</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-muted/40 p-3 border border-border/40 text-xs">
          <Sparkles className="size-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Today&apos;s insight: </span>
            {MOCK_RECOMMENDATION}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
