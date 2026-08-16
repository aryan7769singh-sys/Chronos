import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TaskWithProject } from "@/features/tasks/types";
import { PROJECT_COLOR_STYLES } from "@/features/tasks/constants/domain";

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

interface UpcomingDeadlinesProps {
  deadlines?: TaskWithProject[];
}

export function UpcomingDeadlines({ deadlines = [] }: UpcomingDeadlinesProps) {
  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">Upcoming Deadlines</CardTitle>
          <Link
            href="/calendar"
            className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Calendar
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {deadlines.length > 0 ? (
          <ul className="space-y-1.5" role="list">
            {deadlines.map((deadline) => {
              const urgency = getUrgencyLevel(deadline.deadline);
              const relativeTime = formatDistanceToNow(new Date(deadline.deadline), {
                addSuffix: true,
              });
              const colorStyles =
                PROJECT_COLOR_STYLES[deadline.project.color] ||
                PROJECT_COLOR_STYLES.violet;

              return (
                <li
                  key={deadline.id}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/40 border border-transparent hover:border-border/40"
                >
                  {/* Urgency dot */}
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      URGENCY_DOT[urgency]
                    )}
                    aria-hidden="true"
                  />

                  {/* Title Link */}
                  <Link
                    href={`/projects/${deadline.projectId}/${deadline.id}`}
                    className="flex-1 text-xs leading-snug text-foreground hover:text-primary transition-colors truncate"
                  >
                    {deadline.title}
                  </Link>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Project badge */}
                    <span
                      className={cn(
                        "rounded-md px-1.5 py-0.5 text-[10px] font-medium border",
                        colorStyles.badge
                      )}
                    >
                      {deadline.project.name}
                    </span>

                    {/* Relative time */}
                    <span
                      className={cn(
                        "text-[11px] tabular-nums",
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
        ) : (
          <div className="py-6 text-center">
            <p className="text-xs text-muted-foreground">
              No upcoming task deadlines.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
