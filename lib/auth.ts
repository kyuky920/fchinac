import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
import { isBcryptHash, normalizeBcrypt, verifyStoredPassword } from "@/lib/password";

const SESSION_COOKIE = "fchinac_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const DUMMY_HASH = "$2b$12$5F8xgdidgoqx4MUgfYUCROaeVoQ9L.96Sb.FZtvcsN7Q0o4nrOrQW";

export type RoleKey = "guest" | "restricted" | "member" | "editor" | "admin";

export interface AuthUser {
  id: number;
  publicId: string;
  username: string;
  email: string | null;
  displayName: string;
  status: "pending" | "active" | "blocked" | "withdrawn";
  roles: RoleKey[];
}

interface UserPasswordRow extends RowDataPacket {
  id: number;
  password_hash: string;
  password_scheme: string;
  status: AuthUser["status"];
}

interface SessionUserRow extends RowDataPacket {
  id: number;
  public_id: string;
  username: string;
  email: string | null;
  display_name: string;
  status: AuthUser["status"];
  roles: string | null;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

async function createSession(userId: number): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);

  await db.execute(
    "INSERT INTO auth_sessions (user_id, token_hash, expires_at) VALUES (?, ?, ?)",
    [userId, tokenHash, expiresAt],
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.SESSION_COOKIE_SECURE === "true",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function authenticate(
  identifier: string,
  password: string,
): Promise<{ ok: true } | { ok: false; reason: "invalid" | "pending" | "blocked" | "rate_limited" }> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const identifierHash = sha256(normalizedIdentifier);

  const [attemptRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS failures
       FROM auth_login_attempts
      WHERE identifier_hash = ?
        AND succeeded = FALSE
        AND created_at >= DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 15 MINUTE)`,
    [identifierHash],
  );
  if (Number(attemptRows[0]?.failures ?? 0) >= 5) {
    return { ok: false, reason: "rate_limited" };
  }

  const [rows] = await db.query<UserPasswordRow[]>(
    `SELECT id, password_hash, password_scheme, status
       FROM users
      WHERE LOWER(username) = ? OR LOWER(email) = ?
      LIMIT 1`,
    [normalizedIdentifier, normalizedIdentifier],
  );
  const user = rows[0];
  const valid = user
    ? await verifyStoredPassword(password, user.password_hash)
    : await bcrypt.compare(password, DUMMY_HASH).then(() => false);

  await db.execute(
    "INSERT INTO auth_login_attempts (identifier_hash, succeeded) VALUES (?, ?)",
    [identifierHash, Boolean(user && valid)],
  );

  if (!user || !valid) return { ok: false, reason: "invalid" };
  if (user.status === "pending") return { ok: false, reason: "pending" };
  if (user.status !== "active") return { ok: false, reason: "blocked" };

  const normalizedHash = normalizeBcrypt(user.password_hash);
  if (user.password_scheme !== "bcrypt" || !isBcryptHash(normalizedHash) || bcrypt.getRounds(normalizedHash) < 12) {
    const upgradedHash = await bcrypt.hash(password, 12);
    await db.execute(
      "UPDATE users SET password_hash=?, password_scheme='bcrypt', password_changed_at=UTC_TIMESTAMP(3) WHERE id=?",
      [upgradedHash, user.id],
    );
  }

  await createSession(user.id);
  await db.execute("UPDATE users SET last_login_at=UTC_TIMESTAMP(3) WHERE id=?", [user.id]);
  return { ok: true };
}

export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const [rows] = await db.query<SessionUserRow[]>(
    `SELECT u.id, u.public_id, u.username, u.email, u.display_name, u.status,
            GROUP_CONCAT(r.role_key ORDER BY r.id) AS roles
       FROM auth_sessions s
       JOIN users u ON u.id=s.user_id
       LEFT JOIN user_roles ur ON ur.user_id=u.id
       LEFT JOIN roles r ON r.id=ur.role_id
      WHERE s.token_hash=? AND s.revoked_at IS NULL AND s.expires_at > UTC_TIMESTAMP(3)
      GROUP BY u.id
      LIMIT 1`,
    [sha256(token)],
  );
  const row = rows[0];
  if (!row || row.status !== "active") return null;

  await db.execute(
    "UPDATE auth_sessions SET last_seen_at=UTC_TIMESTAMP(3) WHERE token_hash=? AND last_seen_at < DATE_SUB(UTC_TIMESTAMP(3), INTERVAL 5 MINUTE)",
    [sha256(token)],
  );

  return {
    id: row.id,
    publicId: row.public_id,
    username: row.username,
    email: row.email,
    displayName: row.display_name,
    status: row.status,
    roles: (row.roles?.split(",") ?? []) as RoleKey[],
  };
});

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.execute(
      "UPDATE auth_sessions SET revoked_at=UTC_TIMESTAMP(3) WHERE token_hash=?",
      [sha256(token)],
    );
  }
  cookieStore.delete(SESSION_COOKIE);
}

export function roleKeysFor(user: AuthUser | null): RoleKey[] {
  return user?.roles.length ? user.roles : ["guest"];
}

export function canManageContent(user: AuthUser | null): boolean {
  return Boolean(user?.roles.some((role) => role === "editor" || role === "admin"));
}

export function canManageLanguages(user: AuthUser | null): boolean {
  return Boolean(user?.roles.includes("admin"));
}

export function canManageUsers(user: AuthUser | null): boolean {
  return Boolean(user?.roles.includes("admin"));
}
