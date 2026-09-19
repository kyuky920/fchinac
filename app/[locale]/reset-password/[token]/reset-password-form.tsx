"use client";

import Link from "next/link";
import { useActionState } from "react";
import { resetPasswordAction, type ResetPasswordState } from "./actions";

export function ResetPasswordForm({ locale, token }: { locale:string; token:string }) {
  const [state, action, pending] = useActionState(resetPasswordAction.bind(null,token), {} as ResetPasswordState);
  if (state.success) return <div className="registration-complete"><h2>비밀번호가 변경되었습니다.</h2><p>기존 로그인 세션은 모두 종료되었습니다.</p><Link className="button" href={`/${locale}/login`}>로그인</Link></div>;
  return <form action={action} className="stack-form">{state.error ? <p className="error" role="alert">{state.error}</p> : null}<label>새 비밀번호<input name="password" required type="password" minLength={10} maxLength={200} autoComplete="new-password" /><small className="muted">영문과 숫자를 포함하여 10자 이상 입력해 주세요.</small></label><label>새 비밀번호 확인<input name="passwordConfirm" required type="password" minLength={10} maxLength={200} autoComplete="new-password" /></label><button disabled={pending} type="submit">{pending ? "변경 중…" : "비밀번호 변경"}</button></form>;
}
