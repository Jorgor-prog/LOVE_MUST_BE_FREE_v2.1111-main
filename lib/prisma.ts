import { PrismaClient } from '@prisma/client';
export const prisma = globalThis.__prisma || new PrismaClient();
if (!(globalThis as any).__prisma) (globalThis as any).__prisma = prisma;
