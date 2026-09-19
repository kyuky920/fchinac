import "server-only";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { isLocale } from "@/lib/i18n";

export interface SiteLocale {
  code: string;
  name: string;
  nativeName: string;
  flagEmoji: string | null;
  fallbackCode: string | null;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

interface LocaleRow extends RowDataPacket {
  code: string; name: string; native_name: string; flag_emoji: string | null;
  fallback_code: string | null; is_active: number; is_default: number; sort_order: number;
}
interface TranslationRow extends RowDataPacket { locale_code: string; message_key: string; value: string }

function mapLocale(row: LocaleRow): SiteLocale {
  return { code: row.code, name: row.name, nativeName: row.native_name, flagEmoji: row.flag_emoji, fallbackCode: row.fallback_code, isActive: Boolean(row.is_active), isDefault: Boolean(row.is_default), sortOrder: Number(row.sort_order) };
}

export async function getActiveLocales(): Promise<SiteLocale[]> {
  const [rows] = await db.query<LocaleRow[]>("SELECT code,name,native_name,flag_emoji,fallback_code,is_active,is_default,sort_order FROM locales WHERE is_active=TRUE ORDER BY sort_order,code");
  return rows.map(mapLocale);
}

export async function getAllLocales(): Promise<SiteLocale[]> {
  const [rows] = await db.query<LocaleRow[]>("SELECT code,name,native_name,flag_emoji,fallback_code,is_active,is_default,sort_order FROM locales ORDER BY sort_order,code");
  return rows.map(mapLocale);
}

export async function isActiveLocale(code: string): Promise<boolean> {
  if (!isLocale(code)) return false;
  const [rows] = await db.query<RowDataPacket[]>("SELECT 1 FROM locales WHERE code=? AND is_active=TRUE LIMIT 1", [code]);
  return rows.length > 0;
}

export async function getTranslations<T extends Record<string, string>>(localeCode: string, defaults: T): Promise<T> {
  const keys = Object.keys(defaults);
  if (!keys.length) return { ...defaults };
  const [localeRows] = await db.query<LocaleRow[]>("SELECT code,name,native_name,flag_emoji,fallback_code,is_active,is_default,sort_order FROM locales WHERE code=? LIMIT 1", [localeCode]);
  const fallback = localeRows[0]?.fallback_code;
  const chain = [...new Set([localeCode, fallback, "en", "ko"].filter(Boolean) as string[])];
  const localePlaceholders = chain.map(() => "?").join(",");
  const keyPlaceholders = keys.map(() => "?").join(",");
  const [rows] = await db.query<TranslationRow[]>(`SELECT locale_code,message_key,value FROM site_translations WHERE locale_code IN (${localePlaceholders}) AND message_key IN (${keyPlaceholders})`, [...chain, ...keys]);
  const byLocale = new Map<string, Map<string, string>>();
  for (const row of rows) {
    if (!byLocale.has(row.locale_code)) byLocale.set(row.locale_code, new Map());
    byLocale.get(row.locale_code)!.set(row.message_key, row.value);
  }
  const result = { ...defaults };
  for (const key of keys) {
    for (const code of [...chain].reverse()) {
      const value = byLocale.get(code)?.get(key);
      if (value !== undefined) result[key as keyof T] = value as T[keyof T];
    }
  }
  return result;
}
