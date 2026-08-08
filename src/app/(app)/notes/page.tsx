import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllNotes, getNoteStats } from "@/services/note.service";
import { getAllProjects } from "@/services/project.service";
import { NotesView } from "@/features/notes/components/NotesView";

export const metadata = { title: "Notes & Knowledge Hub — Chronos" };

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [notes, stats, projects] = await Promise.all([
    getAllNotes(session.user.id, { includeArchived: true }),
    getNoteStats(session.user.id),
    getAllProjects(session.user.id),
  ]);

  return <NotesView initialNotes={notes} stats={stats} projects={projects} />;
}
