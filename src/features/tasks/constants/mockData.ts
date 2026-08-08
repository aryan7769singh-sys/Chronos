import type { Project, Task, Subtask } from "../types";

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------

export const MOCK_PROJECTS: Project[] = [
  {
    id: "proj-1",
    name: "Chronos App",
    description:
      "A personal productivity OS with tasks, habits, focus timers, analytics, and AI-powered insights.",
    color: "violet",
    icon: "Layers",
    status: "active",
    priority: "urgent",
    deadline: new Date(Date.now() + 90 * 86400000).toISOString(),
    progress: 38,
    health: "on-track",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "proj-2",
    name: "Portfolio Website",
    description:
      "Personal portfolio showcasing projects, skills, writing, and open source contributions.",
    color: "blue",
    icon: "Globe",
    status: "active",
    priority: "high",
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    progress: 61,
    health: "at-risk",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "proj-3",
    name: "API Client Library",
    description:
      "Typed HTTP client library with middleware support, rate limiting, retries, and auto-generated docs.",
    color: "amber",
    icon: "Package",
    status: "paused",
    priority: "medium",
    deadline: new Date(Date.now() + 60 * 86400000).toISOString(),
    progress: 22,
    health: "off-track",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "proj-4",
    name: "Team Dashboard",
    description:
      "Internal analytics dashboard for tracking team velocity, sprint health, and deployment metrics.",
    color: "emerald",
    icon: "LayoutDashboard",
    status: "completed",
    priority: "high",
    deadline: new Date(Date.now() - 7 * 86400000).toISOString(),
    progress: 100,
    health: "on-track",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const MOCK_TASKS: Task[] = [
  // --- Chronos App (proj-1) ---
  {
    id: "task-1-1",
    projectId: "proj-1",
    title: "Application Shell",
    description:
      "Implement the core layout: collapsible sidebar, sticky header, theme system, and placeholder pages for all routes.",
    status: "done",
    priority: "urgent",
    estimatedDuration: 480,
    actualDuration: 510,
    deadline: new Date(Date.now() - 7 * 86400000).toISOString(),
    progress: 100,
    currentStep: "Completed.",
    tags: ["frontend", "shell", "layout"],
    notes:
      "Sidebar collapse toggle and hydration mismatch on theme toggle were the two bugs fixed post-implementation.",
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
  },
  {
    id: "task-1-2",
    projectId: "proj-1",
    title: "Dashboard UI",
    description:
      "Build the hybrid dashboard layout: welcome hero, today's focus, task list, habit summary, mini calendar, quick actions.",
    status: "done",
    priority: "high",
    estimatedDuration: 360,
    actualDuration: 380,
    deadline: new Date(Date.now() - 3 * 86400000).toISOString(),
    progress: 100,
    currentStep: "Completed.",
    tags: ["frontend", "dashboard", "ui"],
    notes: "All 8 widgets implemented with mock data. Lint and responsive verified.",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "task-1-3",
    projectId: "proj-1",
    title: "Project & Task Domain",
    description:
      "Design and implement the core Project → Task → Subtask hierarchy with types, mock data, and full CRUD UI.",
    status: "in-progress",
    priority: "urgent",
    estimatedDuration: 480,
    actualDuration: 120,
    deadline: new Date(Date.now() + 1 * 86400000).toISOString(),
    progress: 45,
    currentStep: "Implement TaskDetails page and SubtaskChecklist component.",
    tags: ["frontend", "domain", "tasks"],
    notes: "Navigation updated. Types, domain constants, utils, and mock data complete.",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "task-1-4",
    projectId: "proj-1",
    title: "Authentication System",
    description:
      "Implement sign-up, sign-in, password reset, and session management using NextAuth or a custom JWT strategy.",
    status: "backlog",
    priority: "high",
    estimatedDuration: 600,
    actualDuration: 0,
    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    progress: 0,
    currentStep: "Evaluate NextAuth v5 vs Lucia vs custom JWT.",
    tags: ["backend", "auth", "security"],
    notes: "",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },

  // --- Portfolio Website (proj-2) ---
  {
    id: "task-2-1",
    projectId: "proj-2",
    title: "Homepage Redesign",
    description:
      "Redesign the hero section, skills grid, and CTA with a modern dark aesthetic inspired by Linear and Vercel.",
    status: "done",
    priority: "high",
    estimatedDuration: 240,
    actualDuration: 260,
    deadline: new Date(Date.now() - 10 * 86400000).toISOString(),
    progress: 100,
    currentStep: "Completed.",
    tags: ["design", "frontend"],
    notes: "Used CSS Grid for the skills section. Hero has a gradient mesh background.",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "task-2-2",
    projectId: "proj-2",
    title: "Projects Section",
    description:
      "Build a filterable project gallery with tech stack badges, live demo links, and GitHub integration.",
    status: "in-progress",
    priority: "high",
    estimatedDuration: 180,
    actualDuration: 60,
    deadline: new Date(Date.now() + 5 * 86400000).toISOString(),
    progress: 55,
    currentStep: "Add filter logic for tech stack categories.",
    tags: ["frontend", "portfolio"],
    notes: "Project cards done. Filter UI in progress.",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: "task-2-3",
    projectId: "proj-2",
    title: "Blog Integration",
    description:
      "Integrate MDX-based blog with syntax highlighting, reading time, and tag-based filtering.",
    status: "todo",
    priority: "medium",
    estimatedDuration: 300,
    actualDuration: 0,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    progress: 0,
    currentStep: "Set up Contentlayer or Velite for MDX processing.",
    tags: ["blog", "mdx", "content"],
    notes: "",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: "task-2-4",
    projectId: "proj-2",
    title: "SEO & Performance Audit",
    description:
      "Achieve Lighthouse score ≥95 on all pages: optimize images, meta tags, OG images, and Core Web Vitals.",
    status: "backlog",
    priority: "medium",
    estimatedDuration: 120,
    actualDuration: 0,
    deadline: new Date(Date.now() + 19 * 86400000).toISOString(),
    progress: 0,
    currentStep: "Run initial Lighthouse audit to establish baseline.",
    tags: ["seo", "performance"],
    notes: "",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },

  // --- API Client Library (proj-3) ---
  {
    id: "task-3-1",
    projectId: "proj-3",
    title: "Core HTTP Client",
    description:
      "Build the base fetch wrapper with typed request/response, timeout handling, and serialization.",
    status: "in-progress",
    priority: "high",
    estimatedDuration: 360,
    actualDuration: 200,
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    progress: 40,
    currentStep: "Implement response deserialization with generic type inference.",
    tags: ["core", "http"],
    notes: "Request serialization complete. Response types in progress.",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "task-3-2",
    projectId: "proj-3",
    title: "Authentication Middleware",
    description:
      "Middleware plugin for Bearer token injection, automatic refresh, and 401 retry logic.",
    status: "blocked",
    priority: "high",
    estimatedDuration: 240,
    actualDuration: 0,
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    progress: 0,
    currentStep: "Waiting for core HTTP client to stabilize before building on top of it.",
    tags: ["auth", "middleware"],
    notes: "Blocked on task-3-1.",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: "task-3-3",
    projectId: "proj-3",
    title: "Rate Limiting & Retry Logic",
    description:
      "Implement exponential backoff, configurable retry count, and per-endpoint rate limit headers.",
    status: "backlog",
    priority: "medium",
    estimatedDuration: 180,
    actualDuration: 0,
    deadline: new Date(Date.now() + 35 * 86400000).toISOString(),
    progress: 0,
    currentStep: "Define the retry config interface.",
    tags: ["reliability", "core"],
    notes: "",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: "task-3-4",
    projectId: "proj-3",
    title: "API Documentation",
    description:
      "Auto-generate TypeDoc documentation with usage examples and a live playground.",
    status: "backlog",
    priority: "low",
    estimatedDuration: 240,
    actualDuration: 0,
    deadline: new Date(Date.now() + 50 * 86400000).toISOString(),
    progress: 0,
    currentStep: "Evaluate TypeDoc vs TSDoc vs custom MDX docs.",
    tags: ["docs"],
    notes: "",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },

  // --- Team Dashboard (proj-4) ---
  {
    id: "task-4-1",
    projectId: "proj-4",
    title: "Analytics Setup",
    description: "Integrate Mixpanel and set up custom event tracking for all user interactions.",
    status: "done",
    priority: "high",
    estimatedDuration: 120,
    actualDuration: 100,
    deadline: new Date(Date.now() - 21 * 86400000).toISOString(),
    progress: 100,
    currentStep: "Completed.",
    tags: ["analytics"],
    notes: "",
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
  },
  {
    id: "task-4-2",
    projectId: "proj-4",
    title: "User Management",
    description: "Role-based access control with admin, manager, and viewer roles.",
    status: "done",
    priority: "high",
    estimatedDuration: 300,
    actualDuration: 280,
    deadline: new Date(Date.now() - 14 * 86400000).toISOString(),
    progress: 100,
    currentStep: "Completed.",
    tags: ["auth", "admin"],
    notes: "",
    createdAt: new Date(Date.now() - 55 * 86400000).toISOString(),
  },
  {
    id: "task-4-3",
    projectId: "proj-4",
    title: "Reporting Module",
    description: "Weekly/monthly reports with CSV export, charts, and automated email delivery.",
    status: "done",
    priority: "medium",
    estimatedDuration: 360,
    actualDuration: 390,
    deadline: new Date(Date.now() - 10 * 86400000).toISOString(),
    progress: 100,
    currentStep: "Completed.",
    tags: ["reporting", "export"],
    notes: "",
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
  },
  {
    id: "task-4-4",
    projectId: "proj-4",
    title: "Push Notifications",
    description: "Real-time alerts for build failures, deployment events, and SLA breaches.",
    status: "done",
    priority: "medium",
    estimatedDuration: 180,
    actualDuration: 160,
    deadline: new Date(Date.now() - 8 * 86400000).toISOString(),
    progress: 100,
    currentStep: "Completed.",
    tags: ["notifications", "realtime"],
    notes: "",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Subtasks
// ---------------------------------------------------------------------------

export const MOCK_SUBTASKS: Subtask[] = [
  // task-1-3 (Project & Task Domain — in-progress)
  { id: "sub-1-3-1", taskId: "task-1-3", title: "Define types (Project, Task, Subtask)", completed: true },
  { id: "sub-1-3-2", taskId: "task-1-3", title: "Create domain constants and color system", completed: true },
  { id: "sub-1-3-3", taskId: "task-1-3", title: "Write mock data (4 projects, 16 tasks)", completed: true },
  { id: "sub-1-3-4", taskId: "task-1-3", title: "Build ProjectCard and ProjectList", completed: false },
  { id: "sub-1-3-5", taskId: "task-1-3", title: "Build ProjectDetails and TaskList", completed: false },
  { id: "sub-1-3-6", taskId: "task-1-3", title: "Build TaskDetails and SubtaskChecklist", completed: false },
  { id: "sub-1-3-7", taskId: "task-1-3", title: "Wire up /projects, /projects/[id], /projects/[id]/[taskId] routes", completed: false },

  // task-1-4 (Authentication — backlog)
  { id: "sub-1-4-1", taskId: "task-1-4", title: "Research auth strategies (NextAuth vs Lucia vs custom)", completed: false },
  { id: "sub-1-4-2", taskId: "task-1-4", title: "Design session model in Prisma schema", completed: false },
  { id: "sub-1-4-3", taskId: "task-1-4", title: "Implement sign-in / sign-up flows", completed: false },
  { id: "sub-1-4-4", taskId: "task-1-4", title: "Add middleware route protection", completed: false },

  // task-2-2 (Portfolio — Projects Section, in-progress)
  { id: "sub-2-2-1", taskId: "task-2-2", title: "Design project card component", completed: true },
  { id: "sub-2-2-2", taskId: "task-2-2", title: "Build project card with tech stack badges", completed: true },
  { id: "sub-2-2-3", taskId: "task-2-2", title: "Add filter tabs (All, Frontend, Backend, Design)", completed: false },
  { id: "sub-2-2-4", taskId: "task-2-2", title: "Connect GitHub API for live stats", completed: false },
  { id: "sub-2-2-5", taskId: "task-2-2", title: "Responsive layout and dark mode", completed: false },

  // task-3-1 (Core HTTP Client — in-progress)
  { id: "sub-3-1-1", taskId: "task-3-1", title: "Define base RequestConfig interface", completed: true },
  { id: "sub-3-1-2", taskId: "task-3-1", title: "Implement GET and POST methods", completed: true },
  { id: "sub-3-1-3", taskId: "task-3-1", title: "Add timeout and abort controller support", completed: false },
  { id: "sub-3-1-4", taskId: "task-3-1", title: "Generic response deserialization with type inference", completed: false },
  { id: "sub-3-1-5", taskId: "task-3-1", title: "Error handling and typed error responses", completed: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns all tasks belonging to a project. */
export function getTasksByProject(projectId: string): Task[] {
  return MOCK_TASKS.filter((t) => t.projectId === projectId);
}

/** Returns all subtasks belonging to a task. */
export function getSubtasksByTask(taskId: string): Subtask[] {
  return MOCK_SUBTASKS.filter((s) => s.taskId === taskId);
}
