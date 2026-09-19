import Link from "next/link";
import { notFound } from "next/navigation";
import { knownLocale } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero } from "@/app/[locale]/_components/legacy-subpage";

const labels = { ko: ["공지사항", "회원가입", "공지사항을 꼭 확인하세요."], en: ["Notice", "Register", "Please read these notices."], "zh-CN": ["公告事项", "注册会员", "请务必确认公告事项。"], mn: ["Мэдэгдэл", "Бүртгүүлэх", "Мэдэгдлийг уншина уу."], es: ["Avisos", "Registrarse", "Lea estos avisos."] } as const;
const noticeCopy = {
  ko: ["반드시 로그인하고 공부해야 공부한 근거가 남습니다.", "본 선교회의 강의 동영상을 외장하드(메모리)에 저장하여 보급하고 있으며, 그 동영상을 현지에서 모니터로 회원들에게 신학(성경)공부를 시킬 수 있습니다.", "만일 본 선교회의 홈페이지가 열리지 않으면, www.abcts.org, www.garakdb.org 를 접속하시고, true323@naver.com, agape323@gmail.com으로 연락하세요.", "더 많은 과목을 공부하려면, 홈에서 연관된 사이트를 방문하세요. www.abcts.org, www.abctsm.org", "공부를 마친 자에게는 수료증을 수여합니다. 그리고 학위 또는 졸업장을 받으시려면 본 선교회로 연락하시면 자세한 안내를 받으실 수 있습니다.", "더 많은 정보를 원하시면 본 선교회의 이메일로 연락하세요. true323@naver.com, agape323@gmail.com", "유튜브(www.youtube.com)에서 ABCMISSION 을 검색하시면 영상을 보실수 있습니다.", "만일 회원이 비성서적인 주장을 하거나 이단과 사이비한 사상을 주장하면 공부했던 모든 근거를 지우고, 제명 처리합니다."],
  "zh-CN": ["务必登录后学习，以保证听课记录得以保存。", "提供外置硬盘（存储器）: 可将本宣教会的讲课视频存储在外置硬盘（存储器）中进行推广. 在当地可用显示器让会员们学习神学（圣经）. ", "如果本宣教会网站无法打开，请查看 www.abcts.org， www.abctsm.org www.garakdb.org，并与 true323@naver.com, agape323@gmail.com 联系.", "想学习更多课程，请访问主页相关网站. www.abcts.org  www.abctsm.org ", "对学习完成者颁发结业证书. 如果想要拿学位或毕业证，请联系本宣教会获取详细介绍.", "如需了解更多信息，请用邮件联系本宣教会. true323@naver.com or agape323@gmail.com", "在YouTube网站(www.youtube.com)搜索ABCMISSION可查看视频。", "如发现会员主张非圣书性的或异端邪说思想，则进行除名处理. 另外，学习结束后，如果发现提出非圣书性的主张或异端邪说思想，则删除所学过的所有根据，并进行除名处理."],
  en: ["You must sign in before studying for your learning record to be saved.", "The mission distributes lecture videos on external drives or memory devices so members can study theology and the Bible locally using a monitor.", "If this website is unavailable, visit www.abcts.org or www.garakdb.org, or contact true323@naver.com or agape323@gmail.com.", "To study more subjects, visit the related sites at www.abcts.org and www.abctsm.org.", "A certificate of completion is awarded to those who finish their studies. Contact the mission for information about degrees or diplomas.", "For more information, contact true323@naver.com or agape323@gmail.com.", "Search for ABCMISSION on YouTube (www.youtube.com) to watch the videos.", "Members who advocate unbiblical, cultic, or heretical teachings will have their study records removed and their membership terminated."],
} as const;

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const baseLocale = knownLocale(locale);
  const base = labels[baseLocale];
  const notices = noticeCopy[baseLocale === "zh-CN" ? "zh-CN" : baseLocale === "ko" ? "ko" : "en"];
  const defaults: Record<string, string> = { "membership.tab.notice": base[0], "membership.tab.register": base[1], "membership.heading": base[2] };
  notices.forEach((notice, index) => { defaults[`membership.notice.${index + 1}`] = notice; });
  const messages = await getTranslations(locale, defaults);
  const noticeEightPrefix = baseLocale === "ko" ? "만일 회원이 " : baseLocale === "zh-CN" ? "如发现会员" : "Members who ";

  return <div className="legacy-subpage"><LegacySubHero kind="membership" locale={locale} tabs={[{ label: messages["membership.tab.notice"], href: `/${locale}/membership`, active: true }, { label: messages["membership.tab.register"], href: `/${locale}/register` }]} /><section className="legacy-membership legacy-content-wrap"><h2>{messages["membership.heading"]}</h2><div className="legacy-notices">{notices.map((_, index) => {
    const notice = messages[`membership.notice.${index + 1}`];
    const hasPrefix = index === 7 && notice.startsWith(noticeEightPrefix);
    return <article key={index}><strong>{String(index + 1).padStart(2, "0")}</strong><p>{index === 7 ? <>{hasPrefix ? noticeEightPrefix : null}<span className="legacy-notice-alert">{hasPrefix ? notice.slice(noticeEightPrefix.length) : notice}</span></> : notice}</p></article>;
  })}</div><div className="legacy-center"><Link className="legacy-join-button" href={`/${locale}/register`}>{messages["membership.tab.register"]}</Link></div></section></div>;
}
