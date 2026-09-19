"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canManageUsers, getCurrentUser } from "@/lib/auth";
import { isActiveLocale } from "@/lib/i18n-server";
import { issuePasswordReset, updateMember } from "@/lib/members";

async function requireAdmin(locale:string) {
  if (!(await isActiveLocale(locale))) throw new Error("지원하지 않는 언어입니다.");
  const user=await getCurrentUser(); if(!user || !canManageUsers(user)) throw new Error("회원 관리 권한이 없습니다."); return user;
}
function errorMessage(error:unknown){return error instanceof Error?error.message:"처리하지 못했습니다."}

export async function updateMemberAction(locale:string,formData:FormData) {
  try {
    const actor=await requireAdmin(locale);
    await updateMember(actor,{publicId:String(formData.get("publicId")??""),status:formData.get("status"),roles:formData.getAll("roles")});
    revalidatePath(`/${locale}/admin/users`);
  } catch(error) { redirect(`/${locale}/admin/users?error=${encodeURIComponent(errorMessage(error))}`); }
  redirect(`/${locale}/admin/users?status=${encodeURIComponent("회원 정보가 저장되었습니다.")}`);
}

export interface ResetLinkState { error?:string; resetUrl?:string }
export async function issueResetLinkAction(locale:string,publicId:string,state:ResetLinkState):Promise<ResetLinkState>{
  void state;
  try { const actor=await requireAdmin(locale); const token=await issuePasswordReset(actor,publicId); return {resetUrl:`/${locale}/reset-password/${token}`}; }
  catch(error){return {error:errorMessage(error)}}
}
