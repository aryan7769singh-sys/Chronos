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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Focus Session</CardTitle>
          <div className="flex items-center justify-center size-8 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Timer className="size-4" strokeWidth={1.75} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Launch a structured focus block to enter deep work and track your productivity.
        </p>

        <div className="flex items-center justify-between gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/40">
          <div className="space-y-0.5">
            <span className="text-muted-foreground">Today&apos;s Focus</span>
            <p className="font-mono font-bold text-foreground text-sm">
              {focusTimeDisplay}
            </p>
          </div>

          <div className="text-right space-y-0.5">
            <span className="text-muted-foreground">Sessions</span>
            <p className="font-mono font-bold text-foreground text-sm flex items-center justify-end gap-1">
              <Flame className="size-3.5 text-violet-500" />
              <span>{completedSessions}</span>
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-1">
        <Link
          href="/focus"
          className={buttonVariants({
            size: "sm",
            className: "w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white cursor-pointer",
          })}
        >
          <Timer className="size-3.5" />
          Start Focus
        </Link>
      </CardFooter>
    </Card>
  );
}
