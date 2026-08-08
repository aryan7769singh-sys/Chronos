import { auth } from "@/lib/auth";
import { getAllProjects } from "@/services/project.service";
import { ProjectList } from "@/features/tasks/components/projects/ProjectList";

export const metadata = { title: "Projects — Chronos" };

export default async function ProjectsPage() {
  const session = await auth();
  const projects = await getAllProjects(session?.user?.id);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <ProjectList projects={projects} />
    </div>
  );
}
