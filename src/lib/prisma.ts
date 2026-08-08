/**
 * Prisma 7 client singleton with pg driver adapter.
 *
 * In Prisma 7, PrismaClient must be instantiated with a driver adapter.
 * We use @prisma/adapter-pg backed by a pg.Pool.
 *
 * A connection pool is attached to globalThis in development to prevent
 * hot-reload from creating new pools on every module evaluation.
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

type GlobalWithPrisma = typeof globalThis & {
  prismaPool: Pool | undefined;
  prisma: PrismaClient | undefined;
};

const globalWithPrisma = globalThis as GlobalWithPrisma;

// Re-use the connection pool across hot reloads in development.
const pool =
  globalWithPrisma.prismaPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Neon serverless postgres: keep idle connections short.
    idleTimeoutMillis: 30_000,
    max: 10,
  });

const adapter = new PrismaPg(pool);

export const prisma =
  globalWithPrisma.prisma ??
  new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalWithPrisma.prismaPool = pool;
  globalWithPrisma.prisma = prisma;
}
