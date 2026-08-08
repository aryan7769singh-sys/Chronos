/**
 * note.service.ts
 *
 * Comprehensive Service Layer for Notes & Knowledge Hub.
 * All Prisma database operations for notes are strictly isolated here.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  NoteWithRelations,
  NoteCategory,
  NoteColor,
  CreateNoteInput,
  UpdateNoteInput,
  NoteStats,
} from "@/features/notes/types";
import type { ProjectColor } from "@/features/tasks/types";
import { subDays } from "date-fns";

// ---------------------------------------------------------------------------
// Internal Helper: Map Prisma Result to NoteWithRelations
// ---------------------------------------------------------------------------

type PrismaNoteWithRelations = {
  id: string;
  userId: string;
  projectId: string | null;
  taskId: string | null;
  title: string;
  content: string;
  category: string;
  color: string;
  pinned: boolean;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  project?: {
    id: string;
    name: string;
    color: string;
    icon: string;
  } | null;
  task?: {
    id: string;
    title: string;
    status: string;
    projectId: string;
  } | null;
};

function mapPrismaNote(raw: PrismaNoteWithRelations): NoteWithRelations {
  return {
    id: raw.id,
    userId: raw.userId,
    projectId: raw.projectId,
    taskId: raw.taskId,
    title: raw.title,
    content: raw.content,
    category: raw.category as NoteCategory,
    color: (raw.color as NoteColor) || "violet",
    pinned: raw.pinned,
    archived: raw.archived,
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
    project: raw.project
      ? {
          id: raw.project.id,
          name: raw.project.name,
          color: (raw.project.color as ProjectColor) || "violet",
          icon: raw.project.icon || "Layers",
        }
      : null,
    task: raw.task
      ? {
          id: raw.task.id,
          title: raw.task.title,
          status: raw.task.status,
          projectId: raw.task.projectId,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * Fetch all notes owned by userId with optional category, project, task, and search filters.
 */
export async function getAllNotes(
  userId: string,
  options?: {
    includeArchived?: boolean;
    category?: NoteCategory | "all";
    projectId?: string;
    taskId?: string;
    search?: string;
  }
): Promise<NoteWithRelations[]> {
  const { includeArchived = false, category, projectId, taskId, search } = options || {};

  const whereClause: Prisma.NoteWhereInput = {
    userId,
    deletedAt: null,
  };

  if (!includeArchived) {
    whereClause.archived = false;
  }

  if (category && category !== "all") {
    whereClause.category = category;
  }

  if (projectId && projectId !== "all") {
    whereClause.projectId = projectId;
  }

  if (taskId && taskId !== "all") {
    whereClause.taskId = taskId;
  }

  if (search && search.trim() !== "") {
    const term = search.trim();
    whereClause.OR = [
      { title: { contains: term, mode: "insensitive" } },
      { content: { contains: term, mode: "insensitive" } },
      { category: { contains: term, mode: "insensitive" } },
    ];
  }

  const rawNotes = await prisma.note.findMany({
    where: whereClause,
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
    orderBy: [
      { pinned: "desc" },
      { updatedAt: "desc" },
    ],
  });

  return rawNotes.map(mapPrismaNote);
}

/**
 * Get a specific note by ID, verifying tenant ownership.
 */
export async function getNoteById(
  userId: string,
  noteId: string
): Promise<NoteWithRelations | null> {
  const rawNote = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId,
      deletedAt: null,
    },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
  });

  if (!rawNote) return null;
  return mapPrismaNote(rawNote);
}

/**
 * Get pinned active notes owned by user.
 */
export async function getPinnedNotes(userId: string): Promise<NoteWithRelations[]> {
  const rawNotes = await prisma.note.findMany({
    where: {
      userId,
      pinned: true,
      archived: false,
      deletedAt: null,
    },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return rawNotes.map(mapPrismaNote);
}

/**
 * Get recently updated active notes for Dashboard widget.
 */
export async function getRecentNotes(
  userId: string,
  limit: number = 5
): Promise<NoteWithRelations[]> {
  const rawNotes = await prisma.note.findMany({
    where: {
      userId,
      archived: false,
      deletedAt: null,
    },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: limit,
  });

  return rawNotes.map(mapPrismaNote);
}

/**
 * Get notes associated with a specific project.
 */
export async function getNotesByProjectId(
  userId: string,
  projectId: string
): Promise<NoteWithRelations[]> {
  // First verify project belongs to user
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId, deletedAt: null },
  });
  if (!project) return [];

  const rawNotes = await prisma.note.findMany({
    where: {
      userId,
      projectId,
      deletedAt: null,
    },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return rawNotes.map(mapPrismaNote);
}

/**
 * Get notes associated with a specific task.
 */
export async function getNotesByTaskId(
  userId: string,
  taskId: string
): Promise<NoteWithRelations[]> {
  // First verify task belongs to a project owned by user
  const task = await prisma.task.findFirst({
    where: { id: taskId, project: { userId, deletedAt: null }, deletedAt: null },
  });
  if (!task) return [];

  const rawNotes = await prisma.note.findMany({
    where: {
      userId,
      taskId,
      deletedAt: null,
    },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  return rawNotes.map(mapPrismaNote);
}

/**
 * Calculate lightweight note statistics for Notes header/sidebar.
 */
export async function getNoteStats(userId: string): Promise<NoteStats> {
  const [activeNotes, archivedCount, pinnedCount, recentNotes] = await Promise.all([
    prisma.note.findMany({
      where: { userId, archived: false, deletedAt: null },
      select: { category: true },
    }),
    prisma.note.count({
      where: { userId, archived: true, deletedAt: null },
    }),
    prisma.note.count({
      where: { userId, pinned: true, archived: false, deletedAt: null },
    }),
    prisma.note.count({
      where: {
        userId,
        archived: false,
        deletedAt: null,
        updatedAt: { gte: subDays(new Date(), 7) },
      },
    }),
  ]);

  const categoryMap = new Map<NoteCategory, number>();
  for (const n of activeNotes) {
    const cat = (n.category as NoteCategory) || "general";
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
  }

  const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
  }));

  return {
    totalActiveNotes: activeNotes.length,
    pinnedCount,
    archivedCount,
    recentUpdatedCount: recentNotes,
    categoryBreakdown,
  };
}

/**
 * Create a new note owned by userId.
 * Verifies project/task ownership if passed.
 */
export async function createNote(
  userId: string,
  input: CreateNoteInput
): Promise<NoteWithRelations> {
  let validProjectId: string | null = null;
  let validTaskId: string | null = null;

  if (input.projectId) {
    const project = await prisma.project.findFirst({
      where: { id: input.projectId, userId, deletedAt: null },
    });
    if (project) validProjectId = project.id;
  }

  if (input.taskId) {
    const task = await prisma.task.findFirst({
      where: { id: input.taskId, project: { userId, deletedAt: null }, deletedAt: null },
    });
    if (task) {
      validTaskId = task.id;
      // If task belongs to a project and no projectId was given, auto-associate parent project
      if (!validProjectId) validProjectId = task.projectId;
    }
  }

  const created = await prisma.note.create({
    data: {
      userId,
      title: input.title.trim() || "Untitled Note",
      content: input.content ?? "",
      category: input.category || "general",
      color: input.color || "violet",
      pinned: input.pinned ?? false,
      projectId: validProjectId,
      taskId: validTaskId,
    },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
  });

  return mapPrismaNote(created);
}

/**
 * Update an existing note owned by userId.
 */
export async function updateNote(
  noteId: string,
  userId: string,
  input: UpdateNoteInput
): Promise<NoteWithRelations> {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Note not found or unauthorized.");
  }

  const updateData: Prisma.NoteUpdateInput = {};

  if (input.title !== undefined) updateData.title = input.title.trim() || "Untitled Note";
  if (input.content !== undefined) updateData.content = input.content;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.pinned !== undefined) updateData.pinned = input.pinned;
  if (input.archived !== undefined) updateData.archived = input.archived;

  if (input.projectId !== undefined) {
    if (input.projectId === null) {
      updateData.project = { disconnect: true };
    } else {
      const project = await prisma.project.findFirst({
        where: { id: input.projectId, userId, deletedAt: null },
      });
      if (project) {
        updateData.project = { connect: { id: project.id } };
      }
    }
  }

  if (input.taskId !== undefined) {
    if (input.taskId === null) {
      updateData.task = { disconnect: true };
    } else {
      const task = await prisma.task.findFirst({
        where: { id: input.taskId, project: { userId, deletedAt: null }, deletedAt: null },
      });
      if (task) {
        updateData.task = { connect: { id: task.id } };
      }
    }
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: updateData,
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
  });

  return mapPrismaNote(updated);
}

/**
 * Soft delete a note owned by userId.
 */
export async function deleteNote(noteId: string, userId: string): Promise<void> {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Note not found or unauthorized.");
  }

  await prisma.note.update({
    where: { id: noteId },
    data: { deletedAt: new Date() },
  });
}

/**
 * Toggle pinned status of a note owned by userId.
 */
export async function toggleNotePinned(
  noteId: string,
  userId: string
): Promise<NoteWithRelations> {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Note not found or unauthorized.");
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: { pinned: !existing.pinned },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
  });

  return mapPrismaNote(updated);
}

/**
 * Archive or unarchive a note owned by userId.
 */
export async function archiveNote(
  noteId: string,
  userId: string
): Promise<NoteWithRelations> {
  const existing = await prisma.note.findFirst({
    where: { id: noteId, userId, deletedAt: null },
  });

  if (!existing) {
    throw new Error("Note not found or unauthorized.");
  }

  const updated = await prisma.note.update({
    where: { id: noteId },
    data: { archived: !existing.archived },
    include: {
      project: { select: { id: true, name: true, color: true, icon: true } },
      task: { select: { id: true, title: true, status: true, projectId: true } },
    },
  });

  return mapPrismaNote(updated);
}
