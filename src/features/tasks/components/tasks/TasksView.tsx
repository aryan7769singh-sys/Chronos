"use client";

import { useState, useMemo } from "react";
import { Plus, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { TaskStatsHeader } from "./TaskStatsHeader";
import { TaskFilterBar } from "./TaskFilterBar";
import { GlobalTaskCard } from "./GlobalTaskCard";
import { GlobalTaskBoard } from "./GlobalTaskBoard";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { PROJECT_COLOR_STYLES, getProjectIcon } from "../../constants/domain";
import type {
  TaskWithProject,
  Project,
  TaskStats,
  TaskFilterState,
} from "../../types";
import { isToday, isPast, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface TasksViewProps {
  tasks: TaskWithProject[];
  projects: Project[];
  stats: TaskStats;
}

export function TasksView({ tasks, projects, stats }: TasksViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [filters, setFilters] = useState<TaskFilterState>({
    search: "",
    status: "all",
    priority: "all",
    projectId: "all",
    dueFilter: "all",
    viewMode: "list",
  });

  const handleFilterChange = (updates: Partial<TaskFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      status: "all",
      priority: "all",
      projectId: "all",
      dueFilter: "all",
      viewMode: "list",
    });
  };

  // Filter tasks client-side
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Search
      if (filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description.toLowerCase().includes(q);
        const matchesStep = task.currentStep.toLowerCase().includes(q);
        const matchesProject = task.project.name.toLowerCase().includes(q);
        const matchesTag = task.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesStep && !matchesProject && !matchesTag) {
          return false;
        }
      }

      // 2. Status
      if (filters.status !== "all") {
        if (task.status !== filters.status) {
          // Special mapping: backlog falls under todo
          if (filters.status === "todo" && task.status === "backlog") {
            // allow
          } else {
            return false;
          }
        }
      }

      // 3. Priority
      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      // 4. Project
      if (filters.projectId !== "all" && task.projectId !== filters.projectId) {
        return false;
      }

      // 5. Due Date filter
      if (filters.dueFilter !== "all") {
        const deadlineDate = parseISO(task.deadline);
        const isTaskDueToday = isToday(deadlineDate);
        const isTaskOverdue =
          isPast(deadlineDate) &&
          !isTaskDueToday &&
          task.status !== "done" &&
          task.status !== "cancelled";

        if (filters.dueFilter === "today" && !isTaskDueToday) {
          return false;
        }
        if (filters.dueFilter === "overdue" && !isTaskOverdue) {
          return false;
        }
        if (filters.dueFilter === "upcoming" && (isTaskDueToday || isTaskOverdue)) {
          return false;
        }
      }

      return true;
    });
  }, [tasks, filters]);

  // Group tasks by project when in "project" view
  const tasksByProject = useMemo(() => {
    const map = new Map<string, { project: Project | TaskWithProject["project"]; tasks: TaskWithProject[] }>();

    for (const task of filteredTasks) {
      const existing = map.get(task.projectId);
      if (existing) {
        existing.tasks.push(task);
      } else {
        const proj = projects.find((p) => p.id === task.projectId) || task.project;
        map.set(task.projectId, {
          project: proj,
          tasks: [task],
        });
      }
    }

    return Array.from(map.values());
  }, [filteredTasks, projects]);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* 1. Header with Title, Count badge, and + New Task trigger */}
      <PageHeader
        title="Tasks"
        description="Unified command hub for all project tasks, deadlines, and execution progress."
        badge={`${filteredTasks.length} ${filteredTasks.length === 1 ? "Task" : "Tasks"}`}
        action={
          <Button
            id="btn-global-new-task"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="gap-1.5 font-medium shadow-xs"
          >
            <Plus className="size-4" />
            <span>New Task</span>
          </Button>
        }
      />

      {/* 2. Top Metrics / Stats Overview */}
      <TaskStatsHeader stats={stats} />

      {/* 3. Filter Bar: Search, Status, Priority, Project, Due Date, and View Mode */}
      <TaskFilterBar
        filters={filters}
        projects={projects}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* 4. Content Area Based on Active View Mode */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          <>
            {filters.viewMode === "list" && (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredTasks.map((task) => (
                  <GlobalTaskCard key={task.id} task={task} />
                ))}
              </div>
            )}

            {filters.viewMode === "board" && (
              <GlobalTaskBoard tasks={filteredTasks} />
            )}

            {filters.viewMode === "project" && (
              <div className="space-y-6">
                {tasksByProject.map(({ project, tasks: projTasks }) => {
                  const ProjectIcon = getProjectIcon(project.icon);
                  const colorStyles =
                    PROJECT_COLOR_STYLES[project.color] || PROJECT_COLOR_STYLES.violet;

                  return (
                    <div
                      key={project.id}
                      className="rounded-xl border border-border/60 bg-card/40 p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-border/40">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={cn(
                              "size-7 rounded-lg flex items-center justify-center border",
                              colorStyles.badge
                            )}
                          >
                            <ProjectIcon className="size-3.5" />
                          </div>
                          <div>
                            <h2 className="text-sm font-semibold text-foreground">
                              {project.name}
                            </h2>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground font-medium">
                          {projTasks.length} {projTasks.length === 1 ? "task" : "tasks"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {projTasks.map((task) => (
                          <GlobalTaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          /* Empty state */
          <EmptyState
            icon={CheckSquare}
            title="No matching tasks found"
            description={
              tasks.length === 0
                ? "Create your first task to start organizing work across your projects."
                : "No tasks match your current filter criteria. Try clearing or modifying filters."
            }
            action={
              <Button
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="gap-1.5 shadow-xs"
              >
                <Plus className="size-4" />
                <span>Create Task</span>
              </Button>
            }
          />
        )}
      </div>

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        projects={projects}
      />
    </div>
  );
}
