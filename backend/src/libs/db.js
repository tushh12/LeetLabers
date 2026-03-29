
import pkg from "@prisma/client";
const {PrismaClient} = pkg;
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config"; // for  read the .env file

// 1. Create a native Postgres connection pool
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Wrap it in the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. The Singleton pattern (so Nodemon doesn't crash your DB)
const globalForPrisma = globalThis;

// Notice we pass the adapter into the PrismaClient now!
export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;