"use client";

import { useState } from "react";
import { Command, Pencil, Check, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { ShortcutItem } from "../types";
import { DEFAULT_KEYBOARD_SHORTCUTS } from "../constants/domain";
import { cn } from "@/lib/utils";

interface ShortcutsSettingsSectionProps {
  shortcuts: ShortcutItem[];
  onChange: (customMap: Record<string, string>) => void;
}

const CATEGORY_LABELS: Record<ShortcutItem["category"], string> = {
  focus: "Focus & Timer",
  navigation: "Navigation & UI",
  creation: "Quick Creation",
  overlay: "Command Overlay",
};

const CATEGORY_COLORS: Record<ShortcutItem["category"], string> = {
  focus: "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20",
  navigation: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  creation: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  overlay: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

export function ShortcutsSettingsSection({
  shortcuts,
  onChange,
}: ShortcutsSettingsSectionProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = (item: ShortcutItem) => {
    setEditingId(item.id);
    setEditValue(item.key);
  };

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) return;
    const currentMap: Record<string, string> = {};
    for (const s of shortcuts) {
      currentMap[s.id] = s.id === id ? editValue.trim() : s.key;
    }
    onChange(currentMap);
    setEditingId(null);
  };

  const handleResetShortcuts = () => {
    const defaultMap: Record<string, string> = {};
    for (const s of DEFAULT_KEYBOARD_SHORTCUTS) {
      defaultMap[s.id] = s.key;
    }
    onChange(defaultMap);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-base font-bold text-foreground">Keyboard Shortcuts Registry</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            View and customize system hotkeys across Focus sessions, quick creation, and navigation.
          </p>
        </div>
        <Button
          id="shortcut-reset-btn"
          size="sm"
          variant="outline"
          onClick={handleResetShortcuts}
          className="gap-1.5 text-xs text-muted-foreground"
        >
          <RotateCcw className="size-3.5" />
          Reset Shortcuts
        </Button>
      </div>

      {/* Shortcuts List */}
      <div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden divide-y divide-border/40">
        {shortcuts.map((item) => {
          const isEditing = editingId === item.id;
          return (
            <div
              key={item.id}
              className="p-3.5 flex items-center justify-between gap-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <Command className="size-4 text-violet-500 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">{item.label}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[9px] uppercase font-semibold", CATEGORY_COLORS[item.category])}
                    >
                      {CATEGORY_LABELS[item.category]}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                </div>
              </div>

              {/* Key badge & edit */}
              <div className="flex items-center gap-2 shrink-0">
                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <Input
                      id={`shortcut-input-${item.id}`}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEdit(item.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="h-7 w-24 text-xs text-center font-mono font-bold uppercase"
                      autoFocus
                    />
                    <Button
                      id={`shortcut-save-${item.id}`}
                      size="xs"
                      onClick={() => handleSaveEdit(item.id)}
                      className="h-7 px-2 text-xs"
                    >
                      <Check className="size-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <kbd className="px-2.5 py-1 rounded-md border border-border bg-muted/60 text-xs font-mono font-bold text-foreground shadow-2xs">
                      {item.key}
                    </kbd>
                    {item.editable ? (
                      <Button
                        id={`shortcut-edit-${item.id}`}
                        size="icon"
                        variant="ghost"
                        onClick={() => handleStartEdit(item)}
                        className="size-7 text-muted-foreground hover:text-foreground"
                        aria-label={`Edit ${item.label} shortcut`}
                      >
                        <Pencil className="size-3" />
                      </Button>
                    ) : (
                      <span className="size-7 flex items-center justify-center text-muted-foreground/40" title="Fixed system key">
                        <Lock className="size-3" />
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
