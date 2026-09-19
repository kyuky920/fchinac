import Link from "next/link";
import { knownLocale, type Locale } from "@/lib/i18n";
import { getTranslations } from "@/lib/i18n-server";

const pageTitles = {
  about: { ko: "선교회 소개", en: "About Us", "zh-CN": "宣教会介绍", mn: "Танилцуулга", es: "Quiénes somos" },
  professors: { ko: "교수 소개", en: "Professors", "zh-CN": "教授介绍", mn: "Багш нар", es: "Profesores" },
  membership: { ko: "가입안내", en: "Membership", "zh-CN": "加入指南", mn: "Гишүүнчлэл", es: "Membresía" },
  lectures: { ko: "동영상강의", en: "Video Lectures", "zh-CN": "视频讲座", mn: "Видео хичээл", es: "Videoclases" },
  resources: { ko: "서적과 자료", en: "Books & Resources", "zh-CN": "书籍与资料", mn: "Ном ба материал", es: "Libros y recursos" },
} as const;

export type LegacyPageKind = keyof typeof pageTitles;

export async function LegacySubHero({ kind, locale, tabs }: { kind: LegacyPageKind; locale: Locale; tabs?: Array<{ label: string; href: string; active?: boolean }> }) {
  const titleKey = `page.${kind}.title`;
  const translated = await getTranslations(locale, { [titleKey]: pageTitles[kind][knownLocale(locale)] });
  return (
    <section className={`legacy-subhero legacy-subhero-${kind}`}>
      <h1>Antioch Bible Cyber Mission &amp; Theological Seminary</h1>
      <p>{translated[titleKey]}</p>
      {tabs?.length ? (
        <nav className="legacy-subtabs" aria-label={`${pageTitles[kind][knownLocale(locale)]} tabs`}>
          {tabs.map((tab) => <Link className={tab.active ? "active" : ""} href={tab.href} key={tab.href}>{tab.label}</Link>)}
        </nav>
      ) : null}
    </section>
  );
}

export async function ResourceTabs({ locale, active }: { locale: Locale; active: string }) {
  const baseLocale = knownLocale(locale);
  const defaultLabels = baseLocale === "zh-CN"
    ? ["圣经讲解书", "神学书籍", "属灵书籍", "考试题", "韩国语资料室"]
    : baseLocale === "en"
      ? ["Bible Commentaries", "Theology Books", "Faith Books", "Test Questions", "Korean Resources"]
      : ["성경강해서", "신학서적", "신앙서적", "시험문제", "한국어자료실"];
  const keys = ["book_old", "book_faith2", "book_faith", "book_data", "korean_reference"];
  const defaults = Object.fromEntries(keys.map((key, index) => [`resources.${key}`, defaultLabels[index]]));
  const labels = await getTranslations(locale, defaults);
  return <nav className="legacy-pill-tabs">{keys.map((key) => <Link className={active === key ? "active" : ""} href={`/${locale}/boards/${key}`} key={key}>{labels[`resources.${key}`]}</Link>)}</nav>;
}
