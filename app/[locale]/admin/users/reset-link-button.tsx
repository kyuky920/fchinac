"use client";

import { useActionState } from "react";
import { issueResetLinkAction, type ResetLinkState } from "./actions";

export function ResetLinkButton({ locale, publicId }: { locale:string; publicId:string }) {
  const [state,action,pending]=useActionState(issueResetLinkAction.bind(null,locale,publicId),{} as ResetLinkState);
  const absoluteUrl=state.resetUrl && typeof window!=="undefined" ? `${window.location.origin}${state.resetUrl}` : state.resetUrl;
  return <div className="reset-link-control"><form action={action}><button className="small-button secondary" disabled={pending} type="submit">{pending?"발급 중…":"재설정 링크"}</button></form>{state.error?<small className="error-inline">{state.error}</small>:null}{absoluteUrl?<label>30분 유효 링크<input readOnly value={absoluteUrl} onFocus={(event)=>event.currentTarget.select()} /></label>:null}</div>;
}
