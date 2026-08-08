import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/services/project.service";
import { getTaskById, getSubtasksByTaskId } from "@/services/task.service";
import { TaskDetails } from "@/features/tasks/components/tasks/TaskDetails";

interface TaskPageProps {
  params: Promise<{ projectId: string; taskId: string }>;
}

export async function generateMetadata({ params }: TaskPageProps) {
  const { taskId, projectId } = await params;
  const task = await getTaskById(projectId, taskId);
  return {
    title: task ? `${task.title} — Chronos` : "Task — Chronos",
  };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { projectId, taskId } = await params;
  const session = await auth();

  const [project, task, subtasks] = await Promise.all([
    getProjectById(projectId, session?.user?.id),
    getTaskById(projectId, taskId),
    getSubtasksByTaskId(taskId),
  ]);

  if (!project || !task) notFound();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <TaskDetails task={task} project={project} subtasks={subtasks} />
    </div>
  );
}
