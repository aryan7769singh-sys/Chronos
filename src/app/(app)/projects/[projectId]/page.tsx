import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getProjectById } from "@/services/project.service";
import { getTasksByProjectId } from "@/services/task.service";
import { getNotesByProjectId } from "@/services/note.service";
import { ProjectDetails } from "@/features/tasks/components/projects/ProjectDetails";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = await getProjectById(projectId);
  return {
    title: project ? `${project.name} — Chronos` : "Project — Chronos",
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  const [project, tasks, projectNotes] = await Promise.all([
    getProjectById(projectId, userId),
    getTasksByProjectId(projectId, userId),
    userId ? getNotesByProjectId(userId, projectId) : Promise.resolve([]),
  ]);

  if (!project) notFound();

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <ProjectDetails project={project} tasks={tasks} projectNotes={projectNotes} />
    </div>
  );
}
