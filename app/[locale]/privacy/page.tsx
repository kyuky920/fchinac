import { notFound } from "next/navigation";
import { isActiveLocale } from "@/lib/i18n-server";
import { getLegalContent, PRIVACY_VERSION } from "@/lib/legal-content";

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const legal = getLegalContent(locale);
  return <article className="legal-document"><header><h1>{legal.privacyTitle}</h1><p>{legal.effectiveDateLabel}: {PRIVACY_VERSION}</p></header>{legal.privacy.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</article>;
}
