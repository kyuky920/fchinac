import "server-only";
import { z } from "zod";

function databaseUrlFromEnvironment(): string | undefined {
  const directUrl =
    process.env.DATABASE_URL ??
    process.env.MYSQL_URL ??
    process.env.MYSQL_DATABASE_URL ??
    process.env.DB_URL;

  if (directUrl) return directUrl;

  const host = process.env.MYSQL_HOST ?? process.env.DB_HOST;
  const port = process.env.MYSQL_PORT ?? process.env.DB_PORT ?? "3306";
  const user = process.env.MYSQL_USER ?? process.env.DB_USER;
  const password = process.env.MYSQL_PASSWORD ?? process.env.DB_PASSWORD;
  const database =
    process.env.MYSQL_DATABASE ?? process.env.MYSQL_DB ?? process.env.DB_NAME;

  if (!host || !user || password === undefined || !database) return undefined;

  return `mysql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`;
}

const resolvedDatabaseUrl = databaseUrlFromEnvironment();

const envSchema = z.object({
  DATABASE_URL: z.string().url().default("mysql://unconfigured:unconfigured@127.0.0.1:3306/unconfigured"),
  UPLOAD_ROOT: z.string().min(1).default("/tmp/fchinac-uploads"),
  SESSION_COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
});

export const env = envSchema.parse({
  DATABASE_URL: resolvedDatabaseUrl,
  UPLOAD_ROOT: process.env.UPLOAD_ROOT,
  SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE,
});

export const hasDatabaseConfiguration = resolvedDatabaseUrl !== undefined;
