import type { ProjectColor } from "@/features/tasks/types";

export type NoteCategory =
  | "general"
  | "idea"
  | "meeting"
  | "study"
  | "research"
  | "journal"
  | "project"
  | "reference";

export type NoteColor =
  | "violet"
  | "blue"
  | "emerald"
  | "amber"
  | "rose"
  | "cyan"
  | "indigo"
  | "orange";

export interface NoteRelationProject {
  id: string;
  name: string;
  color: ProjectColor;
  icon: string;
}

export interface NoteRelationTask {
  id: string;
  title: string;
  status: string;
  projectId: string;
}

export interface Note {
  id: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  title: string;
  content: string;
  category: NoteCategory;
  color: NoteColor;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NoteWithRelations extends Note {
  project?: NoteRelationProject | null;
  task?: NoteRelationTask | null;
}

export interface NoteFilterState {
  search: string;
  category: NoteCategory | "all";
  pinnedOnly: boolean;
  archivedOnly: boolean;
  projectId: string | "all";
  sortBy: "updatedAt" | "createdAt" | "title";
  viewMode: "grid" | "list";
}

export interface CreateNoteInput {
  title: string;
  content?: string;
  category?: NoteCategory;
  color?: NoteColor;
  pinned?: boolean;
  projectId?: string | null;
  taskId?: string | null;
}

export interface UpdateNoteInput {
  title?: string;
  content?: string;
  category?: NoteCategory;
  color?: NoteColor;
  pinned?: boolean;
  archived?: boolean;
  projectId?: string | null;
  taskId?: string | null;
}

export interface NoteStats {
  totalActiveNotes: number;
  pinnedCount: number;
  archivedCount: number;
  recentUpdatedCount: number; // Updated within last 7 days
  categoryBreakdown: { category: NoteCategory; count: number }[];
}
