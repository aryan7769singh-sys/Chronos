import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllTasksByUserId, getTaskById } from "@/services/task.service";
import { getProjectById } from "@/services/project.service";
import {
  getRecentFocusSessions,
  getFocusSummary,
  getTodaysFocusTask,
} from "@/services/focus.service";
import { FocusView } from "@/features/timer/components/FocusView";
import type { FocusTaskInfo } from "@/features/timer/types";

export const metadata = { title: "Focus — Chronos" };

interface FocusPageProps {
  searchParams: Promise<{ taskId?: string }>;
}

export default async function FocusPage({ searchParams }: FocusPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { taskId } = await searchParams;

  // Parallel data fetching
  const [allTasks, recentSessions, summary] = await Promise.all([
    getAllTasksByUserId(session.user.id),
    getRecentFocusSessions(session.user.id),
    getFocusSummary(session.user.id),
  ]);

  // Map tasks to FocusTaskInfo
  const focusTasks: FocusTaskInfo[] = allTasks
    .filter((t) => t.status !== "done" && t.status !== "cancelled")
    .map((t) => ({
      id: t.id,
      projectId: t.projectId,
      title: t.title,
      projectName: t.project.name,
      projectColor: t.project.color,
      projectIcon: t.project.icon,
      priority: t.priority,
      currentStep: t.currentStep || undefined,
      estimatedDuration: t.estimatedDuration,
      actualDuration: t.actualDuration,
    }));

  // Resolve initial active task (URL query param vs default today's focus task)
  let initialTask: FocusTaskInfo | null = null;

  if (taskId) {
    // Verify user ownership of the requested task
    const taskRecord = await getTaskById(taskId, session.user.id);
    if (taskRecord) {
      const projectRecord = await getProjectById(
        taskRecord.projectId,
        session.user.id
      );
      if (projectRecord) {
        initialTask = {
          id: taskRecord.id,
          projectId: taskRecord.projectId,
          title: taskRecord.title,
          projectName: projectRecord.name,
          projectColor: projectRecord.color,
          projectIcon: projectRecord.icon,
          priority: taskRecord.priority,
          currentStep: taskRecord.currentStep || undefined,
          estimatedDuration: taskRecord.estimatedDuration,
          actualDuration: taskRecord.actualDuration,
        };
      }
    }
  }

  if (!initialTask) {
    initialTask = await getTodaysFocusTask(session.user.id);
  }

  return (
    <FocusView
      tasks={focusTasks}
      recentSessions={recentSessions}
      summary={summary}
      initialTask={initialTask}
    />
  );
}
