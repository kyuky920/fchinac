"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/[locale]/login/actions";

const initialState: LoginState = {};

export function LoginForm({ locale, labels }: { locale: string; labels: { identifier: string; password: string; submit: string; pending: string } }) {
  const [state, formAction, pending] = useActionState(
    loginAction.bind(null, locale),
    initialState,
  );

  return (
    <form action={formAction}>
      {state.error ? <p className="error" role="alert">{state.error}</p> : null}
      <div className="field">
        <label htmlFor="identifier">{labels.identifier}</label>
        <input autoComplete="username" id="identifier" name="identifier" required />
      </div>
      <div className="field">
        <label htmlFor="password">{labels.password}</label>
        <input autoComplete="current-password" id="password" name="password" required type="password" />
      </div>
      <button className="button" disabled={pending} type="submit">
        {pending ? labels.pending : labels.submit}
      </button>
    </form>
  );
}
