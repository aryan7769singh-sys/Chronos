import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOCK_DEADLINES } from "../constants/mockData";

function getUrgencyLevel(dueDate: string): "critical" | "soon" | "normal" {
  const hoursUntil =
    (new Date(dueDate).getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil <= 24) return "critical";
  if (hoursUntil <= 48) return "soon";
  return "normal";
}

const URGENCY_DOT: Record<string, string> = {
  critical: "bg-destructive",
  soon: "bg-amber-500",
  normal: "bg-muted-foreground/30",
};

const CATEGORY_COLORS: Record<string, string> = {
  Work: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Learning: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  Dev: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Finance: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

export function UpcomingDeadlines() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Deadlines</CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2" role="list">
          {MOCK_DEADLINES.map((deadline) => {
            const urgency = getUrgencyLevel(deadline.dueDate);
            const relativeTime = formatDistanceToNow(new Date(deadline.dueDate), {
              addSuffix: true,
            });
            const categoryColor =
              CATEGORY_COLORS[deadline.category] ??
              "bg-muted text-muted-foreground";

            return (
              <li
                key={deadline.id}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/50"
              >
                {/* Urgency dot */}
                <span
                  className={cn(
                    "size-1.5 shrink-0 rounded-full",
                    URGENCY_DOT[urgency]
                  )}
                  aria-hidden
                />

                {/* Title */}
                <span className="flex-1 text-sm leading-snug text-foreground">
                  {deadline.title}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Category badge */}
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                      categoryColor
                    )}
                  >
                    {deadline.category}
                  </span>

                  {/* Relative time */}
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      urgency === "critical"
                        ? "text-destructive font-medium"
                        : "text-muted-foreground"
                    )}
                  >
                    {relativeTime}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
