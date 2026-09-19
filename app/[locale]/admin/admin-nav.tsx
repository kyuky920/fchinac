import Link from "next/link";
import type { AuthUser } from "@/lib/auth";

const items = [
  ["", "대시보드"],
  ["posts", "게시물·파일"],
  ["boards", "게시판·권한"],
  ["lectures", "동영상 강의"],
  ["users", "회원"],
  ["languages", "언어"],
  ["audit", "변경 이력"],
] as const;

export function AdminNav({ locale, user }: { locale: string; user: AuthUser }) {
  const isAdmin = user.roles.includes("admin");
  return <nav className="admin-console-nav" aria-label="관리자 메뉴">
    <strong>관리자 콘솔</strong>
    {items.map(([path, label], index) => {
      if (!isAdmin && index > 0) return null;
      return <Link key={path} href={`/${locale}/admin${path ? `/${path}` : ""}`}>{label}</Link>;
    })}
    <Link href={`/${locale}`}>사이트 보기</Link>
  </nav>;
}
