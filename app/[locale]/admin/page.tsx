import { notFound, redirect } from "next/navigation";
import { canManageContent, getCurrentUser } from "@/lib/auth";
import { getAdminStats, getWritableBoards } from "@/lib/admin";
import { isActiveLocale } from "@/lib/i18n-server";
import { PostForm } from "@/app/[locale]/admin/post-form";
import Link from "next/link";
import { canManageLanguages } from "@/lib/auth";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (!canManageContent(user)) notFound();
  const [stats, boards] = await Promise.all([getAdminStats(), getWritableBoards(user, locale)]);

  return (
    <>
      <section>
        <div className="section-heading admin-heading"><div><h1>관리 현황</h1><p className="muted">회원, 게시판, 자료와 동영상 강의를 한 곳에서 관리합니다.</p></div>{canManageLanguages(user) ? <div className="admin-actions"><Link className="button" href={`/${locale}/admin/posts`}>게시물 관리</Link><Link className="button secondary" href={`/${locale}/admin/lectures`}>강의 관리</Link></div> : null}</div>
        <div className="stats">
          <div className="stat"><strong>{stats.users}</strong><span>회원</span></div>
          <div className="stat"><strong>{stats.posts}</strong><span>게시물</span></div>
          <div className="stat"><strong>{stats.attachments}</strong><span>첨부파일</span></div>
          <div className="stat"><strong>{stats.boards}</strong><span>게시판</span></div>
          <div className="stat"><strong>{stats.courses}</strong><span>강의 과목</span></div>
          <div className="stat"><strong>{stats.lessons}</strong><span>공개 차시</span></div>
          <div className="stat"><strong>{stats.migrationIssues}</strong><span>이전 확인사항</span></div>
        </div>
      </section>
      <section className="form-panel" id="new-post">
        <h2>게시물 작성</h2>
        <p className="muted">선택한 언어의 원문으로 저장됩니다.</p>
        <PostForm boards={boards} locale={locale} />
      </section>
    </>
  );
}
