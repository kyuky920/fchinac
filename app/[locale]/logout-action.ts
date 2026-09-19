"use server";

import { redirect } from "next/navigation";
import { logout } from "@/lib/auth";
import { isActiveLocale } from "@/lib/i18n-server";

export async function logoutAction(locale: string): Promise<never> {
  await logout();
  redirect(`/${(await isActiveLocale(locale)) ? locale : "ko"}`);
}
