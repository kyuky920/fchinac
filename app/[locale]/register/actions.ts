"use server";

import { z } from "zod";
import { registerMember } from "@/lib/members";
import { isActiveLocale } from "@/lib/i18n-server";

export interface RegisterState { error?: string; success?: boolean }

export async function registerAction(locale: string, _state: RegisterState, formData: FormData): Promise<RegisterState> {
  if (!(await isActiveLocale(locale))) return { error: "지원하지 않는 언어입니다." };
  try {
    await registerMember({
      username: formData.get("username"), email: formData.get("email"), displayName: formData.get("displayName"),
      password: formData.get("password"), passwordConfirm: formData.get("passwordConfirm"), preferredLocaleCode: locale,
      residenceCountry: formData.get("residenceCountry"), gender: formData.get("gender"), ageConfirmed: formData.get("ageConfirmed") === "on",
      termsAccepted: formData.get("termsAccepted") === "on", privacyAccepted: formData.get("privacyAccepted") === "on",
      emailMarketing: formData.get("emailMarketing") === "on",
    });
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: error.issues[0]?.message ?? "입력값을 확인해 주세요." };
    return { error: error instanceof Error ? error.message : "회원가입을 처리하지 못했습니다." };
  }
}
