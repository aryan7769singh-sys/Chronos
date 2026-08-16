"use client";

import { useState } from "react";
import { Plus, FolderKanban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectDialog } from "./CreateProjectDialog";
import type { Project, ProjectStatus } from "../../types";

interface ProjectListProps {
  projects: Project[];
}

type FilterValue = "all" | ProjectStatus;

const FILTER_TABS: { id: FilterValue; label: string }[] = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "paused", label: "Paused" },
  { id: "completed", label: "Completed" },
];

export function ProjectList({ projects }: ProjectListProps) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const filtered =
    filter === "all" ? projects : projects.filter((p) => p.status === filter);

  return (
    <>
      {/* Page Header */}
      <PageHeader
        title="Projects"
        description="Organize work streams, track deliverables, and balance focus."
        badge={`${projects.length} Total`}
        action={
          <Button
            id="new-project-btn"
            size="sm"
            className="gap-1.5 shrink-0 shadow-xs"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="size-3.5" />
            <span>New Project</span>
          </Button>
        }
      >
        {/* Filter Tabs */}
        <div className="pt-2">
          <SegmentedTabs
            size="sm"
            value={filter}
            onValueChange={(val) => setFilter(val as FilterValue)}
            options={FILTER_TABS}
            aria-label="Filter projects by status"
          />
        </div>
      </PageHeader>

      {/* Project grid */}
      <div className="pt-6">
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
          <EmptyState
            icon={FolderKanban}
            title="No projects found"
            description={
              filter === "all"
                ? "Create your first project to get started organizing tasks and tracking milestones."
                : `No projects match the status "${filter}".`
            }
            action={
              filter === "all" ? (
                <Button
                  size="sm"
                  onClick={() => setIsCreateOpen(true)}
                  className="gap-1.5 shadow-xs"
                >
                  <Plus className="size-3.5" />
                  <span>Create Project</span>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilter("all")}
                >
                  Show all projects
                </Button>
              )
            }
          />
        )}
      </div>

      <CreateProjectDialog
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </>
  );
}
