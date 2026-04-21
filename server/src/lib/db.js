import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

let prisma;

try {
    if (process.env.DATABASE_URL) {
        const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        prisma = new PrismaClient({ adapter });
    } else {
        prisma = new PrismaClient();
    }
} catch (error) {
    // Expected failure in CLI environment where DATABASE_URL is missing
}

const globalForPrisma = global;
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;