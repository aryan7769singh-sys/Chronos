import Link from "next/link";
import { CalendarDays, Clock, Tag, FileText, ArrowRight, Play } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";
import {
  TASK_STATUS_LABEL,
  TASK_STATUS_CLASSES,
  PRIORITY_LABEL,
  PRIORITY_BADGE_CLASSES,
  PROJECT_COLOR_CLASSES,
  PROJECT_ICON_MAP,
  FALLBACK_ICON,
} from "../../constants/domain";
import { SubtaskChecklist } from "./SubtaskChecklist";
import { ScheduleTaskButton } from "./ScheduleTaskButton";
import type { Task, Project, Subtask } from "../../types";
import type { NoteWithRelations } from "@/features/notes/types";
import { TaskNotesSection } from "@/features/notes/components/TaskNotesSection";

interface TaskDetailsProps {
  task: Task;
  project: Project;
  subtasks: Subtask[];
  taskNotes?: NoteWithRelations[];
  allProjects?: Project[];
  allTasks?: Task[];
}

function formatDuration(minutes: number): string {
  if (minutes === 0) return "—";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function TaskDetails({ task, project, subtasks, taskNotes = [], allProjects = [], allTasks = [] }: TaskDetailsProps) {
  const colors = PROJECT_COLOR_CLASSES[project.color];
  const ProjectIcon = PROJECT_ICON_MAP[project.icon] ?? FALLBACK_ICON;

  const isOverdue =
    task.status !== "done" &&
    task.status !== "cancelled" &&
    new Date(task.deadline) < new Date();

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        items={[
          { label: "Projects", href: "/projects" },
          { label: project.name, href: `/projects/${project.id}` },
          { label: task.title },
        ]}
      />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
        {/* ── Left: Task content ── */}
        <div className="space-y-6">
          {/* Title + badges */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 flex-wrap">
              <h1
                className={cn(
                  "text-xl font-semibold leading-snug text-foreground flex-1",
                  task.status === "done" && "line-through text-muted-foreground",
                  task.status === "cancelled" && "line-through opacity-60"
                )}
              >
                {task.title}
              </h1>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {task.status !== "done" && task.status !== "cancelled" && (
                  <>
                    <ScheduleTaskButton
                      task={task}
                      allProjects={allProjects}
                      allTasks={allTasks}
                    />
                    <Link
                      href={`/focus?taskId=${task.id}`}
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      )}
                    >
                      <Play className="size-3 fill-current" />
                      Focus
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  TASK_STATUS_CLASSES[task.status]
                )}
              >
                {TASK_STATUS_LABEL[task.status]}
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                  PRIORITY_BADGE_CLASSES[task.priority]
                )}
              >
                {PRIORITY_LABEL[task.priority]}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-foreground">Description</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {task.description}
              </p>
            </div>
          )}

          {/* Current step */}
          {task.currentStep && task.status !== "done" && (
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-foreground">Current Step</h2>
              <div className="flex items-start gap-2.5 rounded-lg bg-muted/60 px-3 py-2.5">
                <ArrowRight className="size-4 shrink-0 mt-0.5 text-primary" />
                <p className="text-sm text-foreground leading-snug">
                  {task.currentStep}
                </p>
              </div>
            </div>
          )}

          {/* Subtask checklist */}
          <div className="rounded-xl border border-border bg-card p-4">
            <SubtaskChecklist
              subtasks={subtasks}
              projectId={project.id}
              taskId={task.id}
            />
            <TaskNotesSection notes={taskNotes} taskId={task.id} />
          </div>

          {/* Notes */}
          {task.notes && (
            <div className="space-y-1.5">
              <h2 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <FileText className="size-4" />
                Notes
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {task.notes}
              </p>
            </div>
          )}
        </div>

        {/* ── Right: Metadata sidebar ── */}
        <div className="space-y-4 lg:sticky lg:top-20">
          <div className="rounded-xl border border-border bg-card p-4 text-sm space-y-4">
            <h3 className="font-semibold text-foreground">Details</h3>

            <dl className="space-y-3">
              {/* Project */}
              <div className="flex justify-between items-center gap-2">
                <dt className="text-muted-foreground shrink-0">Project</dt>
                <dd className="min-w-0">
                  <Link
                    href={`/projects/${project.id}`}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition-colors hover:bg-muted max-w-full",
                      colors.iconText
                    )}
                  >
                    <ProjectIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
                    <span className="text-xs font-medium truncate">{project.name}</span>
                  </Link>
                </dd>
              </div>

              {/* Deadline */}
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <CalendarDays className="size-3.5" />
                  Deadline
                </dt>
                <dd
                  className={cn(
                    "font-medium text-right",
                    isOverdue && "text-destructive"
                  )}
                >
                  {format(new Date(task.deadline), "MMM d, yyyy")}
                  <span className="block text-[0.65rem] font-normal text-muted-foreground">
                    {isOverdue
                      ? "overdue"
                      : formatDistanceToNow(new Date(task.deadline), {
                          addSuffix: true,
                        })}
                  </span>
                </dd>
              </div>

              {/* Estimated duration */}
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <Clock className="size-3.5" />
                  Estimated
                </dt>
                <dd className="font-medium tabular-nums">
                  {formatDuration(task.estimatedDuration)}
                </dd>
              </div>

              {/* Actual duration */}
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground flex items-center gap-1.5 shrink-0">
                  <Clock className="size-3.5" />
                  Actual
                </dt>
                <dd
                  className={cn(
                    "font-medium tabular-nums",
                    task.actualDuration > task.estimatedDuration &&
                      task.estimatedDuration > 0 &&
                      "text-amber-600 dark:text-amber-400"
                  )}
                >
                  {formatDuration(task.actualDuration)}
                </dd>
              </div>

              {/* Tags */}
              {task.tags.length > 0 && (
                <div className="space-y-1.5">
                  <dt className="text-muted-foreground flex items-center gap-1.5">
                    <Tag className="size-3.5" />
                    Tags
                  </dt>
                  <dd className="flex flex-wrap gap-1 pt-0.5">
                    {task.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[0.65rem] font-medium text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </dd>
                </div>
              )}

              {/* Created */}
              <div className="flex justify-between items-center">
                <dt className="text-muted-foreground shrink-0">Created</dt>
                <dd className="text-muted-foreground text-right">
                  {format(new Date(task.createdAt), "MMM d, yyyy")}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
