import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  UPLOAD_ROOT: z.string().min(1).default("/tmp/fchinac-uploads"),
  SESSION_COOKIE_SECURE: z.enum(["true", "false"]).default("false"),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  UPLOAD_ROOT: process.env.UPLOAD_ROOT,
  SESSION_COOKIE_SECURE: process.env.SESSION_COOKIE_SECURE,
});
