import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById, getAllProjects } from "@/services/project.service";
import { getTaskById, getSubtasksByTaskId, getAllTasksByUserId } from "@/services/task.service";
import { getNotesByTaskId } from "@/services/note.service";
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
  const userId = session?.user?.id;

  const [project, task, subtasks, taskNotes, allProjects, allTasksRaw] = await Promise.all([
    getProjectById(projectId, userId),
    getTaskById(projectId, taskId, userId),
    getSubtasksByTaskId(taskId, userId),
    userId ? getNotesByTaskId(userId, taskId) : Promise.resolve([]),
    userId ? getAllProjects(userId) : Promise.resolve([]),
    userId ? getAllTasksByUserId(userId) : Promise.resolve([]),
  ]);

  if (!project || !task) notFound();

  // Map TaskWithProject → Task (strip the joined project field for TaskDetails)
  const allTasks = allTasksRaw.map((t) => ({
    id: t.id,
    projectId: t.projectId,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    estimatedDuration: t.estimatedDuration,
    actualDuration: t.actualDuration,
    deadline: t.deadline,
    progress: t.progress,
    currentStep: t.currentStep,
    tags: t.tags,
    notes: t.notes,
    createdAt: t.createdAt,
  }));

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <TaskDetails
        task={task}
        project={project}
        subtasks={subtasks}
        taskNotes={taskNotes}
        allProjects={allProjects}
        allTasks={allTasks}
      />
    </div>
  );
}
