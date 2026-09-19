import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

export function normalizeBcrypt(hash: string): string {
  return hash.startsWith("$2y$") ? `$2b$${hash.slice(4)}` : hash;
}

export function isBcryptHash(hash: string): boolean {
  return /^\$2[aby]\$\d{2}\$/.test(hash);
}

export function mysql41PasswordHash(password: string): string {
  const first = createHash("sha1").update(password, "utf8").digest();
  return `*${createHash("sha1").update(first).digest("hex").toUpperCase()}`;
}

export function isMysql41Hash(hash: string): boolean {
  return /^\*[0-9A-F]{40}$/i.test(hash);
}

export async function verifyStoredPassword(password: string, hash: string): Promise<boolean> {
  if (isBcryptHash(hash)) return bcrypt.compare(password, normalizeBcrypt(hash));
  if (!isMysql41Hash(hash)) return false;

  const expected = Buffer.from(mysql41PasswordHash(password), "ascii");
  const actual = Buffer.from(hash.toUpperCase(), "ascii");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

