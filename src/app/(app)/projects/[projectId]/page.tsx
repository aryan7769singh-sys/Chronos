import { notFound } from "next/navigation";
import {
  MOCK_PROJECTS,
  getTasksByProject,
} from "@/features/tasks/constants/mockData";
import { ProjectDetails } from "@/features/tasks/components/projects/ProjectDetails";

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export async function generateMetadata({ params }: ProjectPageProps) {
  const { projectId } = await params;
  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  return {
    title: project ? `${project.name} — Chronos` : "Project — Chronos",
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { projectId } = await params;

  const project = MOCK_PROJECTS.find((p) => p.id === projectId);
  if (!project) notFound();

  const tasks = getTasksByProject(projectId);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <ProjectDetails project={project} tasks={tasks} />
    </div>
  );
}
