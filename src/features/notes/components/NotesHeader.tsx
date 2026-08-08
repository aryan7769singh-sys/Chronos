"use client";

import { FileText, Pin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NoteStats } from "../types";

interface NotesHeaderProps {
  stats: NoteStats;
  onNewNote: () => void;
}

export function NotesHeader({ stats, onNewNote }: NotesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <FileText className="size-4.5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Notes & Knowledge Hub
          </h1>
        </div>
        <p className="text-xs text-muted-foreground">
          Capture ideas, meeting notes, study thoughts, and project references linked to your workflow.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground border border-border/50">
            <strong>{stats.totalActiveNotes}</strong> notes
          </span>
          {stats.pinnedCount > 0 && (
            <span className="px-2 py-1 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 flex items-center gap-1">
              <Pin className="size-3" />
              <strong>{stats.pinnedCount}</strong> pinned
            </span>
          )}
        </div>

        <Button onClick={onNewNote} size="sm" className="gap-1.5 shadow-xs">
          <Plus className="size-4" />
          <span>New Note</span>
        </Button>
      </div>
    </div>
  );
}
