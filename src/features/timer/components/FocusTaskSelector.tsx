"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FolderKanban,
  Search,
  X,
  Clock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROJECT_COLOR_STYLES, ProjectIcon } from "@/features/tasks/constants/domain";
import type { FocusTaskInfo } from "../types";
import { cn } from "@/lib/utils";

interface FocusTaskSelectorProps {
  activeTask: FocusTaskInfo | null;
  tasks: FocusTaskInfo[];
  onSelectTask: (task: FocusTaskInfo | null) => void;
}

const PRIORITY_BADGES = {
  urgent: "bg-destructive/15 text-destructive border-destructive/30",
  high: "bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30",
  medium: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  low: "bg-muted text-muted-foreground border-border/50",
};

export function FocusTaskSelector({
  activeTask,
  tasks,
  onSelectTask,
}: FocusTaskSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filteredTasks = tasks.filter((t) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.projectName.toLowerCase().includes(q)
    );
  });

  const activeColorStyles = activeTask
    ? PROJECT_COLOR_STYLES[activeTask.projectColor] ||
      PROJECT_COLOR_STYLES.violet
    : null;

  return (
    <>
      <Card className="w-full max-w-md mx-auto border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
        <CardContent className="p-4">
          {activeTask ? (
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  {/* Project & Priority Badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                        activeColorStyles?.badge
                      )}
                    >
                      <ProjectIcon
                        iconName={activeTask.projectIcon}
                        className="size-3"
                      />
                      <span className="truncate max-w-[120px]">
                        {activeTask.projectName}
                      </span>
                    </span>

                    <span
                      className={cn(
                        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider",
                        PRIORITY_BADGES[activeTask.priority]
                      )}
                    >
                      {activeTask.priority}
                    </span>
                  </div>

                  {/* Task Title */}
                  <p className="text-sm font-semibold text-foreground truncate">
                    {activeTask.title}
                  </p>
                </div>

                {/* Change / Clear Task Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(true)}
                    className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    Switch
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSelectTask(null)}
                    className="size-7 rounded-md text-muted-foreground hover:text-destructive cursor-pointer"
                    title="Clear active task"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>

              {/* Current Step Callout */}
              {activeTask.currentStep && (
                <div className="rounded-md bg-muted/40 px-2.5 py-1.5 text-[11px] text-muted-foreground flex items-center gap-1.5 border border-border/40">
                  <span className="font-semibold text-foreground shrink-0">
                    Next step:
                  </span>
                  <span className="truncate">{activeTask.currentStep}</span>
                </div>
              )}

              {/* Time Spent vs Estimated */}
              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3" />
                  <span>
                    Spent: <strong className="text-foreground">{activeTask.actualDuration}m</strong>
                    {activeTask.estimatedDuration > 0 && ` / ~${activeTask.estimatedDuration}m`}
                  </span>
                </div>

                <Link
                  href={`/projects/${activeTask.projectId}/${activeTask.id}`}
                  className="inline-flex items-center gap-1 hover:text-primary transition-colors font-medium text-[10px]"
                >
                  <span>View Details</span>
                  <ArrowRight className="size-2.5" />
                </Link>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                  <Sparkles className="size-4 text-violet-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    No active task selected
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Link a task to auto-log your focus duration
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(true)}
                className="h-8 text-xs font-medium gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Select Task</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Task Selector Modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col p-0">
          <DialogHeader className="p-4 pb-2 border-b border-border/40">
            <DialogTitle className="text-base">Select Focus Task</DialogTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search active tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-xs"
                autoFocus
              />
            </div>
          </DialogHeader>

          {/* Task List */}
          <div className="p-3 overflow-y-auto space-y-1.5 max-h-[50vh]">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((t) => {
                const colorStyles =
                  PROJECT_COLOR_STYLES[t.projectColor] ||
                  PROJECT_COLOR_STYLES.violet;
                const isSelected = activeTask?.id === t.id;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      onSelectTask(t);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg border transition-all flex items-start justify-between gap-2.5 cursor-pointer",
                      isSelected
                        ? "bg-violet-500/10 border-violet-500/30"
                        : "bg-card hover:bg-muted/50 border-border/50"
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-semibold border",
                            colorStyles.badge
                          )}
                        >
                          <ProjectIcon
                            iconName={t.projectIcon}
                            className="size-2.5"
                          />
                          <span className="truncate max-w-[100px]">
                            {t.projectName}
                          </span>
                        </span>
                        <span
                          className={cn(
                            "text-[9px] font-medium uppercase px-1 rounded border",
                            PRIORITY_BADGES[t.priority]
                          )}
                        >
                          {t.priority}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-foreground truncate">
                        {t.title}
                      </p>
                      {t.currentStep && (
                        <p className="text-[10px] text-muted-foreground truncate">
                          Next: {t.currentStep}
                        </p>
                      )}
                    </div>

                    {isSelected && (
                      <CheckCircle2 className="size-4 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="py-10 text-center text-muted-foreground space-y-1">
                <FolderKanban className="size-6 mx-auto text-muted-foreground/60" />
                <p className="text-xs font-medium">No active tasks found</p>
                <p className="text-[11px]">
                  Create tasks under a project to focus on them.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
