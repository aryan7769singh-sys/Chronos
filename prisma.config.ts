import "dotenv/config";
import { defineConfig, env } from "prisma/config";

/**
 * Prisma 7 config file.
 *
 * In Prisma 7, connection URLs moved out of schema.prisma into this file.
 * See: https://www.prisma.io/docs/orm/reference/prisma-config-reference
 *
 * The DATABASE_URL environment variable is loaded from .env by the
 * `dotenv/config` import above.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    // Seed command is defined here in Prisma 7 (moved from package.json "prisma" key)
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
