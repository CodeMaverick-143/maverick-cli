import { PrismaClient } from "@prisma/client";

const globalForPrisma = global

let prisma;

try {
    prisma = new PrismaClient()
} catch (error) {
    // Expected failure in CLI environment where DATABASE_URL is missing
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma