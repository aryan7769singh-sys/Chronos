/**
 * prisma/seed.ts
 *
 * Development seed script for the Chronos database.
 *
 * Data mirrors src/features/tasks/constants/mockData.ts so the application
 * looks identical after switching from in-memory mock data to PostgreSQL.
 *
 * IDs are specified explicitly (matching the mock data IDs) so that
 * existing development URLs (/projects/proj-1, etc.) remain valid.
 *
 * Strategy: upsert with `update: {}` — on conflict do nothing.
 * This makes the script fully idempotent: safe to run multiple times.
 *
 * NOTE: No User is seeded. The User model will be introduced in the
 * Authentication milestone, at which point a migration will link projects
 * to real authenticated users.
 */

import "dotenv/config";
import { PrismaClient, ProjectHealth, ProjectStatus, TaskStatus, Priority } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helper: days from now
// ---------------------------------------------------------------------------

function daysFromNow(n: number): Date {
  return new Date(Date.now() + n * 24 * 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

async function main() {
  console.log("🌱 Seeding Chronos database…");

  // --- Development User ---------------------------------------------------

  await prisma.user.upsert({
    where: { id: "user-dev-1" },
    update: {},
    create: {
      id: "user-dev-1",
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
    },
  });

  // --- Projects -----------------------------------------------------------

  await prisma.project.upsert({
    where: { id: "proj-1" },
    update: {},
    create: {
      id: "proj-1",
      userId: "user-dev-1",
      name: "Chronos App",
      description:
        "A personal productivity OS with tasks, habits, focus timers, analytics, and AI-powered insights.",
      color: "violet",
      icon: "Layers",
      status: ProjectStatus.active,
      priority: Priority.urgent,
      deadline: daysFromNow(90),
      health: ProjectHealth.on_track,
    },
  });

  await prisma.project.upsert({
    where: { id: "proj-2" },
    update: {},
    create: {
      id: "proj-2",
      userId: "user-dev-1",
      name: "Portfolio Website",
      description:
        "Personal portfolio showcasing projects, skills, writing, and open source contributions.",
      color: "blue",
      icon: "Globe",
      status: ProjectStatus.active,
      priority: Priority.high,
      deadline: daysFromNow(21),
      health: ProjectHealth.at_risk,
    },
  });

  await prisma.project.upsert({
    where: { id: "proj-3" },
    update: {},
    create: {
      id: "proj-3",
      userId: "user-dev-1",
      name: "API Client Library",
      description:
        "Typed HTTP client library with middleware support, rate limiting, retries, and auto-generated docs.",
      color: "amber",
      icon: "Package",
      status: ProjectStatus.paused,
      priority: Priority.medium,
      deadline: daysFromNow(60),
      health: ProjectHealth.off_track,
    },
  });

  await prisma.project.upsert({
    where: { id: "proj-4" },
    update: {},
    create: {
      id: "proj-4",
      userId: "user-dev-1",
      name: "Team Dashboard",
      description:
        "Internal analytics dashboard for tracking team velocity, sprint health, and deployment metrics.",
      color: "emerald",
      icon: "LayoutDashboard",
      status: ProjectStatus.completed,
      priority: Priority.high,
      deadline: daysFromNow(-7),
      health: ProjectHealth.on_track,
    },
  });

  // --- Tasks: proj-1 (Chronos App) ----------------------------------------

  await prisma.task.upsert({
    where: { id: "task-1-1" },
    update: {},
    create: {
      id: "task-1-1",
      projectId: "proj-1",
      title: "Application Shell",
      description:
        "Implement the core layout: collapsible sidebar, sticky header, theme system, and placeholder pages for all routes.",
      status: TaskStatus.done,
      priority: Priority.urgent,
      estimatedDuration: 480,
      actualDuration: 510,
      deadline: daysFromNow(-7),
      currentStep: "Completed.",
      tags: ["frontend", "shell", "layout"],
      notes:
        "Sidebar collapse toggle and hydration mismatch on theme toggle were the two bugs fixed post-implementation.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-1-2" },
    update: {},
    create: {
      id: "task-1-2",
      projectId: "proj-1",
      title: "Dashboard UI",
      description:
        "Build the hybrid dashboard layout: welcome hero, today's focus, task list, habit summary, mini calendar, quick actions.",
      status: TaskStatus.done,
      priority: Priority.high,
      estimatedDuration: 360,
      actualDuration: 380,
      deadline: daysFromNow(-3),
      currentStep: "Completed.",
      tags: ["frontend", "dashboard", "ui"],
      notes:
        "All 8 widgets implemented with mock data. Lint and responsive verified.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-1-3" },
    update: {},
    create: {
      id: "task-1-3",
      projectId: "proj-1",
      title: "Project & Task Domain",
      description:
        "Design and implement the core Project → Task → Subtask hierarchy with types, mock data, and full CRUD UI.",
      status: TaskStatus.done,
      priority: Priority.urgent,
      estimatedDuration: 480,
      actualDuration: 490,
      deadline: daysFromNow(1),
      currentStep: "Completed.",
      tags: ["frontend", "domain", "tasks"],
      notes:
        "Navigation updated. Types, domain constants, utils, mock data, and all pages complete.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-1-4" },
    update: {},
    create: {
      id: "task-1-4",
      projectId: "proj-1",
      title: "Database & Persistence",
      description:
        "Replace mock data with Prisma + PostgreSQL. Service layer, migrations, and seed script.",
      status: TaskStatus.in_progress,
      priority: Priority.urgent,
      estimatedDuration: 360,
      actualDuration: 0,
      deadline: daysFromNow(2),
      currentStep: "Run prisma migrate dev and prisma db seed.",
      tags: ["backend", "database", "prisma"],
      notes: "Schema, services, and seed complete. Awaiting migration run.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-1-5" },
    update: {},
    create: {
      id: "task-1-5",
      projectId: "proj-1",
      title: "Authentication System",
      description:
        "Implement sign-up, sign-in, password reset, and session management using NextAuth or a custom JWT strategy.",
      status: TaskStatus.backlog,
      priority: Priority.high,
      estimatedDuration: 600,
      actualDuration: 0,
      deadline: daysFromNow(30),
      currentStep: "Evaluate NextAuth v5 vs Lucia vs custom JWT.",
      tags: ["backend", "auth", "security"],
      notes: "",
    },
  });

  // --- Tasks: proj-2 (Portfolio Website) ------------------------------------

  await prisma.task.upsert({
    where: { id: "task-2-1" },
    update: {},
    create: {
      id: "task-2-1",
      projectId: "proj-2",
      title: "Homepage Redesign",
      description:
        "Redesign the hero section, skills grid, and CTA with a modern dark aesthetic inspired by Linear and Vercel.",
      status: TaskStatus.done,
      priority: Priority.high,
      estimatedDuration: 240,
      actualDuration: 260,
      deadline: daysFromNow(-10),
      currentStep: "Completed.",
      tags: ["design", "frontend"],
      notes:
        "Used CSS Grid for the skills section. Hero has a gradient mesh background.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-2-2" },
    update: {},
    create: {
      id: "task-2-2",
      projectId: "proj-2",
      title: "Projects Section",
      description:
        "Build a filterable project gallery with tech stack badges, live demo links, and GitHub integration.",
      status: TaskStatus.in_progress,
      priority: Priority.high,
      estimatedDuration: 180,
      actualDuration: 60,
      deadline: daysFromNow(5),
      currentStep: "Add filter logic for tech stack categories.",
      tags: ["frontend", "portfolio"],
      notes: "Project cards done. Filter UI in progress.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-2-3" },
    update: {},
    create: {
      id: "task-2-3",
      projectId: "proj-2",
      title: "Blog Integration",
      description:
        "Integrate MDX-based blog with syntax highlighting, reading time, and tag-based filtering.",
      status: TaskStatus.todo,
      priority: Priority.medium,
      estimatedDuration: 300,
      actualDuration: 0,
      deadline: daysFromNow(14),
      currentStep: "Set up Contentlayer or Velite for MDX processing.",
      tags: ["blog", "mdx", "content"],
      notes: "",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-2-4" },
    update: {},
    create: {
      id: "task-2-4",
      projectId: "proj-2",
      title: "SEO & Performance Audit",
      description:
        "Achieve Lighthouse score ≥95 on all pages: optimize images, meta tags, OG images, and Core Web Vitals.",
      status: TaskStatus.backlog,
      priority: Priority.medium,
      estimatedDuration: 120,
      actualDuration: 0,
      deadline: daysFromNow(19),
      currentStep: "Run initial Lighthouse audit to establish baseline.",
      tags: ["seo", "performance"],
      notes: "",
    },
  });

  // --- Tasks: proj-3 (API Client Library) ------------------------------------

  await prisma.task.upsert({
    where: { id: "task-3-1" },
    update: {},
    create: {
      id: "task-3-1",
      projectId: "proj-3",
      title: "Core HTTP Client",
      description:
        "Build the base fetch wrapper with typed request/response, timeout handling, and serialization.",
      status: TaskStatus.in_progress,
      priority: Priority.high,
      estimatedDuration: 360,
      actualDuration: 200,
      deadline: daysFromNow(14),
      currentStep:
        "Implement response deserialization with generic type inference.",
      tags: ["core", "http"],
      notes: "Request serialization complete. Response types in progress.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-3-2" },
    update: {},
    create: {
      id: "task-3-2",
      projectId: "proj-3",
      title: "Authentication Middleware",
      description:
        "Middleware plugin for Bearer token injection, automatic refresh, and 401 retry logic.",
      status: TaskStatus.blocked,
      priority: Priority.high,
      estimatedDuration: 240,
      actualDuration: 0,
      deadline: daysFromNow(21),
      currentStep:
        "Waiting for core HTTP client to stabilize before building on top of it.",
      tags: ["auth", "middleware"],
      notes: "Blocked on task-3-1.",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-3-3" },
    update: {},
    create: {
      id: "task-3-3",
      projectId: "proj-3",
      title: "Rate Limiting & Retry Logic",
      description:
        "Implement exponential backoff, configurable retry count, and per-endpoint rate limit headers.",
      status: TaskStatus.backlog,
      priority: Priority.medium,
      estimatedDuration: 180,
      actualDuration: 0,
      deadline: daysFromNow(35),
      currentStep: "Define the retry config interface.",
      tags: ["reliability", "core"],
      notes: "",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-3-4" },
    update: {},
    create: {
      id: "task-3-4",
      projectId: "proj-3",
      title: "API Documentation",
      description:
        "Auto-generate TypeDoc documentation with usage examples and a live playground.",
      status: TaskStatus.backlog,
      priority: Priority.low,
      estimatedDuration: 240,
      actualDuration: 0,
      deadline: daysFromNow(50),
      currentStep: "Evaluate TypeDoc vs TSDoc vs custom MDX docs.",
      tags: ["docs"],
      notes: "",
    },
  });

  // --- Tasks: proj-4 (Team Dashboard — all done) ----------------------------

  await prisma.task.upsert({
    where: { id: "task-4-1" },
    update: {},
    create: {
      id: "task-4-1",
      projectId: "proj-4",
      title: "Analytics Setup",
      description:
        "Integrate Mixpanel and set up custom event tracking for all user interactions.",
      status: TaskStatus.done,
      priority: Priority.high,
      estimatedDuration: 120,
      actualDuration: 100,
      deadline: daysFromNow(-21),
      currentStep: "Completed.",
      tags: ["analytics"],
      notes: "",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-4-2" },
    update: {},
    create: {
      id: "task-4-2",
      projectId: "proj-4",
      title: "User Management",
      description: "Role-based access control with admin, manager, and viewer roles.",
      status: TaskStatus.done,
      priority: Priority.high,
      estimatedDuration: 300,
      actualDuration: 280,
      deadline: daysFromNow(-14),
      currentStep: "Completed.",
      tags: ["auth", "admin"],
      notes: "",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-4-3" },
    update: {},
    create: {
      id: "task-4-3",
      projectId: "proj-4",
      title: "Reporting Module",
      description:
        "Weekly/monthly reports with CSV export, charts, and automated email delivery.",
      status: TaskStatus.done,
      priority: Priority.medium,
      estimatedDuration: 360,
      actualDuration: 390,
      deadline: daysFromNow(-10),
      currentStep: "Completed.",
      tags: ["reporting", "export"],
      notes: "",
    },
  });

  await prisma.task.upsert({
    where: { id: "task-4-4" },
    update: {},
    create: {
      id: "task-4-4",
      projectId: "proj-4",
      title: "Push Notifications",
      description:
        "Real-time alerts for build failures, deployment events, and SLA breaches.",
      status: TaskStatus.done,
      priority: Priority.medium,
      estimatedDuration: 180,
      actualDuration: 160,
      deadline: daysFromNow(-8),
      currentStep: "Completed.",
      tags: ["notifications", "realtime"],
      notes: "",
    },
  });

  // --- Subtasks (in-progress tasks only) ------------------------------------

  // task-1-3 subtasks (all done now that the task is done)
  const task13Subtasks = [
    { id: "sub-1-3-1", title: "Define types (Project, Task, Subtask)", completed: true },
    { id: "sub-1-3-2", title: "Create domain constants and color system", completed: true },
    { id: "sub-1-3-3", title: "Write mock data (4 projects, 16 tasks)", completed: true },
    { id: "sub-1-3-4", title: "Build ProjectCard and ProjectList", completed: true },
    { id: "sub-1-3-5", title: "Build ProjectDetails and TaskList", completed: true },
    { id: "sub-1-3-6", title: "Build TaskDetails and SubtaskChecklist", completed: true },
    { id: "sub-1-3-7", title: "Wire up /projects, /projects/[id], /projects/[id]/[taskId] routes", completed: true },
  ];

  for (const s of task13Subtasks) {
    await prisma.subtask.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, taskId: "task-1-3", title: s.title, completed: s.completed },
    });
  }

  // task-1-4 subtasks (database & persistence — in progress)
  const task14Subtasks = [
    { id: "sub-1-4-1", title: "Install @prisma/client and prisma CLI", completed: true },
    { id: "sub-1-4-2", title: "Define Prisma schema (Project, Task, Subtask)", completed: true },
    { id: "sub-1-4-3", title: "Create Prisma singleton (src/lib/prisma.ts)", completed: true },
    { id: "sub-1-4-4", title: "Create service layer (project, task, user)", completed: true },
    { id: "sub-1-4-5", title: "Write idempotent seed script", completed: true },
    { id: "sub-1-4-6", title: "Run prisma migrate dev", completed: false },
    { id: "sub-1-4-7", title: "Run prisma db seed", completed: false },
    { id: "sub-1-4-8", title: "Update page routes to use services", completed: false },
    { id: "sub-1-4-9", title: "Verify all pages in browser", completed: false },
  ];

  for (const s of task14Subtasks) {
    await prisma.subtask.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, taskId: "task-1-4", title: s.title, completed: s.completed },
    });
  }

  // task-1-5 subtasks (authentication — backlog)
  const task15Subtasks = [
    { id: "sub-1-5-1", title: "Research auth strategies (NextAuth vs Lucia vs custom)", completed: false },
    { id: "sub-1-5-2", title: "Design session model in Prisma schema", completed: false },
    { id: "sub-1-5-3", title: "Implement sign-in / sign-up flows", completed: false },
    { id: "sub-1-5-4", title: "Add middleware route protection", completed: false },
  ];

  for (const s of task15Subtasks) {
    await prisma.subtask.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, taskId: "task-1-5", title: s.title, completed: s.completed },
    });
  }

  // task-2-2 subtasks (Portfolio — Projects Section)
  const task22Subtasks = [
    { id: "sub-2-2-1", title: "Design project card component", completed: true },
    { id: "sub-2-2-2", title: "Build project card with tech stack badges", completed: true },
    { id: "sub-2-2-3", title: "Add filter tabs (All, Frontend, Backend, Design)", completed: false },
    { id: "sub-2-2-4", title: "Connect GitHub API for live stats", completed: false },
    { id: "sub-2-2-5", title: "Responsive layout and dark mode", completed: false },
  ];

  for (const s of task22Subtasks) {
    await prisma.subtask.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, taskId: "task-2-2", title: s.title, completed: s.completed },
    });
  }

  // task-3-1 subtasks (Core HTTP Client)
  const task31Subtasks = [
    { id: "sub-3-1-1", title: "Define base RequestConfig interface", completed: true },
    { id: "sub-3-1-2", title: "Implement GET and POST methods", completed: true },
    { id: "sub-3-1-3", title: "Add timeout and abort controller support", completed: false },
    { id: "sub-3-1-4", title: "Generic response deserialization with type inference", completed: false },
    { id: "sub-3-1-5", title: "Error handling and typed error responses", completed: false },
  ];

  for (const s of task31Subtasks) {
    await prisma.subtask.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, taskId: "task-3-1", title: s.title, completed: s.completed },
    });
  }

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
