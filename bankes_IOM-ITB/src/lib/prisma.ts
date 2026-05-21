import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

// Always store on globalThis — the `!== production` guard was causing a new
// connection pool to be created per request in production (the bug).
globalForPrisma.prisma = prisma;
