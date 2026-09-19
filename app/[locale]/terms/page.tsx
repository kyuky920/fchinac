import { notFound } from "next/navigation";
import { isActiveLocale } from "@/lib/i18n-server";
import { getLegalContent, TERMS_VERSION } from "@/lib/legal-content";

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const legal = getLegalContent(locale);
  return <article className="legal-document"><header><h1>{legal.termsTitle}</h1><p>{legal.effectiveDateLabel}: {TERMS_VERSION}</p></header>{legal.terms.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}</article>;
}
