import { notFound } from "next/navigation";
import { isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero } from "@/app/[locale]/_components/legacy-subpage";
import { RegistrationPanel } from "@/app/[locale]/register/registration-panel";

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  return <div className="legacy-subpage"><LegacySubHero kind="membership" locale={locale} /><div className="legacy-membership legacy-content-wrap"><RegistrationPanel locale={locale} /></div></div>;
}
