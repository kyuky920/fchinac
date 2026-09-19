import { notFound } from "next/navigation";
import { isActiveLocale } from "@/lib/i18n-server";
import { ResetPasswordForm } from "./reset-password-form";
import { passwordResetTokenPattern } from "@/lib/member-validation";

export default async function ResetPasswordPage({ params }: { params:Promise<{locale:string;token:string}> }) {
  const { locale, token } = await params;
  if (!(await isActiveLocale(locale)) || !passwordResetTokenPattern.test(token)) notFound();
  return <section className="auth-panel"><h1>비밀번호 재설정</h1><p className="muted">이 링크는 발급 후 30분 동안 한 번만 사용할 수 있습니다.</p><ResetPasswordForm locale={locale} token={token} /></section>;
}
