"use client";

import Link from "next/link";
import { FileText, ArrowRight, Pin, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import type { NoteWithRelations } from "@/features/notes/types";
import { getNoteCategoryMetadata } from "@/features/notes/constants/domain";
import { cn } from "@/lib/utils";

interface RecentNotesProps {
  notes: NoteWithRelations[];
}

export function RecentNotes({ notes }: RecentNotesProps) {
  const displayNotes = notes.slice(0, 4);

  return (
    <Card className="border-border/60 bg-card/60 backdrop-blur-xs shadow-xs">
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <span>Knowledge & Notes</span>
        </CardTitle>
        <Link
          href="/notes"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-7 text-xs gap-1 text-muted-foreground hover:text-foreground")}
        >
          <span>View All</span>
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        {displayNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2 border border-dashed border-border/60 rounded-lg bg-card/30">
            <p className="text-xs text-muted-foreground">No notes captured yet.</p>
            <Link
              href="/notes"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 text-xs gap-1")}
            >
              <Plus className="size-3" />
              <span>Add First Note</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {displayNotes.map((n) => {
              const meta = getNoteCategoryMetadata(n.category);
              const Icon = meta.icon;
              return (
                <Link
                  key={n.id}
                  href="/notes"
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-card/40 hover:bg-card hover:border-border transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={cn("size-6 rounded-md flex items-center justify-center shrink-0 text-[10px]", meta.bgClass, meta.textClass)}>
                      <Icon className="size-3" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {n.pinned && <Pin className="size-2.5 text-primary fill-primary shrink-0" />}
                        <p className="text-xs font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {n.title}
                        </p>
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {formatDistanceToNow(new Date(n.updatedAt), { addSuffix: true })}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
