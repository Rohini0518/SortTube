// Shared Prisma client instance. Import `prisma` from here anywhere the app
// needs to query the database — never construct a new PrismaClient elsewhere.
// The global-cache pattern below prevents Next.js dev-mode hot-reload from
// opening a new DB connection pool on every file save.

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
