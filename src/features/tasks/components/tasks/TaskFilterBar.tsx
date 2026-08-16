"use client";

import {
  Search,
  SlidersHorizontal,
  LayoutList,
  Kanban,
  FolderKanban,
  Clock,
  Layers,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  TaskStatus,
  Priority,
  TaskFilterState,
  Project,
} from "../../types";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { id: TaskStatus | "all"; label: string }[] = [
  { id: "all", label: "All Status" },
  { id: "todo", label: "To Do" },
  { id: "in-progress", label: "In Progress" },
  { id: "blocked", label: "Blocked" },
  { id: "done", label: "Done" },
];

const PRIORITY_FILTERS: { id: Priority | "all"; label: string; dot?: string }[] = [
  { id: "all", label: "All Priorities" },
  { id: "urgent", label: "Urgent", dot: "bg-destructive" },
  { id: "high", label: "High", dot: "bg-orange-500" },
  { id: "medium", label: "Medium", dot: "bg-amber-500" },
  { id: "low", label: "Low", dot: "bg-muted-foreground/50" },
];

const DUE_FILTERS: { id: "all" | "today" | "upcoming" | "overdue"; label: string }[] = [
  { id: "all", label: "All Deadlines" },
  { id: "today", label: "Due Today" },
  { id: "upcoming", label: "Upcoming" },
  { id: "overdue", label: "Overdue" },
];

interface TaskFilterBarProps {
  filters: TaskFilterState;
  projects: Project[];
  onFilterChange: (filters: Partial<TaskFilterState>) => void;
  onResetFilters: () => void;
}

export function TaskFilterBar({
  filters,
  projects,
  onFilterChange,
  onResetFilters,
}: TaskFilterBarProps) {
  const selectedProject = projects.find((p) => p.id === filters.projectId);

  const hasActiveFilters =
    filters.search !== "" ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.projectId !== "all" ||
    filters.dueFilter !== "all";

  return (
    <div className="space-y-3">
      {/* Top row: Search input, View modes, and Active filters reset */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            id="task-search-input"
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search tasks, descriptions, tags, or steps…"
            className="pl-8 h-9 text-xs bg-card/60 backdrop-blur-sm border-border/60"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: "" })}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3" />
            </button>
          )}
        </div>

        {/* View Switcher: List, Board, Project */}
        <SegmentedTabs
          size="sm"
          value={filters.viewMode}
          onValueChange={(mode) =>
            onFilterChange({ viewMode: mode as "list" | "board" | "project" })
          }
          options={[
            { id: "list", label: "List", icon: LayoutList },
            { id: "board", label: "Board", icon: Kanban },
            { id: "project", label: "By Project", icon: FolderKanban },
          ]}
          aria-label="Task view mode"
        />
      </div>

      {/* Bottom row: Filter chips and dropdowns */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onFilterChange({ status: s.id })}
              className={cn(
                "text-xs px-2.5 py-1 rounded-md border transition-all cursor-pointer font-medium shrink-0",
                filters.status === s.id
                  ? "bg-primary text-primary-foreground border-primary shadow-xs"
                  : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Priority Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "h-7 px-2.5 rounded-md border text-xs flex items-center gap-1.5 cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring",
              filters.priority !== "all"
                ? "bg-primary/10 text-primary border-primary/30 font-medium"
                : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
            )}
          >
            <SlidersHorizontal className="size-3" />
            <span>
              {filters.priority === "all"
                ? "Priority"
                : PRIORITY_FILTERS.find((p) => p.id === filters.priority)?.label}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36 text-xs">
            {PRIORITY_FILTERS.map((p) => (
              <DropdownMenuItem
                key={p.id}
                onClick={() => onFilterChange({ priority: p.id })}
                className={cn(
                  "gap-2 cursor-pointer",
                  filters.priority === p.id && "font-semibold bg-accent"
                )}
              >
                {p.dot && <span className={cn("size-2 rounded-full", p.dot)} />}
                <span>{p.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Project Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "h-7 px-2.5 rounded-md border text-xs flex items-center gap-1.5 cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring",
              filters.projectId !== "all"
                ? "bg-primary/10 text-primary border-primary/30 font-medium"
                : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
            )}
          >
            <Layers className="size-3" />
            <span className="max-w-[120px] truncate">
              {filters.projectId === "all"
                ? "Project"
                : selectedProject?.name || "Project"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 text-xs max-h-56 overflow-y-auto">
            <DropdownMenuItem
              onClick={() => onFilterChange({ projectId: "all" })}
              className={cn(
                "cursor-pointer",
                filters.projectId === "all" && "font-semibold bg-accent"
              )}
            >
              All Projects
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {projects.map((proj) => (
              <DropdownMenuItem
                key={proj.id}
                onClick={() => onFilterChange({ projectId: proj.id })}
                className={cn(
                  "cursor-pointer truncate",
                  filters.projectId === proj.id && "font-semibold bg-accent"
                )}
              >
                {proj.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Due Date Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "h-7 px-2.5 rounded-md border text-xs flex items-center gap-1.5 cursor-pointer transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring",
              filters.dueFilter !== "all"
                ? "bg-primary/10 text-primary border-primary/30 font-medium"
                : "bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground"
            )}
          >
            <Clock className="size-3" />
            <span>
              {filters.dueFilter === "all"
                ? "Due Date"
                : DUE_FILTERS.find((d) => d.id === filters.dueFilter)?.label}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36 text-xs">
            {DUE_FILTERS.map((d) => (
              <DropdownMenuItem
                key={d.id}
                onClick={() => onFilterChange({ dueFilter: d.id })}
                className={cn(
                  "cursor-pointer",
                  filters.dueFilter === d.id && "font-semibold bg-accent"
                )}
              >
                {d.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Filter button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive gap-1 ml-auto"
          >
            <X className="size-3" />
            <span>Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
