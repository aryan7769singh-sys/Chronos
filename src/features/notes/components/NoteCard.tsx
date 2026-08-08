"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  Pin,
  Archive,
  Trash2,
  FolderKanban,
  CheckSquare,
  MoreVertical,
  Edit3,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { NoteWithRelations } from "../types";
import { getNoteCategoryMetadata } from "../constants/domain";
import { cn } from "@/lib/utils";

interface NoteCardProps {
  note: NoteWithRelations;
  onEdit: (note: NoteWithRelations) => void;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  viewMode?: "grid" | "list";
}

export function NoteCard({
  note,
  onEdit,
  onTogglePin,
  onArchive,
  onDelete,
  viewMode = "grid",
}: NoteCardProps) {
  const [isPending, setIsPending] = useState(false);
  const meta = getNoteCategoryMetadata(note.category);
  const Icon = meta.icon;

  const handleAction = async (actionFn: () => Promise<void>) => {
    try {
      setIsPending(true);
      await actionFn();
    } finally {
      setIsPending(false);
    }
  };

  const updatedAgo = formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true });

  if (viewMode === "list") {
    return (
      <Card
        onClick={() => onEdit(note)}
        className={cn(
          "group relative cursor-pointer border-border/60 bg-card/60 hover:bg-card hover:border-border transition-all shadow-xs",
          note.pinned && "border-violet-500/40 bg-violet-500/5 dark:bg-violet-500/10",
          isPending && "opacity-60 pointer-events-none"
        )}
      >
        <CardContent className="p-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={cn("size-7 rounded-md flex items-center justify-center shrink-0", meta.bgClass, meta.textClass)}>
              <Icon className="size-3.5" />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2">
                {note.pinned && (
                  <Pin className="size-3 text-violet-500 fill-violet-500 shrink-0" />
                )}
                <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  {note.title}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {note.content || "No content"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {note.project && (
              <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0.2">
                <FolderKanban className="size-2.5 text-violet-500" />
                <span className="truncate max-w-[100px]">{note.project.name}</span>
              </Badge>
            )}

            {note.task && (
              <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0.2">
                <CheckSquare className="size-2.5 text-emerald-500" />
                <span className="truncate max-w-[100px]">{note.task.title}</span>
              </Badge>
            )}

            <span className="text-[11px] text-muted-foreground hidden md:inline">
              {updatedAgo}
            </span>

            <div onClick={(e) => e.stopPropagation()}>
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "size-7 opacity-0 group-hover:opacity-100 transition-opacity")}>
                  <MoreVertical className="size-3.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36 text-xs">
                  <DropdownMenuItem onClick={() => onEdit(note)}>
                    <Edit3 className="size-3.5 mr-2" />
                    <span>Edit</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction(async () => onTogglePin(note.id))}>
                    <Pin className="size-3.5 mr-2" />
                    <span>{note.pinned ? "Unpin" : "Pin"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction(async () => onArchive(note.id))}>
                    <Archive className="size-3.5 mr-2" />
                    <span>{note.archived ? "Unarchive" : "Archive"}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleAction(async () => onDelete(note.id))}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-3.5 mr-2" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      onClick={() => onEdit(note)}
      className={cn(
        "group relative cursor-pointer border-border/60 bg-card/60 hover:bg-card hover:border-border transition-all shadow-xs flex flex-col justify-between h-[180px]",
        note.pinned && "border-violet-500/40 bg-violet-500/5 dark:bg-violet-500/10",
        isPending && "opacity-60 pointer-events-none"
      )}
    >
      <CardContent className="p-4 flex flex-col h-full justify-between space-y-3">
        {/* Card Header: Category badge & Pinned button / Dropdown */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                meta.bgClass,
                meta.textClass,
                meta.borderClass
              )}
            >
              <Icon className="size-3" />
              <span>{meta.label}</span>
            </span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon-xs"
              className={cn(
                "size-7 transition-opacity",
                note.pinned ? "text-violet-500 opacity-100" : "opacity-0 group-hover:opacity-100"
              )}
              onClick={() => handleAction(async () => onTogglePin(note.id))}
              title={note.pinned ? "Unpin note" : "Pin note"}
            >
              <Pin className={cn("size-3.5", note.pinned && "fill-violet-500")} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon-xs" }), "size-7 opacity-0 group-hover:opacity-100 transition-opacity")}>
                <MoreVertical className="size-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36 text-xs">
                <DropdownMenuItem onClick={() => onEdit(note)}>
                  <Edit3 className="size-3.5 mr-2" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(async () => onTogglePin(note.id))}>
                  <Pin className="size-3.5 mr-2" />
                  <span>{note.pinned ? "Unpin" : "Pin"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction(async () => onArchive(note.id))}>
                  <Archive className="size-3.5 mr-2" />
                  <span>{note.archived ? "Unarchive" : "Archive"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAction(async () => onDelete(note.id))}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="size-3.5 mr-2" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Title & Excerpt */}
        <div className="space-y-1.5 flex-1 min-h-0">
          <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
            {note.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
            {note.content || "No content"}
          </p>
        </div>

        {/* Card Footer: Linked Project / Task Badges & Timestamp */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5 overflow-hidden max-w-[70%]">
            {note.project && (
              <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 truncate font-normal">
                <FolderKanban className="size-2.5 text-violet-500 shrink-0" />
                <span className="truncate">{note.project.name}</span>
              </Badge>
            )}
            {note.task && (
              <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0 truncate font-normal">
                <CheckSquare className="size-2.5 text-emerald-500 shrink-0" />
                <span className="truncate">{note.task.title}</span>
              </Badge>
            )}
          </div>
          <span className="shrink-0">{updatedAgo}</span>
        </div>
      </CardContent>
    </Card>
  );
}
