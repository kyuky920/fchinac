import "server-only";
import type { RowDataPacket } from "mysql2";
import { z } from "zod";
import { db, withTransaction } from "@/lib/db";
import type { SiteLocale } from "@/lib/i18n-server";
import { translationCatalogKeys } from "@/lib/i18n-catalog";

export const localeCodeSchema = z.string().trim().min(2).max(10).regex(/^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-[A-Z]{2}|-[0-9]{3})?$/);

export const languageSchema = z.object({
  code: localeCodeSchema,
  name: z.string().trim().min(1).max(100),
  nativeName: z.string().trim().min(1).max(100),
  flagEmoji: z.string().trim().max(16).optional().default(""),
  fallbackCode: z.union([localeCodeSchema, z.literal("")]).optional().default("en"),
  isActive: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(10000).default(100),
  translations: z.record(z.string().min(1).max(191).regex(/^[a-z0-9_.-]+$/), z.string()).default({}),
});

export const languageBundleSchema = z.object({ languages: z.array(languageSchema).min(1).max(100) });
export type LanguageInput = z.infer<typeof languageSchema>;

interface LanguageRow extends RowDataPacket {
  code: string; name: string; native_name: string; flag_emoji: string | null;
  fallback_code: string | null; is_active: number; is_default: number; sort_order: number;
  translation_count: number;
}
interface TranslationRow extends RowDataPacket { locale_code: string; message_key: string; value: string }

export interface ManagedLocale extends SiteLocale { translationCount: number }

export async function getManagedLocales(): Promise<ManagedLocale[]> {
  const [rows] = await db.query<LanguageRow[]>(`
    SELECT l.code,l.name,l.native_name,l.flag_emoji,l.fallback_code,l.is_active,l.is_default,l.sort_order,
           COUNT(t.message_key) AS translation_count
      FROM locales l LEFT JOIN site_translations t ON t.locale_code=l.code
     GROUP BY l.code,l.name,l.native_name,l.flag_emoji,l.fallback_code,l.is_active,l.is_default,l.sort_order
     ORDER BY l.sort_order,l.code`);
  return rows.map((row) => ({
    code: row.code, name: row.name, nativeName: row.native_name, flagEmoji: row.flag_emoji,
    fallbackCode: row.fallback_code, isActive: Boolean(row.is_active), isDefault: Boolean(row.is_default),
    sortOrder: Number(row.sort_order), translationCount: Number(row.translation_count),
  }));
}

async function persistLanguage(connection: import("mysql2/promise").PoolConnection, language: LanguageInput, userId: number) {
  if (language.code === language.fallbackCode) throw new Error("자기 자신을 대체 언어로 지정할 수 없습니다.");
  if (!language.isActive && language.isDefault) throw new Error("기본 언어는 활성 상태여야 합니다.");
  const [existingRows] = await connection.query<RowDataPacket[]>("SELECT is_default FROM locales WHERE code=? LIMIT 1", [language.code]);
  if (!language.isActive && Boolean(existingRows[0]?.is_default)) throw new Error("기본 언어를 먼저 다른 언어로 변경한 뒤 비활성화해 주세요.");
  if (language.fallbackCode) {
    const [fallback] = await connection.query<RowDataPacket[]>("SELECT 1 FROM locales WHERE code=? LIMIT 1", [language.fallbackCode]);
    if (!fallback.length) throw new Error(`대체 언어 ${language.fallbackCode}가 먼저 등록되어야 합니다.`);
  }
  if (language.isDefault) await connection.execute("UPDATE locales SET is_default=FALSE");
  await connection.execute(
    `INSERT INTO locales (code,name,native_name,flag_emoji,fallback_code,is_active,is_default,sort_order)
     VALUES (?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE name=VALUES(name),native_name=VALUES(native_name),flag_emoji=VALUES(flag_emoji),
       fallback_code=VALUES(fallback_code),is_active=VALUES(is_active),is_default=IF(VALUES(is_default),TRUE,is_default),sort_order=VALUES(sort_order)`,
    [language.code, language.name, language.nativeName, language.flagEmoji || null, language.fallbackCode || null,
      language.isActive, language.isDefault, language.sortOrder],
  );
  for (const [key, value] of Object.entries(language.translations)) {
    await connection.execute(
      `INSERT INTO site_translations (locale_code,message_key,value,updated_by) VALUES (?,?,?,?)
       ON DUPLICATE KEY UPDATE value=VALUES(value),updated_by=VALUES(updated_by)`,
      [language.code, key, value, userId],
    );
  }
}

export async function saveLanguage(input: unknown, userId: number): Promise<void> {
  const language = languageSchema.parse(input);
  await withTransaction((connection) => persistLanguage(connection, language, userId));
}

export async function saveTranslation(localeCode: string, key: string, value: string, userId: number): Promise<void> {
  const code = localeCodeSchema.parse(localeCode);
  const messageKey = z.string().trim().min(1).max(191).regex(/^[a-z0-9_.-]+$/).parse(key);
  const messageValue = z.string().max(2_000_000).parse(value);
  await db.execute(
    `INSERT INTO site_translations (locale_code,message_key,value,updated_by) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE value=VALUES(value),updated_by=VALUES(updated_by)`,
    [code, messageKey, messageValue, userId],
  );
}

export async function importLanguageBundle(json: string, userId: number): Promise<number> {
  let raw: unknown;
  try { raw = JSON.parse(json); } catch { throw new Error("JSON 형식이 올바르지 않습니다."); }
  const bundle = languageBundleSchema.parse(raw);
  await withTransaction(async (connection) => {
    // 대체 언어 참조를 허용하기 위해 메타데이터를 먼저 모두 만든다.
    for (const language of bundle.languages) {
      await connection.execute(
        `INSERT INTO locales (code,name,native_name,flag_emoji,is_active,is_default,sort_order)
         VALUES (?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name),native_name=VALUES(native_name),
         flag_emoji=VALUES(flag_emoji),is_active=VALUES(is_active),sort_order=VALUES(sort_order)`,
        [language.code, language.name, language.nativeName, language.flagEmoji || null, language.isActive, false, language.sortOrder],
      );
    }
    for (const language of bundle.languages) await persistLanguage(connection, language, userId);
  });
  return bundle.languages.length;
}

export async function exportLanguageBundle(): Promise<string> {
  const locales = await getManagedLocales();
  const [translations] = await db.query<TranslationRow[]>("SELECT locale_code,message_key,value FROM site_translations ORDER BY locale_code,message_key");
  const byLocale = new Map<string, Record<string, string>>();
  for (const row of translations) {
    if (!byLocale.has(row.locale_code)) byLocale.set(row.locale_code, {});
    byLocale.get(row.locale_code)![row.message_key] = row.value;
  }
  return JSON.stringify({ catalogKeys: translationCatalogKeys, languages: locales.map((locale) => ({
    code: locale.code, name: locale.name, nativeName: locale.nativeName, flagEmoji: locale.flagEmoji ?? "",
    fallbackCode: locale.fallbackCode ?? "", isActive: locale.isActive, isDefault: locale.isDefault,
    sortOrder: locale.sortOrder, translations: byLocale.get(locale.code) ?? {},
  })) }, null, 2);
}
