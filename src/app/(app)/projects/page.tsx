import { MOCK_PROJECTS } from "@/features/tasks/constants/mockData";
import { ProjectList } from "@/features/tasks/components/projects/ProjectList";

export const metadata = { title: "Projects — Chronos" };

export default function ProjectsPage() {
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <ProjectList projects={MOCK_PROJECTS} />
    </div>
  );
}
