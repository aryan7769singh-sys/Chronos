import Link from "next/link";
import { Timer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MOCK_FOCUS_MINUTES_TODAY } from "../constants/mockData";

function formatFocusTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function FocusCard() {
  const focusTimeDisplay = formatFocusTime(MOCK_FOCUS_MINUTES_TODAY);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Focus Session</CardTitle>
          <div className="flex items-center justify-center size-8 rounded-lg bg-muted">
            <Timer className="size-4 text-muted-foreground" strokeWidth={1.75} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Start a 25-minute Pomodoro session to enter a deep work state.
        </p>

        <div className="flex items-center gap-1.5 text-sm">
          <span className="text-muted-foreground">Today so far:</span>
          <span className="font-semibold tabular-nums text-foreground">
            {focusTimeDisplay}
          </span>
        </div>
      </CardContent>

      <CardFooter>
        <Link
          href="/focus"
          className={buttonVariants({ size: "sm", className: "w-full gap-2" })}
        >
          <Timer className="size-3.5" />
          Start Focus
        </Link>
      </CardFooter>
    </Card>
  );
}
