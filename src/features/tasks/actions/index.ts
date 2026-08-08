"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  toggleSubtask,
} from "@/services/task.service";
import {
  createProject,
  updateProject,
  deleteProject,
} from "@/services/project.service";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  CreateProjectInput,
  UpdateProjectInput,
  TaskStatus,
} from "../types";

// ---------------------------------------------------------------------------
// Project Server Actions
// ---------------------------------------------------------------------------

export async function createProjectAction(input: CreateProjectInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to create projects.");
  }

  if (!input.name || input.name.trim() === "") {
    throw new Error("Project name cannot be empty.");
  }

  const project = await createProject(session.user.id, input);

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return project;
}

export async function updateProjectAction(
  projectId: string,
  input: UpdateProjectInput
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update projects.");
  }

  if (input.name !== undefined && input.name.trim() === "") {
    throw new Error("Project name cannot be empty.");
  }

  const project = await updateProject(projectId, session.user.id, input);

  revalidatePath("/projects");
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  return project;
}

export async function deleteProjectAction(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to delete projects.");
  }

  await deleteProject(projectId, session.user.id);

  revalidatePath("/projects");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
}

// ---------------------------------------------------------------------------
// Task Server Actions
// ---------------------------------------------------------------------------

export async function createTaskAction(input: CreateTaskInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to create tasks.");
  }

  if (!input.title || input.title.trim() === "") {
    throw new Error("Task title cannot be empty.");
  }

  if (!input.projectId) {
    throw new Error("Please select a valid project for the task.");
  }

  const task = await createTask(session.user.id, input);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath(`/projects/${input.projectId}`);
  revalidatePath("/calendar");
  return task;
}

export async function updateTaskAction(
  taskId: string,
  input: UpdateTaskInput,
  projectId?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update tasks.");
  }

  if (input.title !== undefined && input.title.trim() === "") {
    throw new Error("Task title cannot be empty.");
  }

  const task = await updateTask(taskId, session.user.id, input);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  if (input.projectId && input.projectId !== projectId) {
    revalidatePath(`/projects/${input.projectId}`);
  }
  revalidatePath("/calendar");
  return task;
}

export async function deleteTaskAction(taskId: string, projectId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to delete tasks.");
  }

  await deleteTask(taskId, session.user.id);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/calendar");
}

export async function toggleTaskStatusAction(
  taskId: string,
  nextStatus?: TaskStatus,
  projectId?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update task status.");
  }

  const task = await toggleTaskStatus(taskId, session.user.id, nextStatus);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  revalidatePath("/calendar");
  return task;
}

export async function toggleSubtaskAction(
  subtaskId: string,
  projectId?: string,
  taskId?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Please sign in to update subtasks.");
  }

  const subtask = await toggleSubtask(subtaskId, session.user.id);

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
  if (projectId && taskId) {
    revalidatePath(`/projects/${projectId}/${taskId}`);
  }
  return subtask;
}
