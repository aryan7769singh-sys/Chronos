"use client";

import Link from "next/link";
import { FileText, Plus, Pin, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { NoteWithRelations } from "../types";
import { getNoteCategoryMetadata } from "../constants/domain";
import { cn } from "@/lib/utils";

interface TaskNotesSectionProps {
  notes: NoteWithRelations[];
  taskId: string;
}

export function TaskNotesSection({ notes }: TaskNotesSectionProps) {
  const displayNotes = notes.slice(0, 3);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileText className="size-4 text-emerald-500" />
          <span>Task Notes & Specifications ({notes.length})</span>
        </CardTitle>
        <Link
          href="/notes"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 text-xs gap-1 text-muted-foreground hover:text-foreground")}
        >
          <span>Notes Hub</span>
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {displayNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center space-y-2 border border-dashed border-border/60 rounded-lg bg-card/30">
            <p className="text-xs text-muted-foreground">No notes linked to this task yet.</p>
            <Link
              href="/notes"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs gap-1")}
            >
              <Plus className="size-3" />
              <span>Attach Note to Task</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {displayNotes.map((n) => {
              const meta = getNoteCategoryMetadata(n.category);
              const Icon = meta.icon;
              return (
                <Link
                  key={n.id}
                  href="/notes"
                  className="p-3 rounded-lg border border-border/40 bg-card/40 hover:bg-card hover:border-border transition-colors space-y-1.5 flex flex-col justify-between group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold border", meta.bgClass, meta.textClass, meta.borderClass)}>
                        <Icon className="size-2.5" />
                        <span>{meta.label}</span>
                      </span>
                      {n.pinned && <Pin className="size-3 text-violet-500 fill-violet-500 shrink-0" />}
                    </div>
                    <h4 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      {n.content || "No content"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
