"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import type { Project, ProjectStatus } from "../../types";

interface ProjectListProps {
  projects: Project[];
}

type FilterValue = "all" | ProjectStatus;

const FILTER_TABS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

export function ProjectList({ projects }: ProjectListProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""} total
          </p>
        </div>

        <Button
          id="new-project-btn"
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus className="size-3.5" />
          New Project
        </Button>
      </div>

      {/* Filter tabs */}
      <div
        role="tablist"
        aria-label="Filter projects by status"
        className="flex gap-1 mb-6 p-1 rounded-lg bg-muted w-fit"
      >
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            id={`filter-tab-${tab.value}`}
            role="tab"
            aria-selected={filter === tab.value}
            onClick={() => setFilter(tab.value)}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium transition-all duration-150",
              filter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              taskCount={project.taskCount ?? 0}
              completedTaskCount={project.completedTaskCount ?? 0}
            />
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
            <FolderKanban className="size-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-medium text-foreground">No projects found</p>
            <p className="text-sm text-muted-foreground mt-1">
              {filter === "all"
                ? "Create your first project to get started."
                : `No projects with status "${filter}".`}
            </p>
          </div>
          {filter !== "all" && (
            <button
              onClick={() => setFilter("all")}
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              Show all projects
            </button>
          )}
        </div>
      )}

      <CreateProjectDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
