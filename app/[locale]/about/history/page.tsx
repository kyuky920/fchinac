import { notFound } from "next/navigation";
import { knownLocale } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import {
  legacyChurchHistoryDates,
  legacyChurchHistoryEvents,
  legacyHistoryDates,
  legacyHistoryEvents,
} from "@/lib/legacy-content";
import { LegacySubHero } from "@/app/[locale]/_components/legacy-subpage";

const labels = { ko: ["회장 인사말", "연혁"], en: ["President's Greeting", "History"], "zh-CN": ["会长致辞", "沿革"], mn: ["Тэргүүний мэндчилгээ", "Түүх"], es: ["Saludo del presidente", "Historia"] } as const;

export default async function HistoryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const baseLocale = knownLocale(locale);
  const sourceLocale = baseLocale === "zh-CN" ? "zh-CN" : "ko";
  const events = legacyHistoryEvents[sourceLocale];
  const churchEvents = legacyChurchHistoryEvents[sourceLocale];
  const defaults: Record<string, string> = {
    "about.tab.greeting": labels[baseLocale][0],
    "about.tab.history": labels[baseLocale][1],
    "history.title": sourceLocale === "zh-CN" ? "宣教会 沿革" : baseLocale === "ko" ? "선교회 연혁" : "Mission History",
    "history.church_title": sourceLocale === "zh-CN" ? "可乐东部教会 沿革" : baseLocale === "ko" ? "가락동부교회 연혁" : "Garak Dongbu Church History",
    "history.current": sourceLocale === "zh-CN" ? "现在" : baseLocale === "ko" ? "현재" : "Present",
  };
  events.forEach((event, index) => { defaults[`history.event.${index + 1}`] = event; });
  churchEvents.forEach((event, index) => { defaults[`history.church_event.${index + 1}`] = event; });
  const messages = await getTranslations(locale, defaults);

  return (
    <div className="legacy-subpage">
      <LegacySubHero kind="about" locale={locale} tabs={[
        { label: messages["about.tab.greeting"], href: `/${locale}/about` },
        { label: messages["about.tab.history"], href: `/${locale}/about/history`, active: true },
      ]} />
      <section className="legacy-history legacy-content-wrap">
        <div className="legacy-history-section">
          <h2 className="legacy-history-title legacy-history-title-mission">{messages["history.title"]}</h2>
          <div className="legacy-history-list">
            {legacyHistoryDates.map((date, index) => <div className="legacy-history-row" key={`${date}-${index}`}><strong>{date}</strong><span>{messages[`history.event.${index + 1}`]}</span></div>)}
          </div>
        </div>
        <div className="legacy-history-section">
          <h2 className="legacy-history-title legacy-history-title-church">{messages["history.church_title"]}</h2>
          <div className="legacy-history-list">
            {legacyChurchHistoryDates.map((date, index) => <div className="legacy-history-row" key={date}><strong>{date}{index === 0 ? ` ${messages["history.current"]}` : ""}</strong><span>{messages[`history.church_event.${index + 1}`]}</span></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
