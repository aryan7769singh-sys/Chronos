"use client";

import { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Plus,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";
import {
  PROJECT_COLOR_CLASSES,
  PROJECT_STATUS_LABEL,
  PROJECT_STATUS_CLASSES,
  PROJECT_HEALTH_LABEL,
  PROJECT_HEALTH_CLASSES,
  PROJECT_HEALTH_DOT,
  PRIORITY_LABEL,
  PRIORITY_BADGE_CLASSES,
  PROJECT_ICON_MAP,
  FALLBACK_ICON,
} from "../../constants/domain";
import { TaskList } from "../tasks/TaskList";
import { CreateTaskDialog } from "../tasks/CreateTaskDialog";
import type { Project, Task } from "../../types";
import type { NoteWithRelations } from "@/features/notes/types";
import { ProjectNotesSection } from "@/features/notes/components/ProjectNotesSection";

interface ProjectDetailsProps {
  project: Project;
  tasks: Task[];
  projectNotes?: NoteWithRelations[];
}

export function ProjectDetails({ project, tasks, projectNotes = [] }: ProjectDetailsProps) {
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const colors = PROJECT_COLOR_CLASSES[project.color];
  const Icon = PROJECT_ICON_MAP[project.icon] ?? FALLBACK_ICON;

  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length;

  const isOverdue =
    project.status !== "completed" &&
    project.status !== "cancelled" &&
    new Date(project.deadline) < new Date();

  return (
    <>
      <div className="space-y-6">
        {/* Breadcrumb Navigation */}
        <Breadcrumbs
          items={[
            { label: "Projects", href: "/projects" },
            { label: project.name },
          ]}
        />

        {/* Project header */}
        <div
          className={cn(
            "rounded-xl p-5 border-l-4 ring-1 ring-foreground/10",
            colors.border,
            colors.softBg
          )}
        >
          <div className="flex items-start gap-4 flex-wrap">
            {/* Icon */}
            <div
              className={cn(
                "flex size-12 shrink-0 items-center justify-center rounded-xl",
                colors.iconBg
              )}
            >
              <Icon className={cn("size-6", colors.iconText)} strokeWidth={1.75} />
            </div>

            {/* Title block */}
            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-semibold text-foreground">
                  {project.name}
                </h1>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                    PROJECT_STATUS_CLASSES[project.status]
                  )}
                >
                  {PROJECT_STATUS_LABEL[project.status]}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{completedTasks}</span>
                /{tasks.length} tasks done
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="font-medium text-foreground">{inProgressTasks}</span> in progress
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-muted-foreground" />
              <span
                className={isOverdue ? "text-destructive font-medium" : "text-muted-foreground"}
              >
                {isOverdue
                  ? "Overdue"
                  : `Due ${formatDistanceToNow(new Date(project.deadline), { addSuffix: true })}`}
              </span>
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
          {/* Left: Task list */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-semibold text-foreground">Tasks</h2>
              <Button
                id="new-task-btn"
                size="sm"
                variant="outline"
                className="gap-1.5"
                onClick={() => setIsCreateTaskOpen(true)}
              >
                <Plus className="size-3.5" />
                New Task
              </Button>
            </div>
            <TaskList tasks={tasks} projectId={project.id} />
            <ProjectNotesSection notes={projectNotes} projectId={project.id} />
          </div>

          {/* Right: Project metadata sidebar */}
          <div className="space-y-4 lg:sticky lg:top-20">
            <div className="rounded-xl border border-border bg-card p-4 space-y-4 text-sm">
              <h3 className="font-semibold text-foreground">Details</h3>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Progress</span>
                  <span className="font-medium text-foreground tabular-nums">
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
                  />
                </div>
              </div>

              {/* Meta items */}
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Health</dt>
                  <dd>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn("size-1.5 rounded-full", PROJECT_HEALTH_DOT[project.health])}
                      />
                      <span
                        className={cn(
                          "text-xs font-medium",
                          PROJECT_HEALTH_CLASSES[project.health].split(" ").find(c => c.startsWith("text-"))
                        )}
                      >
                        {PROJECT_HEALTH_LABEL[project.health]}
                      </span>
                    </div>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Priority</dt>
                  <dd>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium",
                        PRIORITY_BADGE_CLASSES[project.priority]
                      )}
                    >
                      {PRIORITY_LABEL[project.priority]}
                    </span>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Deadline</dt>
                  <dd className={cn("font-medium", isOverdue && "text-destructive")}>
                    {format(new Date(project.deadline), "MMM d, yyyy")}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Created</dt>
                  <dd className="text-muted-foreground">
                    {format(new Date(project.createdAt), "MMM d, yyyy")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <CreateTaskDialog
        open={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        projectId={project.id}
      />
    </>
  );
}
