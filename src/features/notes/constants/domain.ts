import {
  FileText,
  Lightbulb,
  Users,
  BookOpen,
  Search,
  BookMarked,
  FolderKanban,
  Bookmark,
  type LucideIcon,
} from "lucide-react";
import type { NoteCategory, NoteColor } from "../types";

export interface NoteCategoryMeta {
  category: NoteCategory;
  label: string;
  icon: LucideIcon;
  iconName: string;
  color: NoteColor;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const NOTE_CATEGORIES: NoteCategory[] = [
  "general",
  "idea",
  "meeting",
  "study",
  "research",
  "journal",
  "project",
  "reference",
];

export const NOTE_CATEGORY_METADATA: Record<NoteCategory, NoteCategoryMeta> = {
  general: {
    category: "general",
    label: "General",
    icon: FileText,
    iconName: "FileText",
    color: "violet",
    bgClass: "bg-violet-500/10 dark:bg-violet-500/20",
    textClass: "text-violet-600 dark:text-violet-400",
    borderClass: "border-violet-500/20",
  },
  idea: {
    category: "idea",
    label: "Idea",
    icon: Lightbulb,
    iconName: "Lightbulb",
    color: "amber",
    bgClass: "bg-amber-500/10 dark:bg-amber-500/20",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-amber-500/20",
  },
  meeting: {
    category: "meeting",
    label: "Meeting",
    icon: Users,
    iconName: "Users",
    color: "blue",
    bgClass: "bg-blue-500/10 dark:bg-blue-500/20",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-blue-500/20",
  },
  study: {
    category: "study",
    label: "Study",
    icon: BookOpen,
    iconName: "BookOpen",
    color: "emerald",
    bgClass: "bg-emerald-500/10 dark:bg-emerald-500/20",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-emerald-500/20",
  },
  research: {
    category: "research",
    label: "Research",
    icon: Search,
    iconName: "Search",
    color: "cyan",
    bgClass: "bg-cyan-500/10 dark:bg-cyan-500/20",
    textClass: "text-cyan-600 dark:text-cyan-400",
    borderClass: "border-cyan-500/20",
  },
  journal: {
    category: "journal",
    label: "Journal",
    icon: BookMarked,
    iconName: "BookMarked",
    color: "rose",
    bgClass: "bg-rose-500/10 dark:bg-rose-500/20",
    textClass: "text-rose-600 dark:text-rose-400",
    borderClass: "border-rose-500/20",
  },
  project: {
    category: "project",
    label: "Project",
    icon: FolderKanban,
    iconName: "FolderKanban",
    color: "indigo",
    bgClass: "bg-indigo-500/10 dark:bg-indigo-500/20",
    textClass: "text-indigo-600 dark:text-indigo-400",
    borderClass: "border-indigo-500/20",
  },
  reference: {
    category: "reference",
    label: "Reference",
    icon: Bookmark,
    iconName: "Bookmark",
    color: "orange",
    bgClass: "bg-orange-500/10 dark:bg-orange-500/20",
    textClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-orange-500/20",
  },
};

export const ALLOWED_NOTE_COLORS: NoteColor[] = [
  "violet",
  "blue",
  "emerald",
  "amber",
  "rose",
  "cyan",
  "indigo",
  "orange",
];

export function getNoteCategoryMetadata(category?: string | null): NoteCategoryMeta {
  if (!category || !(category in NOTE_CATEGORY_METADATA)) {
    return NOTE_CATEGORY_METADATA.general;
  }
  return NOTE_CATEGORY_METADATA[category as NoteCategory];
}
