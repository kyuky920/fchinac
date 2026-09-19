import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { z } from "zod";
import { db, withTransaction } from "@/lib/db";
import { createPublicId } from "@/lib/ids";
import type { AuthUser, RoleKey } from "@/lib/auth";
import { PRIVACY_VERSION, TERMS_VERSION } from "@/lib/legal-content";
import { assertMemberUpdateAllowed, managedRoleSchema, memberStatusSchema, passwordSchema, registrationSchema } from "@/lib/member-validation";

export interface MemberListItem {
  id: number; publicId: string; username: string; email: string | null; displayName: string;
  status: "pending" | "active" | "blocked" | "withdrawn"; roles: RoleKey[];
  preferredLocaleCode: string; residenceCountry: string | null; gender: string | null;
  joinedAt: Date; lastLoginAt: Date | null; legacyMemberNo: number | null;
}

interface MemberRow extends RowDataPacket {
  id: number; public_id: string; username: string; email: string | null; display_name: string;
  status: MemberListItem["status"]; roles: string | null; preferred_locale_code: string;
  residence_country: string | null; gender: string | null; joined_at: Date; last_login_at: Date | null; legacy_member_no: number | null;
}

export interface MemberAuditItem {
  id: number; action: string; actorName: string | null; targetName: string; details: Record<string, unknown> | null; createdAt: Date;
}

interface AuditRow extends RowDataPacket {
  id: number; action: string; actor_name: string | null; target_name: string; details: string | Record<string, unknown> | null; created_at: Date;
}

function hashToken(token: string) { return createHash("sha256").update(token).digest("hex"); }

export async function registerMember(input: unknown): Promise<void> {
  const value = registrationSchema.parse(input);
  const passwordHash = await bcrypt.hash(value.password, 12);
  try { await withTransaction(async (connection) => {
    const [localeRows] = await connection.query<RowDataPacket[]>("SELECT 1 FROM locales WHERE code=? AND is_active=TRUE LIMIT 1", [value.preferredLocaleCode]);
    if (!localeRows.length) throw new Error("지원하지 않는 언어입니다.");
    const [duplicateRows] = await connection.query<RowDataPacket[]>("SELECT username,email FROM users WHERE LOWER(username)=LOWER(?) OR LOWER(email)=LOWER(?) LIMIT 1", [value.username, value.email]);
    if (duplicateRows.length) throw new Error("이미 사용 중인 아이디 또는 이메일입니다.");
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO users (public_id,username,email,password_hash,password_scheme,display_name,preferred_locale_code,status,joined_at,password_changed_at)
       VALUES (?,?,?,?,?,?,?,'pending',UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))`,
      [createPublicId(), value.username, value.email, passwordHash, "bcrypt", value.displayName, value.preferredLocaleCode],
    );
    await connection.execute("INSERT INTO member_profiles (user_id,full_name,nickname,residence_country,gender) VALUES (?,?,?,?,?)", [result.insertId, value.displayName, value.displayName, value.residenceCountry ?? null, value.gender ?? null]);
    await connection.execute("INSERT INTO user_consents (user_id,terms_accepted,privacy_accepted,age_confirmed,email_marketing,terms_version,privacy_version,consented_at) VALUES (?,TRUE,TRUE,TRUE,?,?,?,UTC_TIMESTAMP(3))", [result.insertId, value.emailMarketing, TERMS_VERSION, PRIVACY_VERSION]);
    await connection.execute("INSERT INTO user_roles (user_id,role_id) SELECT ?,id FROM roles WHERE role_key='member'", [result.insertId]);
    await connection.execute("INSERT INTO user_audit_logs (target_user_id,action,details) VALUES (?,'self_registered',JSON_OBJECT('locale',?))", [result.insertId, value.preferredLocaleCode]);
  }); } catch (error) {
    if (typeof error === "object" && error && "code" in error && error.code === "ER_DUP_ENTRY") throw new Error("이미 사용 중인 아이디 또는 이메일입니다.");
    throw error;
  }
}

export async function listMembers(input: { query?: string; status?: string; page?: number; pageSize?: number }) {
  const query = input.query?.trim() ?? "";
  const status = input.status && memberStatusSchema.safeParse(input.status).success ? input.status : "";
  const page = Math.max(1, Math.floor(input.page ?? 1));
  const pageSize = Math.min(100, Math.max(10, Math.floor(input.pageSize ?? 30)));
  const where: string[] = []; const values: unknown[] = [];
  if (query) { where.push("(u.username LIKE ? OR u.email LIKE ? OR u.display_name LIKE ?)"); const pattern = `%${query.replace(/[\\%_]/g, "\\$&")}%`; values.push(pattern, pattern, pattern); }
  if (status) { where.push("u.status=?"); values.push(status); }
  const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const [countRows] = await db.query<RowDataPacket[]>(`SELECT COUNT(*) count FROM users u ${clause}`, values);
  const [rows] = await db.query<MemberRow[]>(
    `SELECT u.id,u.public_id,u.username,u.email,u.display_name,u.status,u.preferred_locale_code,p.residence_country,p.gender,u.joined_at,u.last_login_at,u.legacy_member_no,
            GROUP_CONCAT(r.role_key ORDER BY r.id) roles
       FROM users u LEFT JOIN member_profiles p ON p.user_id=u.id LEFT JOIN user_roles ur ON ur.user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id
       ${clause} GROUP BY u.id ORDER BY FIELD(u.status,'pending','active','blocked','withdrawn'),u.joined_at DESC LIMIT ? OFFSET ?`,
    [...values, pageSize, (page - 1) * pageSize],
  );
  return { members: rows.map((row): MemberListItem => ({ id: row.id, publicId: row.public_id, username: row.username, email: row.email, displayName: row.display_name, status: row.status, roles: (row.roles?.split(",") ?? []) as RoleKey[], preferredLocaleCode: row.preferred_locale_code, residenceCountry: row.residence_country, gender: row.gender, joinedAt: row.joined_at, lastLoginAt: row.last_login_at, legacyMemberNo: row.legacy_member_no })), total: Number(countRows[0]?.count ?? 0), page, pageSize };
}

export async function updateMember(actor: AuthUser, input: { publicId: string; status: unknown; roles: unknown }): Promise<void> {
  const status = memberStatusSchema.parse(input.status);
  const roles = z.array(managedRoleSchema).min(1).parse(input.roles);
  await withTransaction(async (connection) => {
    const [rows] = await connection.query<(RowDataPacket & { id:number; status:string })[]>("SELECT id,status FROM users WHERE public_id=? LIMIT 1 FOR UPDATE", [input.publicId]);
    const target = rows[0]; if (!target) throw new Error("회원을 찾을 수 없습니다.");
    const [roleRows] = await connection.query<(RowDataPacket & { role_key:string })[]>("SELECT r.role_key FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=?", [target.id]);
    const beforeRoles = roleRows.map((row) => row.role_key);
    let activeAdminCount = Number.MAX_SAFE_INTEGER;
    if (beforeRoles.includes("admin") && (!roles.includes("admin") || status !== "active")) {
      const [admins] = await connection.query<RowDataPacket[]>(`SELECT COUNT(DISTINCT u.id) count FROM users u JOIN user_roles ur ON ur.user_id=u.id JOIN roles r ON r.id=ur.role_id WHERE r.role_key='admin' AND u.status='active'`);
      activeAdminCount = Number(admins[0]?.count ?? 0);
    }
    assertMemberUpdateAllowed({ actorId: actor.id, targetId: target.id, targetIsAdmin: beforeRoles.includes("admin"), nextStatus: status, nextRoles: roles, activeAdminCount });
    await connection.execute(`UPDATE users SET status=?,blocked_at=IF(?='blocked',UTC_TIMESTAMP(3),NULL),withdrawn_at=IF(?='withdrawn',UTC_TIMESTAMP(3),NULL) WHERE id=?`, [status, status, status, target.id]);
    await connection.execute(`DELETE ur FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=? AND r.role_key IN ('restricted','member','editor','admin')`, [target.id]);
    for (const role of [...new Set(roles)]) await connection.execute("INSERT INTO user_roles (user_id,role_id,granted_by) SELECT ?,id,? FROM roles WHERE role_key=?", [target.id, actor.id, role]);
    if (status !== "active") await connection.execute("UPDATE auth_sessions SET revoked_at=UTC_TIMESTAMP(3) WHERE user_id=? AND revoked_at IS NULL", [target.id]);
    await connection.execute("INSERT INTO user_audit_logs (actor_user_id,target_user_id,action,details) VALUES (?,?,'member_updated',JSON_OBJECT('beforeStatus',?,'afterStatus',?,'beforeRoles',?,'afterRoles',?))", [actor.id, target.id, target.status, status, JSON.stringify(beforeRoles), JSON.stringify(roles)]);
  });
}

export async function issuePasswordReset(actor: AuthUser, publicId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await withTransaction(async (connection) => {
    const [rows] = await connection.query<(RowDataPacket & { id:number })[]>("SELECT id FROM users WHERE public_id=? AND status<>'withdrawn' LIMIT 1", [publicId]);
    const target = rows[0]; if (!target) throw new Error("재설정 가능한 회원을 찾을 수 없습니다.");
    await connection.execute("UPDATE password_reset_tokens SET used_at=UTC_TIMESTAMP(3) WHERE user_id=? AND used_at IS NULL", [target.id]);
    await connection.execute("INSERT INTO password_reset_tokens (user_id,token_hash,expires_at) VALUES (?,?,DATE_ADD(UTC_TIMESTAMP(3),INTERVAL 30 MINUTE))", [target.id, hashToken(token)]);
    await connection.execute("INSERT INTO user_audit_logs (actor_user_id,target_user_id,action,details) VALUES (?,?,'password_reset_issued',JSON_OBJECT('expiresMinutes',30))", [actor.id, target.id]);
  });
  return token;
}

export async function resetPassword(token: string, password: string, confirmation: string): Promise<void> {
  passwordSchema.parse(password);
  if (password !== confirmation) throw new Error("비밀번호가 일치하지 않습니다.");
  const passwordHash = await bcrypt.hash(password, 12);
  await withTransaction(async (connection) => {
    const [rows] = await connection.query<(RowDataPacket & { id:number; user_id:number })[]>("SELECT id,user_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>UTC_TIMESTAMP(3) LIMIT 1 FOR UPDATE", [hashToken(token)]);
    const reset = rows[0]; if (!reset) throw new Error("만료되었거나 이미 사용된 재설정 링크입니다.");
    await connection.execute("UPDATE users SET password_hash=?,password_scheme='bcrypt',password_changed_at=UTC_TIMESTAMP(3) WHERE id=?", [passwordHash, reset.user_id]);
    await connection.execute("UPDATE password_reset_tokens SET used_at=UTC_TIMESTAMP(3) WHERE id=?", [reset.id]);
    await connection.execute("UPDATE auth_sessions SET revoked_at=UTC_TIMESTAMP(3) WHERE user_id=? AND revoked_at IS NULL", [reset.user_id]);
    await connection.execute("INSERT INTO user_audit_logs (target_user_id,action) VALUES (?,'password_reset_completed')", [reset.user_id]);
  });
}

export async function listMemberAudit(limit = 30): Promise<MemberAuditItem[]> {
  const [rows] = await db.query<AuditRow[]>(`SELECT a.id,a.action,a.details,a.created_at,actor.display_name actor_name,target.display_name target_name FROM user_audit_logs a LEFT JOIN users actor ON actor.id=a.actor_user_id JOIN users target ON target.id=a.target_user_id ORDER BY a.id DESC LIMIT ?`, [Math.min(100, Math.max(1, limit))]);
  return rows.map((row) => ({ id: row.id, action: row.action, actorName: row.actor_name, targetName: row.target_name, details: typeof row.details === "string" ? JSON.parse(row.details) : row.details, createdAt: row.created_at }));
}
