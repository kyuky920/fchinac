import Link from "next/link";
import { notFound } from "next/navigation";
import { knownLocale } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero } from "@/app/[locale]/_components/legacy-subpage";

const labels = {
  ko: ["회원가입", "회원가입을 진행하려면 아래 버튼을 선택하세요."],
  en: ["Register", "Select the button below to create your account."],
  "zh-CN": ["注册会员", "请选择下面的按钮进行会员注册。"],
  mn: ["Бүртгүүлэх", "Бүртгэл үүсгэхийн тулд доорх товчийг сонгоно уу."],
  es: ["Registrarse", "Seleccione el botón de abajo para crear su cuenta."],
} as const;

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const baseLocale = knownLocale(locale);
  const base = labels[baseLocale];
  const defaults: Record<string, string> = { "membership.tab.register": base[0], "membership.description": base[1] };
  const messages = await getTranslations(locale, defaults);

  return <div className="legacy-subpage"><LegacySubHero kind="membership" locale={locale} /><section className="legacy-membership legacy-content-wrap"><div className="legacy-membership-cta"><h2>{messages["membership.tab.register"]}</h2><p>{messages["membership.description"]}</p><Link className="legacy-join-button" href={`/${locale}/register`}>{messages["membership.tab.register"]}</Link></div></section></div>;
}
