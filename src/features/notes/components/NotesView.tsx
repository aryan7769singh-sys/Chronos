"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Pin,
  Archive,
  LayoutGrid,
  List as ListIcon,
  Plus,
  Sparkles,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { NotesHeader } from "./NotesHeader";
import { NoteCard } from "./NoteCard";
import { NoteEditor } from "./NoteEditor";
import type {
  NoteWithRelations,
  NoteCategory,
  NoteStats,
  CreateNoteInput,
  UpdateNoteInput,
} from "../types";
import type { Project } from "@/features/tasks/types";
import { NOTE_CATEGORIES, NOTE_CATEGORY_METADATA } from "../constants/domain";
import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
  toggleNotePinnedAction,
  archiveNoteAction,
} from "../actions";
import { cn } from "@/lib/utils";

interface NotesViewProps {
  initialNotes: NoteWithRelations[];
  stats: NoteStats;
  projects?: Project[];
}

export function NotesView({
  initialNotes,
  stats: initialStats,
  projects = [],
}: NotesViewProps) {
  const [notes, setNotes] = useState<NoteWithRelations[]>(initialNotes);
  const [stats, setStats] = useState<NoteStats>(initialStats);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<NoteCategory | "all">("all");
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"updatedAt" | "createdAt" | "title">("updatedAt");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Editor Dialog states
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteWithRelations | null>(null);

  // Actions
  const handleCreateOrUpdateNote = async (
    input: CreateNoteInput | UpdateNoteInput,
    noteId?: string
  ) => {
    if (noteId) {
      const updated = await updateNoteAction(noteId, input as UpdateNoteInput);
      setNotes((prev) => prev.map((n) => (n.id === noteId ? updated : n)));
    } else {
      const created = await createNoteAction(input as CreateNoteInput);
      setNotes((prev) => [created, ...prev]);
      setStats((prev) => ({
        ...prev,
        totalActiveNotes: prev.totalActiveNotes + 1,
      }));
    }
  };

  const handleTogglePin = async (id: string) => {
    const updated = await toggleNotePinnedAction(id);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const handleArchive = async (id: string) => {
    const updated = await archiveNoteAction(id);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
  };

  const handleDelete = async (id: string) => {
    await deleteNoteAction(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const handleOpenEditor = (note?: NoteWithRelations) => {
    setEditingNote(note || null);
    setEditorOpen(true);
  };

  // Filtered & Sorted Notes list
  const filteredNotes = useMemo(() => {
    return notes
      .filter((n) => {
        // Archive filter
        if (showArchived ? !n.archived : n.archived) return false;

        // Pinned filter
        if (showPinnedOnly && !n.pinned) return false;

        // Category filter
        if (selectedCategory !== "all" && n.category !== selectedCategory) return false;

        // Project filter
        if (selectedProjectId !== "all" && n.projectId !== selectedProjectId) return false;

        // Search query
        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchContent = n.content.toLowerCase().includes(q);
          const matchCategory = n.category.toLowerCase().includes(q);
          const matchProject = n.project?.name.toLowerCase().includes(q);
          if (!matchTitle && !matchContent && !matchCategory && !matchProject) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "title") return a.title.localeCompare(b.title);
        if (sortBy === "createdAt") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
  }, [notes, showArchived, showPinnedOnly, selectedCategory, selectedProjectId, searchQuery, sortBy]);

  // Separate pinned vs non-pinned for display
  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.pinned), [filteredNotes]);
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.pinned), [filteredNotes]);

  const hasAnyNotes = notes.length > 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <NotesHeader stats={stats} onNewNote={() => handleOpenEditor()} />

      {/* Filter & Control Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search notes by title, content, category, or project..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs bg-card/60"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {/* Pinned Filter Button */}
            <Button
              variant={showPinnedOnly ? "default" : "outline"}
              size="sm"
              className="h-9 gap-1.5 text-xs shrink-0"
              onClick={() => setShowPinnedOnly(!showPinnedOnly)}
            >
              <Pin className="size-3.5" />
              <span>Pinned</span>
            </Button>

            {/* Archive Toggle Button */}
            <Button
              variant={showArchived ? "secondary" : "outline"}
              size="sm"
              className="h-9 gap-1.5 text-xs shrink-0"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="size-3.5" />
              <span>{showArchived ? "Archived Notes" : "Active Notes"}</span>
            </Button>

            {/* Project Filter */}
            {projects.length > 0 && (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="h-9 text-xs rounded-md border border-border/60 bg-card/60 px-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
                aria-label="Filter by project"
              >
                <option value="all">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "updatedAt" | "createdAt" | "title")}
              className="h-9 text-xs rounded-md border border-border/60 bg-card/60 px-2.5 focus:outline-none focus:ring-1 focus:ring-ring"
              aria-label="Sort notes"
            >
              <option value="updatedAt">Recently Updated</option>
              <option value="createdAt">Date Created</option>
              <option value="title">Title (A-Z)</option>
            </select>

            {/* Grid / List View Switcher */}
            <SegmentedTabs
              size="sm"
              value={viewMode}
              onValueChange={(val) => setViewMode(val as "grid" | "list")}
              options={[
                { id: "grid", label: "Grid", icon: LayoutGrid },
                { id: "list", label: "List", icon: ListIcon },
              ]}
              aria-label="Notes view mode"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0",
              selectedCategory === "all"
                ? "bg-foreground text-background font-semibold"
                : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            All Categories
          </button>
          {NOTE_CATEGORIES.map((cat) => {
            const meta = NOTE_CATEGORY_METADATA[cat];
            const Icon = meta.icon;
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 border border-transparent",
                  isActive
                    ? `${meta.bgClass} ${meta.textClass} ${meta.borderClass} font-semibold`
                    : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-3" />
                <span>{meta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes Content Display */}
      {!hasAnyNotes ? (
        /* Empty State: Zero Notes Exist */
        <EmptyState
          icon={Sparkles}
          title="Your workspace is quiet"
          description="Capture an idea, meeting note, study thought, or project reference to build your Chronos knowledge hub."
          action={
            <Button onClick={() => handleOpenEditor()} className="gap-1.5 shadow-xs">
              <Plus className="size-4" />
              <span>Create your first note</span>
            </Button>
          }
        />
      ) : filteredNotes.length === 0 ? (
        /* Empty State: Filters Match 0 Notes */
        <EmptyState
          icon={FileText}
          title="No notes match your filters"
          description="Try adjusting your search query, category selection, or project filters."
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setShowPinnedOnly(false);
                setSelectedProjectId("all");
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : (
        /* Grid / List display */
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {!showPinnedOnly && pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                <Pin className="size-3.5 fill-primary" />
                <span>Pinned Notes ({pinnedNotes.length})</span>
              </div>
              <div
                className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    : "space-y-2.5"
                )}
              >
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleOpenEditor}
                    onTogglePin={handleTogglePin}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All / Other Notes Section */}
          <div className="space-y-3">
            {!showPinnedOnly && pinnedNotes.length > 0 && otherNotes.length > 0 && (
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground border-t border-border/40 pt-4">
                <span>Other Notes ({otherNotes.length})</span>
              </div>
            )}

            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-2.5"
              )}
            >
              {(showPinnedOnly ? filteredNotes : otherNotes.length > 0 ? otherNotes : filteredNotes).map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleOpenEditor}
                  onTogglePin={handleTogglePin}
                  onArchive={handleArchive}
                  onDelete={handleDelete}
                  viewMode={viewMode}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal Dialog */}
      <NoteEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        note={editingNote}
        projects={projects}
        onSave={handleCreateOrUpdateNote}
        onDelete={handleDelete}
        onArchive={handleArchive}
      />
    </div>
  );
}
