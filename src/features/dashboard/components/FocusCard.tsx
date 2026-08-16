import Link from "next/link";
import { Timer, Flame } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { FocusSummary } from "@/features/timer/types";

function formatFocusTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

interface FocusCardProps {
  summary?: FocusSummary | null;
}

export function FocusCard({ summary }: FocusCardProps) {
  const todayMinutes = summary?.todayFocusMinutes ?? 0;
  const focusTimeDisplay = formatFocusTime(todayMinutes);
  const completedSessions = summary?.todayCompletedSessions ?? 0;

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Focus Session</CardTitle>
          <div className="flex items-center justify-center size-7 rounded-lg bg-primary/10 text-primary">
            <Timer className="size-4" strokeWidth={1.75} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Launch a structured focus block to enter deep work and track your productivity.
        </p>

        <div className="flex items-center justify-between gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/40">
          <div className="space-y-0.5">
            <span className="text-muted-foreground text-[11px]">Today&apos;s Focus</span>
            <p className="font-mono font-bold text-foreground text-sm">
              {focusTimeDisplay}
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-muted-foreground text-[11px]">Sessions</span>
            <p className="font-mono font-bold text-foreground text-sm flex items-center justify-end gap-1">
              <Flame className="size-3.5 text-amber-500" />
              <span>{completedSessions}</span>
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-1">
        <Link
          href="/focus"
          className={cn(
            buttonVariants({ size: "sm" }),
            "w-full gap-2 text-xs font-semibold shadow-xs"
          )}
        >
          <Timer className="size-3.5" />
          <span>Start Focus</span>
        </Link>
      </CardFooter>
    </Card>
  );
}
