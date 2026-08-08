import {
  LayoutDashboard,
  FolderKanban,
  CalendarDays,
  CheckSquare,
  Repeat2,
  Timer,
  BarChart3,
  FileText,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Optional badge label/count to display on the nav item */
  badge?: string | number;
  /** When true, the item is non-interactive and visually dimmed */
  disabled?: boolean;
  /** When true, renders a "Soon" pill — item remains non-interactive */
  soon?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Habits",
    href: "/habits",
    icon: Repeat2,
  },
  {
    label: "Focus",
    href: "/focus",
    icon: Timer,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Notes",
    href: "/notes",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];
