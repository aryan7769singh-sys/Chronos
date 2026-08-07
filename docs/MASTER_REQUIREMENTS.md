# Chronos — Master Requirements
Version: 1.0
Status: Active
Last Updated: 2026-08-08

---

# 1. Purpose

Chronos is a personal productivity operating system.

It is not simply a task manager, calendar, or habit tracker.

Its purpose is to become a single intelligent workspace where planning, execution, tracking, focus, analytics, and AI assistance work together.

Every implementation decision should move the application closer to this goal.

---

# 2. Core Philosophy

Chronos should feel like a calm command center.

Users should always know:

- what deserves attention now
- what can wait
- what has changed
- how much progress has been made

The application should reduce mental overhead instead of creating more.

---

# 3. Product Principles

Every feature must satisfy these principles.

## 3.1 Intelligent

The application should understand user intent whenever possible instead of acting as passive storage.

Examples:

- suggest task breakdowns
- recommend priorities
- analyze productivity
- generate insights

---

## 3.2 Modular

Every feature must be independent.

Removing one feature should not break another.

---

## 3.3 Fast

Performance is a feature.

Animations should never reduce responsiveness.

---

## 3.4 Consistent

Every page should feel like part of the same product.

Spacing

Typography

Components

Interactions

Naming

must remain consistent.

---

# 4. Non-Negotiable Technical Decisions

These decisions must not be changed without explicit approval.

Framework

- Next.js (App Router)

Language

- TypeScript

Styling

- Tailwind CSS

UI Library

- shadcn/ui

Icons

- Lucide React

Animation

- Framer Motion

Database

- PostgreSQL

ORM

- Prisma

State Management

- Zustand

Validation

- Zod

Forms

- React Hook Form

Date Utilities

- date-fns

---

# 5. Project Structure

The following structure is the source of truth.

src/

app/

components/

features/

hooks/

lib/

store/

services/

styles/

types/

utils/

constants/

assets/

Every new file must belong to the correct module.

---

# 6. Architecture

Chronos follows Feature-First Architecture.

Each feature owns its:

components

hooks

services

types

constants

utils

Avoid placing feature-specific code inside global folders.

---

# 7. Naming Conventions

Components

PascalCase

Example

TaskCard.tsx

Hooks

camelCase

useTask.ts

Types

PascalCase

Task.ts

Interfaces

Prefix with I only if required.

Prefer descriptive names.

Avoid abbreviations.

---

# 8. Design Philosophy

The interface should feel:

minimal

focused

professional

premium

Modern software inspirations include:

Linear

Raycast

Arc

Apple

Vercel

Avoid visual clutter.

---

# 9. UI Rules

Every screen should have:

clear hierarchy

consistent spacing

responsive layout

accessible interactions

dark mode support

Avoid unnecessary colors.

Whitespace is preferred over separators.

---

# 10. Animation Rules

Animations should support usability.

Do not animate simply because it looks interesting.

Recommended durations:

150–250ms

Use easing consistently.

Prefer subtle motion.

---

# 11. Code Quality

Every implementation should:

use reusable components

avoid duplicated logic

avoid magic numbers

avoid unnecessary dependencies

prefer composition over inheritance

use strict typing

No "any" unless absolutely unavoidable.

---

# 12. AI Development Workflow

Every AI assistant working on Chronos must:

1. Read this document first.
2. Follow existing architecture.
3. Never restructure the project.
4. Never rename folders.
5. Never replace libraries without approval.
6. Extend existing systems instead of rewriting them.
7. Explain additional package requirements before using them.

---

# 13. Git Workflow

Every milestone should end with a commit.

Commit messages should describe completed work.

Examples

feat: application shell

feat: dashboard layout

feat: task management

fix: calendar rendering

Avoid large unrelated commits.

---

# 14. Documentation

Every major feature should update:

Architecture

Roadmap

Database

API

when applicable.

Documentation is part of development.

---

# 15. Performance Goals

Initial load should remain lightweight.

Avoid unnecessary re-renders.

Prefer lazy loading when appropriate.

Optimize before adding complexity.

---

# 16. Security Principles

Never expose secrets.

Validate all external input.

Sanitize user content.

Never trust client-side data.

---

# 17. Future Expansion

Chronos should support future integrations without major rewrites.

Potential integrations include:

Google Calendar

GitHub

Discord

Slack

Gemini

OpenAI

Claude

Desktop Companion

Wallpaper Widgets

Screen-Time Analytics

Voice Assistant

Current implementations should remain extensible.

---

# 18. Definition of Done

A feature is complete only if:

- functionality works
- responsive layout works
- dark mode works
- TypeScript passes
- lint passes
- documentation updated (if needed)
- no obvious code duplication
- code follows this document

---

End of Version 1.0