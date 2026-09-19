import { notFound, redirect } from "next/navigation";
import { isActiveLocale } from "@/lib/i18n-server";

export default async function RegisterPage({ params }: { params: Promise<{ locale:string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  redirect(`/${locale}/membership#register`);
}
