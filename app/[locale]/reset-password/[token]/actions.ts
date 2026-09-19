"use server";

import { z } from "zod";
import { resetPassword } from "@/lib/members";
import { passwordResetTokenPattern } from "@/lib/member-validation";

export interface ResetPasswordState { error?: string; success?: boolean }

export async function resetPasswordAction(token: string, _state: ResetPasswordState, formData: FormData): Promise<ResetPasswordState> {
  if (!passwordResetTokenPattern.test(token)) return { error: "올바르지 않은 재설정 링크입니다." };
  try {
    await resetPassword(token, String(formData.get("password") ?? ""), String(formData.get("passwordConfirm") ?? ""));
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) return { error: "영문과 숫자를 포함하여 10자 이상 입력해 주세요." };
    return { error: error instanceof Error ? error.message : "비밀번호를 변경하지 못했습니다." };
  }
}
