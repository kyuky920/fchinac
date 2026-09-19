"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import type { LegalContent } from "@/lib/legal-content";
import { registerAction, type RegisterState } from "./actions";

const initialState: RegisterState = {};

function LegalModal({ title, sections, closeLabel, fullPageHref, onClose }: { title: string; sections: LegalContent["terms"]; closeLabel: string; fullPageHref: string; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  return <dialog className="legal-modal" ref={dialogRef} onCancel={(event) => { event.preventDefault(); dialogRef.current?.close(); }} onClose={onClose}>
    <div className="legal-modal-heading"><h2>{title}</h2><button type="button" aria-label={closeLabel} onClick={() => dialogRef.current?.close()}>×</button></div>
    <div className="legal-modal-body">{sections.map((section) => <section key={section.title}><h3>{section.title}</h3>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</div>
    <div className="legal-modal-actions"><Link href={fullPageHref} target="_blank" rel="noopener noreferrer">{title}</Link><button type="button" onClick={() => dialogRef.current?.close()}>{closeLabel}</button></div>
  </dialog>;
}

export function RegisterForm({ locale, labels, legal }: { locale: string; labels: Record<string,string>; legal: LegalContent }) {
  const [state, action, pending] = useActionState(registerAction.bind(null, locale), initialState);
  const [openDocument, setOpenDocument] = useState<"terms" | "privacy" | null>(null);
  if (state.success) return <div className="registration-complete"><h2>{labels.completeTitle}</h2><p>{labels.completeDescription}</p><Link className="button" href={`/${locale}/login`}>{labels.toLogin}</Link></div>;
  return <form action={action} className="stack-form">
    {state.error ? <p className="error" role="alert">{state.error}</p> : null}
    <label>{labels.username}<input name="username" required minLength={4} maxLength={64} pattern="[A-Za-z0-9_.-]+" autoComplete="username" /></label>
    <label>{labels.email}<input name="email" required type="email" maxLength={254} autoComplete="email" /></label>
    <label>{labels.displayName}<input name="displayName" required minLength={2} maxLength={100} autoComplete="name" /></label>
    <label>{labels.password}<input name="password" required type="password" minLength={10} maxLength={200} autoComplete="new-password" /><small className="muted">{labels.passwordHelp}</small></label>
    <label>{labels.passwordConfirm}<input name="passwordConfirm" required type="password" minLength={10} maxLength={200} autoComplete="new-password" /></label>
    <label>{labels.country}<input name="residenceCountry" maxLength={100} autoComplete="country-name" /></label>
    <label>{labels.gender}<select name="gender" defaultValue=""><option value="">{labels.genderNone}</option><option value="male">{labels.genderMale}</option><option value="female">{labels.genderFemale}</option><option value="other">{labels.genderOther}</option></select></label>
    <section className="privacy-notice" aria-labelledby="privacy-notice-title"><h2 id="privacy-notice-title">{legal.privacyNoticeTitle}</h2><dl>{legal.privacyNotice.map((item) => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}</dl></section>
    <div className="consent-list">
      <div className="consent-action-row"><label className="consent-checkbox"><input name="termsAccepted" type="checkbox" required /><span>{labels.terms}</span></label><button type="button" onClick={() => setOpenDocument("terms")}>{legal.viewFull}</button></div>
      <div className="consent-action-row"><label className="consent-checkbox"><input name="privacyAccepted" type="checkbox" required /><span>{labels.privacy}</span></label><button type="button" onClick={() => setOpenDocument("privacy")}>{legal.viewFull}</button></div>
      <label className="consent-checkbox"><input name="ageConfirmed" type="checkbox" required /><span>{labels.age}</span></label>
      <label className="consent-checkbox"><input name="emailMarketing" type="checkbox" /><span>{labels.marketing}</span></label>
    </div>
    {openDocument ? <LegalModal title={openDocument === "terms" ? legal.termsTitle : legal.privacyTitle} sections={openDocument === "terms" ? legal.terms : legal.privacy} closeLabel={legal.close} fullPageHref={`/${locale}/${openDocument}`} onClose={() => setOpenDocument(null)} /> : null}
    <button disabled={pending} type="submit">{pending ? labels.pending : labels.submit}</button>
  </form>;
}
