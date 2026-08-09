"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TimeBlockDialog } from "@/features/planning/components/TimeBlockDialog";
import type { Project, Task } from "@/features/tasks/types";

interface ScheduleTaskButtonProps {
  task: Task;
  allProjects: Project[];
  allTasks: Task[];
}

export function ScheduleTaskButton({
  task,
  allProjects,
  allTasks,
}: ScheduleTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        id={`schedule-task-btn-${task.id}`}
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="gap-1.5 text-xs border-violet-500/40 text-violet-600 dark:text-violet-400 hover:bg-violet-500/10 hover:border-violet-500/60"
      >
        <CalendarClock className="size-3.5" />
        Schedule
      </Button>

      <TimeBlockDialog
        open={open}
        onOpenChange={setOpen}
        initialTaskId={task.id}
        projects={allProjects}
        tasks={allTasks}
      />
    </>
  );
}
