"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticate } from "@/lib/auth";
import { isActiveLocale } from "@/lib/i18n-server";

export interface LoginState {
  error?: string;
}

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(200),
});

export async function loginAction(
  localeValue: string,
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: "아이디와 비밀번호를 확인해 주세요." };

  const result = await authenticate(parsed.data.identifier, parsed.data.password);
  if (!result.ok) {
    if (result.reason === "rate_limited") {
      return { error: "로그인 시도가 너무 많습니다. 15분 후 다시 시도해 주세요." };
    }
    if (result.reason === "blocked") {
      return { error: "사용할 수 없는 계정입니다. 관리자에게 문의해 주세요." };
    }
    if (result.reason === "pending") {
      return { error: "관리자 승인 대기 중인 계정입니다." };
    }
    return { error: "아이디 또는 비밀번호가 올바르지 않습니다." };
  }

  const locale = (await isActiveLocale(localeValue)) ? localeValue : "ko";
  redirect(`/${locale}`);
}
