"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Pin,
  Archive,
  Trash2,
  FolderKanban,
  CheckSquare,
  Loader2,
  Sparkles,
} from "lucide-react";
import type {
  NoteWithRelations,
  NoteCategory,
  NoteColor,
  CreateNoteInput,
} from "../types";
import type { Project } from "@/features/tasks/types";
import {
  NOTE_CATEGORIES,
  NOTE_CATEGORY_METADATA,
  ALLOWED_NOTE_COLORS,
} from "../constants/domain";
import { cn } from "@/lib/utils";

interface NoteEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: NoteWithRelations | null;
  projects?: Project[];
  onSave: (input: CreateNoteInput, noteId?: string) => Promise<void>;
  onDelete?: (noteId: string) => Promise<void>;
  onArchive?: (noteId: string) => Promise<void>;
}

export function NoteEditor({
  open,
  onOpenChange,
  note,
  projects = [],
  onSave,
  onDelete,
  onArchive,
}: NoteEditorProps) {
  const isEditing = Boolean(note?.id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<NoteCategory>("general");
  const [color, setColor] = useState<NoteColor>("violet");
  const [pinned, setPinned] = useState(false);
  const [projectId, setProjectId] = useState<string>("none");
  const [taskId, setTaskId] = useState<string>("none");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  const [prevKey, setPrevKey] = useState<string | null>(null);

  // Sync form state when dialog opens or note changes
  const currentKey = open ? `${note?.id || "new"}-${open}` : null;
  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (note && open) {
      setTitle(note.title || "");
      setContent(note.content || "");
      setCategory(note.category || "general");
      setColor(note.color || "violet");
      setPinned(note.pinned || false);
      setProjectId(note.projectId || "none");
      setTaskId(note.taskId || "none");
    } else if (open) {
      setTitle("");
      setContent("");
      setCategory("general");
      setColor("violet");
      setPinned(false);
      setProjectId("none");
      setTaskId("none");
    }
  }

  // Selected project object to derive tasks for dropdown
  const selectedProject = projects.find((p) => p.id === projectId) as
    | (Project & { tasks?: { id: string; title: string; deletedAt?: unknown }[] })
    | undefined;
  const availableTasks = selectedProject?.tasks
    ? selectedProject.tasks.filter((t) => !t.deletedAt)
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSaving(true);
      await onSave(
        {
          title: title.trim(),
          content,
          category,
          color,
          pinned,
          projectId: projectId === "none" ? null : projectId,
          taskId: taskId === "none" ? null : taskId,
        },
        note?.id
      );
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note?.id || !onDelete) return;
    try {
      setIsDeleting(true);
      await onDelete(note.id);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleArchive = async () => {
    if (!note?.id || !onArchive) return;
    try {
      setIsArchiving(true);
      await onArchive(note.id);
      onOpenChange(false);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] p-6 max-h-[90vh] flex flex-col justify-between overflow-hidden">
        <DialogHeader className="pb-2 border-b border-border/50 flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="size-4.5 text-violet-500" />
            <span>{isEditing ? "Edit Note" : "Create New Note"}</span>
          </DialogTitle>

          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className={cn(
              "size-8 rounded-md transition-colors",
              pinned ? "text-violet-500 bg-violet-500/10" : "text-muted-foreground"
            )}
            onClick={() => setPinned(!pinned)}
            title={pinned ? "Unpin Note" : "Pin Note"}
          >
            <Pin className={cn("size-4", pinned && "fill-violet-500")} />
          </Button>
        </DialogHeader>

        <form id="note-editor-form" onSubmit={handleSubmit} className="space-y-4 py-3 flex-1 overflow-y-auto pr-1">
          {/* Note Title Input */}
          <div className="space-y-1.5">
            <label htmlFor="note-title" className="text-xs font-semibold text-muted-foreground block">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              id="note-title"
              placeholder="e.g. Architecture decisions for milestone 11..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base font-semibold"
              required
              autoFocus
            />
          </div>

          {/* Category & Color selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category Select */}
            <div className="space-y-1.5">
              <label htmlFor="note-category" className="text-xs font-semibold text-muted-foreground block">
                Category
              </label>
              <select
                id="note-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as NoteCategory)}
                className="w-full h-9 rounded-md border border-border/60 bg-background px-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {NOTE_CATEGORIES.map((cat) => {
                  const meta = NOTE_CATEGORY_METADATA[cat];
                  return (
                    <option key={cat} value={cat}>
                      {meta.label}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Color Accent Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground block">Color Accent</label>
              <div className="flex items-center gap-1.5 pt-1">
                {ALLOWED_NOTE_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={cn(
                      "size-5 rounded-full border border-border/60 transition-all",
                      c === "violet" && "bg-violet-500",
                      c === "blue" && "bg-blue-500",
                      c === "emerald" && "bg-emerald-500",
                      c === "amber" && "bg-amber-500",
                      c === "rose" && "bg-rose-500",
                      c === "cyan" && "bg-cyan-500",
                      c === "indigo" && "bg-indigo-500",
                      c === "orange" && "bg-orange-500",
                      color === c ? "ring-2 ring-violet-500 ring-offset-2 ring-offset-background scale-110" : "opacity-70 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Workflow Links: Project & Task */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-lg bg-muted/40 border border-border/40">
            {/* Project Select */}
            <div className="space-y-1.5">
              <label htmlFor="note-project" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <FolderKanban className="size-3.5 text-violet-500" />
                <span>Linked Project</span>
              </label>
              <select
                id="note-project"
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setTaskId("none");
                }}
                className="w-full h-8 rounded-md border border-border/60 bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="none">None (Standalone Note)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Task Select */}
            <div className="space-y-1.5">
              <label htmlFor="note-task" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <CheckSquare className="size-3.5 text-emerald-500" />
                <span>Linked Task</span>
              </label>
              <select
                id="note-task"
                value={taskId}
                onChange={(e) => setTaskId(e.target.value)}
                disabled={projectId === "none" || availableTasks.length === 0}
                className="w-full h-8 rounded-md border border-border/60 bg-background px-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
              >
                <option value="none">
                  {projectId === "none"
                    ? "Select a project first"
                    : availableTasks.length === 0
                    ? "No tasks in project"
                    : "None (Project-level Note)"}
                </option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note Content Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="note-content" className="text-xs font-semibold text-muted-foreground block">
              Content & Thoughts
            </label>
            <Textarea
              id="note-content"
              placeholder="Write your note, code snippets, meeting minutes, or study thoughts here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="font-mono text-xs leading-relaxed resize-none"
            />
          </div>
        </form>

        <DialogFooter className="pt-3 border-t border-border/50 flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {isEditing && onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1 text-xs"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                <span className="hidden sm:inline">Delete</span>
              </Button>
            )}

            {isEditing && onArchive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:bg-muted gap-1 text-xs"
                onClick={handleArchive}
                disabled={isArchiving}
              >
                {isArchiving ? <Loader2 className="size-3.5 animate-spin" /> : <Archive className="size-3.5" />}
                <span className="hidden sm:inline">{note?.archived ? "Unarchive" : "Archive"}</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="note-editor-form"
              size="sm"
              disabled={isSaving || !title.trim()}
              className="gap-1.5"
            >
              {isSaving && <Loader2 className="size-3.5 animate-spin" />}
              <span>{isEditing ? "Save Changes" : "Create Note"}</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
