import { notFound, redirect } from "next/navigation";
import { canManageContent, getCurrentUser } from "@/lib/auth";
import { isActiveLocale } from "@/lib/i18n-server";
import { AdminNav } from "./admin-nav";

export default async function AdminLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (!canManageContent(user)) notFound();
  return <div className="admin-console"><AdminNav locale={locale} user={user} /><div className="admin-console-body">{children}</div></div>;
}
