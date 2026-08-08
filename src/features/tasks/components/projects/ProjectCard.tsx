import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  PROJECT_COLOR_CLASSES,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_CLASSES,
  PROJECT_HEALTH_LABEL,
  PROJECT_HEALTH_CLASSES,
  PROJECT_HEALTH_DOT,
  PRIORITY_LABEL,
  PRIORITY_DOT_CLASSES,
  PROJECT_ICON_MAP,
  FALLBACK_ICON,
} from "../../constants/domain";
import type { Project } from "../../types";

interface ProjectCardProps {
  project: Project;
  taskCount: number;
  completedTaskCount: number;
}

export function ProjectCard({
  project,
  taskCount,
  completedTaskCount,
}: ProjectCardProps) {
  const colors = PROJECT_COLOR_CLASSES[project.color];
  const Icon = PROJECT_ICON_MAP[project.icon] ?? FALLBACK_ICON;

  const isOverdue =
    project.status !== "completed" &&
    project.status !== "cancelled" &&
    new Date(project.deadline) < new Date();

  return (
    <Link
      href={`/projects/${project.id}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-xl"
    >
      <Card
        className={cn(
          "h-full border-l-4 transition-all duration-200",
          "group-hover:-translate-y-0.5 group-hover:shadow-md",
          colors.border
        )}
      >
        <CardHeader className="pb-3">
          {/* Top row: Icon badge + Name + Status */}
          <div className="flex items-start gap-3">
            {/* Colored icon badge */}
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                colors.iconBg
              )}
            >
              <Icon
                className={cn("size-5", colors.iconText)}
                strokeWidth={1.75}
              />
            </div>

            {/* Name + badges */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <h3 className="font-semibold leading-snug text-foreground truncate pr-1">
                {project.name}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Status badge */}
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                    PROJECT_STATUS_CLASSES[project.status]
                  )}
                >
                  {PROJECT_STATUS_LABEL[project.status]}
                </span>

                {/* Priority dot */}
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      PRIORITY_DOT_CLASSES[project.priority]
                    )}
                    aria-hidden
                  />
                  <span className="text-[0.65rem] text-muted-foreground">
                    {PRIORITY_LABEL[project.priority]}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Description */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {project.description}
          </p>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {completedTaskCount}/{taskCount} tasks
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {project.progress}%
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  project.progress === 100 ? "bg-emerald-500" : colors.iconText.replace("text-", "bg-")
                )}
                style={{ width: `${project.progress}%` }}
                role="progressbar"
                aria-valuenow={project.progress}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>

          {/* Footer row: health + deadline */}
          <div className="flex items-center justify-between gap-2">
            {/* Health badge */}
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  PROJECT_HEALTH_DOT[project.health]
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "text-[0.65rem] font-medium",
                  PROJECT_HEALTH_CLASSES[project.health].split(" ").find(c => c.startsWith("text-")) ?? "text-muted-foreground"
                )}
              >
                {PROJECT_HEALTH_LABEL[project.health]}
              </span>
            </div>

            {/* Deadline */}
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue ? "text-destructive" : "text-muted-foreground"
              )}
            >
              <CalendarDays className="size-3 shrink-0" />
              <span className="tabular-nums">
                {isOverdue
                  ? "Overdue"
                  : formatDistanceToNow(new Date(project.deadline), {
                      addSuffix: true,
                    })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
