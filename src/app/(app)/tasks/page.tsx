import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getAllTasksByUserId,
  getTaskStats,
} from "@/services/task.service";
import { getAllProjects } from "@/services/project.service";
import { TasksView } from "@/features/tasks/components/tasks/TasksView";

export const metadata = {
  title: "Tasks — Chronos",
  description: "Unified command hub for all project tasks, deadlines, and execution progress.",
};

export default async function TasksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/tasks");
  }

  const [tasks, projects, stats] = await Promise.all([
    getAllTasksByUserId(session.user.id),
    getAllProjects(session.user.id),
    getTaskStats(session.user.id),
  ]);

  return <TasksView tasks={tasks} projects={projects} stats={stats} />;
}
