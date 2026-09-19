import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LoginForm } from "@/app/[locale]/login/login-form";
import Link from "next/link";
import { getDictionary, knownLocale } from "@/lib/i18n";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  if (await getCurrentUser()) redirect(`/${locale}`);
  const dictionary = getDictionary(locale);
  const english = knownLocale(locale) === "en";
  const messages = await getTranslations(locale, {
    "login.title": english ? "Sign in" : "로그인", "login.description": english ? "You can use the username and password from the previous website." : "기존 홈페이지에서 사용하던 아이디와 비밀번호를 사용할 수 있습니다.",
    "login.identifier": english ? "Username or email" : "아이디 또는 이메일", "login.password": english ? "Password" : "비밀번호", "login.submit": english ? "Sign in" : "로그인", "login.pending": english ? "Signing in…" : "로그인 중…", "login.register": dictionary.register,
  });

  return (
    <section className="auth-panel">
      <h1>{messages["login.title"]}</h1>
      <p className="muted">{messages["login.description"]}</p>
      <LoginForm locale={locale} labels={{ identifier: messages["login.identifier"], password: messages["login.password"], submit: messages["login.submit"], pending: messages["login.pending"] }} />
      <p className="auth-secondary"><Link href={`/${locale}/register`}>{messages["login.register"]}</Link></p>
    </section>
  );
}
