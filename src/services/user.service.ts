/**
 * user.service.ts
 *
 * Service layer for User domain operations.
 * All Prisma calls for users are isolated here.
 *
 * Architecture: Page → Service → Prisma
 */

import { prisma } from "@/lib/prisma";

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
      deletedAt: null,
    },
  });
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: {
      email,
      deletedAt: null,
    },
  });
}
