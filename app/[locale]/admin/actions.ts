"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, canManageContent } from "@/lib/auth";
import { createPost } from "@/lib/admin";
import { isActiveLocale } from "@/lib/i18n-server";

export interface CreatePostState { error?: string }

const postSchema = z.object({
  boardKey: z.string().regex(/^[a-z0-9_-]{1,64}$/),
  title: z.string().trim().min(1).max(500),
  body: z.string().trim().min(1).max(2_000_000),
});

export async function createPostAction(
  localeValue: string,
  _state: CreatePostState,
  formData: FormData,
): Promise<CreatePostState> {
  if (!(await isActiveLocale(localeValue))) return { error: "지원하지 않는 언어입니다." };
  const user = await getCurrentUser();
  if (!user || !canManageContent(user)) return { error: "게시물 작성 권한이 없습니다." };
  const parsed = postSchema.safeParse({
    boardKey: formData.get("boardKey"),
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: "제목과 본문을 확인해 주세요." };

  let publicId: string;
  try {
    publicId = await createPost({ user, locale: localeValue, ...parsed.data });
  } catch (error) {
    return { error: error instanceof Error ? error.message : "게시물을 저장하지 못했습니다." };
  }
  revalidatePath(`/${localeValue}/boards/${parsed.data.boardKey}`);
  if (user.roles.includes("admin")) {
    redirect(`/${localeValue}/admin/posts/${publicId}?status=${encodeURIComponent("게시물을 저장했습니다. 첨부파일을 등록할 수 있습니다.")}`);
  }
  redirect(`/${localeValue}/boards/${parsed.data.boardKey}/${publicId}`);
}
