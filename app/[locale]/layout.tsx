import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCurrentUser, canManageContent } from "@/lib/auth";
import { getDictionary, isRtlLocale, knownLocale } from "@/lib/i18n";
import { getActiveLocales, getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { logoutAction } from "@/app/[locale]/logout-action";
import { legacyContact } from "@/lib/legacy-content";
import { MobileNavigation } from "@/app/[locale]/mobile-navigation";

export const dynamic = "force-dynamic";

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: rawLocale } = await params;
  if (!(await isActiveLocale(rawLocale))) notFound();
  const locale = rawLocale;
  const dictionary = getDictionary(locale);
  const baseLocale = knownLocale(locale);
  const contact = legacyContact[baseLocale === "zh-CN" ? "zh-CN" : baseLocale === "ko" ? "ko" : "en"];
  const user = await getCurrentUser();
  const [activeLocales, messages] = await Promise.all([
    getActiveLocales(),
    getTranslations(locale, {
      "menu.about": "선교회 소개", "menu.professors": "교수 소개", "menu.membership": "가입안내",
      "menu.lectures": "동영상강의", "menu.resources": "서적과 자료",
      "common.site_name": dictionary.siteName, "common.login": dictionary.login,
      "common.logout": dictionary.logout, "common.admin": dictionary.admin, "common.register": dictionary.register,
      "common.address": contact.address, "common.footer_disclaimer": contact.disclaimer,
      "legal.terms": baseLocale === "ko" ? "이용약관" : "Terms of Use",
      "legal.privacy": baseLocale === "ko" ? "개인정보 처리방침" : "Privacy Policy",
    }),
  ]);
  const menu = [messages["menu.about"], messages["menu.professors"], messages["menu.membership"], messages["menu.lectures"], messages["menu.resources"]];
  const currentLanguage = activeLocales.find((item) => item.code === locale)!;
  const logo = locale === "zh-CN" ? "/legacy/images/logo_cn.png" : "/legacy/images/logo_kr.png";
  const menuHrefs = ["about", "professors", "membership", "lectures", "boards/book_old"];

  return (
    <div className="locale-root" lang={locale} dir={isRtlLocale(locale) ? "rtl" : "ltr"}>
      <header className="legacy-header">
        <div className="legacy-global">
          <div className="legacy-wrap legacy-global-inner">
            <span className="language-label">Select Language</span>
            <details className="language-select">
              <summary>
                <span aria-hidden="true">{currentLanguage.flagEmoji ?? "🌐"}</span>
                {currentLanguage.nativeName}
              </summary>
              <div className="language-options">
                {activeLocales.map((item) => (
                  <Link href={`/${item.code}`} key={item.code}>
                    <span aria-hidden="true">{item.flagEmoji ?? "🌐"}</span>
                    {item.nativeName}
                  </Link>
                ))}
              </div>
            </details>
          </div>
        </div>
        <div className="legacy-wrap legacy-navigation">
          <MobileNavigation
            siteName={messages["common.site_name"]}
            menuLinks={menu.map((label, index) => ({ href: `/${locale}/${menuHrefs[index]}`, label }))}
            accountLinks={!user ? [
              { href: `/${locale}/login`, label: messages["common.login"] },
              { href: `/${locale}/membership#register`, label: messages["common.register"] },
            ] : []}
            languageLinks={activeLocales.map((item) => ({
              href: `/${item.code}`,
              label: item.nativeName,
              flagEmoji: item.flagEmoji ?? "🌐",
            }))}
          />
          <Link className="legacy-logo" href={`/${locale}`} aria-label={messages["common.site_name"]}>
            <Image src={logo} alt={messages["common.site_name"]} width={locale === "zh-CN" ? 279 : 230} height={50} priority />
          </Link>
          <nav className="legacy-menu" aria-label="Main navigation">
            <Link href={`/${locale}/about`}>{menu[0]}</Link>
            <Link href={`/${locale}/professors`}>{menu[1]}</Link>
            <Link href={`/${locale}/membership`}>{menu[2]}</Link>
            <Link href={`/${locale}/lectures`}>{menu[3]}</Link>
            <Link href={`/${locale}/boards/book_old`}>{menu[4]}</Link>
          </nav>
          <div className="user-area legacy-user-area">
            {user ? (
              <>
                <span>{user.displayName}</span>
                <form action={logoutAction.bind(null, locale)}>
                  <button className="link-button" type="submit">{messages["common.logout"]}</button>
                </form>
              </>
            ) : (
              <><Link href={`/${locale}/login`}>{messages["common.login"]}</Link><span aria-hidden="true">|</span><Link className="legacy-signup-link" href={`/${locale}/membership#register`}>{messages["common.register"]}</Link></>
            )}
            {canManageContent(user) ? <Link href={`/${locale}/admin`}>{messages["common.admin"]}</Link> : null}
          </div>
          <Link className="legacy-mobile-login" href={`/${locale}/login`} aria-label={messages["common.login"]}><Image src="/legacy/images/icon_login.png" alt="" width={23} height={23} /></Link>
        </div>
      </header>
      <main className="shell">{children}</main>
      <footer className="footer legacy-footer">
        <nav className="legacy-legal-links" aria-label="Legal"><Link href={`/${locale}/terms`}>{messages["legal.terms"]}</Link><Link href={`/${locale}/privacy`}>{messages["legal.privacy"]}</Link></nav>
        <p>{messages["common.address"]} · TEL. 02-402-4169 / 010.2480.7673 · FAX. 02-431-3538</p>
        <p>E-mail. ihsihope@gmail.com · true323@naver.com</p>
        <p>{messages["common.footer_disclaimer"]}</p>
        <p>CopyrightⓒABCMISSION. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
