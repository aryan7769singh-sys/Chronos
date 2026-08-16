"use client";

import { Pin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import type { NoteStats } from "../types";

interface NotesHeaderProps {
  stats: NoteStats;
  onNewNote: () => void;
}

export function NotesHeader({ stats, onNewNote }: NotesHeaderProps) {
  return (
    <PageHeader
      title="Notes & Knowledge Hub"
      description="Capture ideas, meeting notes, study thoughts, and project references linked to your workflow."
      badge={`${stats.totalActiveNotes} ${stats.totalActiveNotes === 1 ? "note" : "notes"}`}
      action={
        <div className="flex items-center gap-3">
          {stats.pinnedCount > 0 && (
            <span className="hidden sm:inline-flex px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs items-center gap-1 font-medium">
              <Pin className="size-3" />
              <span>{stats.pinnedCount} pinned</span>
            </span>
          )}
          <Button onClick={onNewNote} size="sm" className="gap-1.5 shadow-xs">
            <Plus className="size-4" />
            <span>New Note</span>
          </Button>
        </div>
      }
    />
  );
}
