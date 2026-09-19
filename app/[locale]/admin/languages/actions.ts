"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { canManageLanguages, getCurrentUser } from "@/lib/auth";
import { importLanguageBundle, saveLanguage, saveTranslation } from "@/lib/language-admin";
import { isActiveLocale } from "@/lib/i18n-server";

async function requireLanguageAdmin(locale: string) {
  if (!(await isActiveLocale(locale))) throw new Error("지원하지 않는 관리 화면 언어입니다.");
  const user = await getCurrentUser();
  if (!user || !canManageLanguages(user)) throw new Error("언어 관리 권한이 없습니다.");
  return user;
}

function message(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? "입력값을 확인해 주세요.";
  return error instanceof Error ? error.message : "처리하지 못했습니다.";
}

export async function saveLanguageAction(locale: string, formData: FormData) {
  try {
    const user = await requireLanguageAdmin(locale);
    await saveLanguage({
      code: formData.get("code"), name: formData.get("name"), nativeName: formData.get("nativeName"),
      flagEmoji: formData.get("flagEmoji") ?? "", fallbackCode: formData.get("fallbackCode") ?? "",
      isActive: formData.get("isActive") === "on", isDefault: formData.get("isDefault") === "on",
      sortOrder: Number(formData.get("sortOrder") ?? 100), translations: {},
    }, user.id);
    revalidatePath("/", "layout");
  } catch (error) {
    redirect(`/${locale}/admin/languages?error=${encodeURIComponent(message(error))}`);
  }
  redirect(`/${locale}/admin/languages?status=${encodeURIComponent("언어 정보가 저장되었습니다.")}`);
}

export async function saveTranslationAction(locale: string, formData: FormData) {
  try {
    const user = await requireLanguageAdmin(locale);
    await saveTranslation(String(formData.get("localeCode") ?? ""), String(formData.get("messageKey") ?? ""), String(formData.get("value") ?? ""), user.id);
    revalidatePath("/", "layout");
  } catch (error) {
    redirect(`/${locale}/admin/languages?error=${encodeURIComponent(message(error))}`);
  }
  redirect(`/${locale}/admin/languages?status=${encodeURIComponent("번역 문구가 저장되었습니다.")}`);
}

export async function importLanguagesAction(locale: string, formData: FormData) {
  let count: number;
  try {
    const user = await requireLanguageAdmin(locale);
    count = await importLanguageBundle(String(formData.get("bundle") ?? ""), user.id);
    revalidatePath("/", "layout");
  } catch (error) {
    redirect(`/${locale}/admin/languages?error=${encodeURIComponent(message(error))}`);
  }
  redirect(`/${locale}/admin/languages?status=${encodeURIComponent(`${count}개 언어를 일괄 등록했습니다.`)}`);
}
