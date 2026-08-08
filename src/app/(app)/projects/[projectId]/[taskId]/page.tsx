import { notFound } from "next/navigation";
import {
  MOCK_PROJECTS,
  MOCK_TASKS,
  getSubtasksByTask,
} from "@/features/tasks/constants/mockData";
import { TaskDetails } from "@/features/tasks/components/tasks/TaskDetails";

interface TaskPageProps {
  params: Promise<{ projectId: string; taskId: string }>;
}

export async function generateMetadata({ params }: TaskPageProps) {
  const { taskId } = await params;
  const task = MOCK_TASKS.find((t) => t.id === taskId);
  return {
    title: task ? `${task.title} — Chronos` : "Task — Chronos",
  };
}

export default async function TaskPage({ params }: TaskPageProps) {
  const { projectId, taskId } = await params;

  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!project) notFound();

  const task = MOCK_TASKS.find((t) => t.id === taskId && t.projectId === projectId);
  if (!task) notFound();

  const subtasks = getSubtasksByTask(taskId);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <TaskDetails task={task} project={project} subtasks={subtasks} />
    </div>
  );
}
