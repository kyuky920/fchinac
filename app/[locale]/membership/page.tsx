import Link from "next/link";
import { notFound } from "next/navigation";
import { knownLocale } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero } from "@/app/[locale]/_components/legacy-subpage";

const labels = { ko: ["공지사항", "회원가입", "공지사항을 꼭 확인하세요."], en: ["Notice", "Register", "Please read these notices."], "zh-CN": ["公告事项", "注册会员", "请务必确认公告事项。"], mn: ["Мэдэгдэл", "Бүртгүүлэх", "Мэдэгдлийг уншина уу."], es: ["Avisos", "Registrarse", "Lea estos avisos."] } as const;
const noticeNumbers = [1, 2, 3, 5, 8] as const;
const noticeCopy = {
  ko: ["로그인하고 공부하시오.", "본 선교회의 강의 동영상을 외장하드(메모리)에 저장하여 보급하고 있으며, 그 동영상을 현지에서 모니터로 회원들에게 신학(성경)공부를 시킬 수 있습니다.", "당신이 사용하는 언어가 우리 강의에서 번역이 안되어 있는 경우에는, 우리의 영어로 된 강의 동영상을 AI자막 또는 번역 앱 또는 더빙 앱을 사용하여 번역하십시오. 또는 \"강의록\"에 들어가서 영어로된 \"강의 워드 파일\"을 번역하여 사용하시오.", "공부를 마친 자에게는 수료증을 수여합니다. 그리고 학위 또는 졸업장을 받으시려면 본 선교회로 연락하시면 자세한 안내를 받으실 수 있습니다.", "만일 회원이 비성서적인 주장을 하거나 이단과 사이비한 사상을 주장하면 공부했던 모든 근거를 지우고, 제명 처리합니다."],
  "zh-CN": ["请登录后学习。", "提供外置硬盘（存储器）: 可将本宣教会的讲课视频存储在外置硬盘（存储器）中进行推广. 在当地可用显示器让会员们学习神学（圣经）. ", "如果我们的课程没有提供您所使用语言的翻译，请使用 AI 字幕、翻译应用程序或配音应用程序翻译我们的英语讲课视频。或者进入“讲义”，翻译并使用英语“讲课 Word 文件”。", "对学习完成者颁发结业证书. 如果想要拿学位或毕业证，请联系本宣教会获取详细介绍.", "如发现会员主张非圣书性的或异端邪说思想，则进行除名处理. 另外，学习结束后，如果发现提出非圣书性的主张或异端邪说思想，则删除所学过的所有根据，并进行除名处理."],
  en: ["Sign in before studying.", "The mission distributes lecture videos on external drives or memory devices so members can study theology and the Bible locally using a monitor.", "If your language is not available in our lectures, translate our English lecture videos using AI captions, a translation app, or a dubbing app. Alternatively, open \"Lecture Notes\" and translate the English \"lecture Word file\" for use.", "A certificate of completion is awarded to those who finish their studies. Contact the mission for information about degrees or diplomas.", "Members who advocate unbiblical, cultic, or heretical teachings will have their study records removed and their membership terminated."],
} as const;

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const baseLocale = knownLocale(locale);
  const base = labels[baseLocale];
  const notices = noticeCopy[baseLocale === "zh-CN" ? "zh-CN" : baseLocale === "ko" ? "ko" : "en"];
  const defaults: Record<string, string> = { "membership.tab.notice": base[0], "membership.tab.register": base[1], "membership.heading": base[2] };
  notices.forEach((notice, index) => { defaults[`membership.notice.${noticeNumbers[index]}`] = notice; });
  const messages = await getTranslations(locale, defaults);
  const noticeEightPrefix = baseLocale === "ko" ? "만일 회원이 " : baseLocale === "zh-CN" ? "如发现会员" : "Members who ";

  return <div className="legacy-subpage"><LegacySubHero kind="membership" locale={locale} tabs={[{ label: messages["membership.tab.notice"], href: `/${locale}/membership`, active: true }, { label: messages["membership.tab.register"], href: `/${locale}/register` }]} /><section className="legacy-membership legacy-content-wrap"><h2>{messages["membership.heading"]}</h2><div className="legacy-notices">{noticeNumbers.map((number) => {
    const notice = messages[`membership.notice.${number}`];
    const hasPrefix = number === 8 && notice.startsWith(noticeEightPrefix);
    return <article key={number}><strong>{String(number).padStart(2, "0")}</strong><p>{number === 8 ? <>{hasPrefix ? noticeEightPrefix : null}<span className="legacy-notice-alert">{hasPrefix ? notice.slice(noticeEightPrefix.length) : notice}</span></> : notice}</p></article>;
  })}</div><div className="legacy-center"><Link className="legacy-join-button" href={`/${locale}/register`}>{messages["membership.tab.register"]}</Link></div></section></div>;
}
