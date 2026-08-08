"use client";

import Link from "next/link";
import { FolderKanban, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { PROJECT_COLOR_STYLES, ProjectIcon } from "@/features/tasks/constants/domain";
import type { ProjectTimeAllocation } from "../types";
import { cn } from "@/lib/utils";

interface ProjectAllocationSectionProps {
  projects: ProjectTimeAllocation[];
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function ProjectAllocationSection({ projects }: ProjectAllocationSectionProps) {
  if (!projects || projects.length === 0) {
    return (
      <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FolderKanban className="size-4 text-muted-foreground" />
            <span>Project Time &amp; Velocity</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-xs text-muted-foreground">
          No projects created yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FolderKanban className="size-4 text-violet-500" />
          <span>Project Time Investment</span>
        </CardTitle>
        <span className="text-xs text-muted-foreground">
          {projects.length} Active Project{projects.length > 1 ? "s" : ""}
        </span>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => {
            const colorStyles =
              PROJECT_COLOR_STYLES[p.projectColor] || PROJECT_COLOR_STYLES.violet;
            const progress =
              p.taskCount > 0
                ? Math.min(100, Math.round((p.completedTaskCount / p.taskCount) * 100))
                : 0;

            return (
              <div
                key={p.projectId}
                className="p-3.5 rounded-xl border border-border/50 bg-card/40 space-y-3 hover:border-border transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "size-7 rounded-md flex items-center justify-center shrink-0 border",
                          colorStyles.badge
                        )}
                      >
                        <ProjectIcon iconName={p.projectIcon} className="size-3.5" />
                      </span>
                      <p className="font-semibold text-xs text-foreground truncate">
                        {p.projectName}
                      </p>
                    </div>

                    {p.health && (
                      <span
                        className={cn(
                          "text-[9px] font-semibold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0",
                          p.health === "on_track" && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                          p.health === "at_risk" && "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                          p.health === "off_track" && "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {p.health.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {/* Time and tasks counts */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3" />
                      <span>{formatMinutes(p.focusMinutes)} invested</span>
                    </div>
                    <span>
                      {p.completedTaskCount}/{p.taskCount} tasks
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <Progress value={progress} className="h-1.5">
                      <ProgressLabel className="sr-only">{p.projectName} progress</ProgressLabel>
                      <ProgressValue className="sr-only">{progress}%</ProgressValue>
                    </Progress>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-end">
                  <Link
                    href={`/projects/${p.projectId}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>View Project</span>
                    <ArrowRight className="size-2.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
