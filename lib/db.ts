import "server-only";
import mysql, { type Pool, type PoolConnection } from "mysql2/promise";
import { env } from "@/lib/env";

const globalForDb = globalThis as unknown as { fchinacPool?: Pool };

export const db =
  globalForDb.fchinacPool ??
  mysql.createPool({
    uri: env.DATABASE_URL,
    connectionLimit: 8,
    enableKeepAlive: true,
    timezone: "Z",
    charset: "utf8mb4",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.fchinacPool = db;
}

export async function withTransaction<T>(
  operation: (connection: PoolConnection) => Promise<T>,
): Promise<T> {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const result = await operation(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

