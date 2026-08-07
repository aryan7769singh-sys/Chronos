"use client";

import { Flame } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/8 via-background to-background ring-1 ring-foreground/10">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {greeting} 👋
            </h1>
            <p className="text-sm text-muted-foreground">
              Here&apos;s what&apos;s on your plate today.
            </p>
          </div>

          {/* Streak badge */}
          <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-amber-600 dark:text-amber-400 ring-1 ring-amber-500/20 shrink-0">
            <Flame className="size-4" strokeWidth={2} />
            <span className="text-sm font-semibold">{MOCK_STREAK}-day streak</span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
          <span className="text-base shrink-0" aria-hidden>💡</span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Today&apos;s insight: </span>
            {MOCK_RECOMMENDATION}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
