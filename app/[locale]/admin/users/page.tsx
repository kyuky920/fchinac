import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canManageUsers, getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/i18n";
import { isActiveLocale } from "@/lib/i18n-server";
import { listMemberAudit, listMembers } from "@/lib/members";
import { ResetLinkButton } from "./reset-link-button";
import { updateMemberAction } from "./actions";

const statusLabels={pending:"승인 대기",active:"활성",blocked:"차단",withdrawn:"탈퇴"} as const;
const actionLabels:Record<string,string>={self_registered:"회원가입 신청",member_updated:"회원 정보 변경",password_reset_issued:"비밀번호 링크 발급",password_reset_completed:"비밀번호 변경 완료"};
const genderLabels:Record<string,string>={male:"남성",female:"여성",other:"기타"};

export default async function UserAdminPage({params,searchParams}:{params:Promise<{locale:string}>;searchParams:Promise<{q?:string;statusFilter?:string;page?:string;status?:string;error?:string}>}){
  const {locale}=await params;if(!(await isActiveLocale(locale)))notFound();const actor=await getCurrentUser();if(!actor)redirect(`/${locale}/login`);if(!canManageUsers(actor))notFound();
  const query=await searchParams;const page=Number(query.page??1);const [{members,total,pageSize},audit]=await Promise.all([listMembers({query:query.q,status:query.statusFilter,page}),listMemberAudit(20)]);const pages=Math.max(1,Math.ceil(total/pageSize));
  return <div className="user-admin"><div className="section-heading admin-heading"><div><h1>회원 관리</h1><p className="muted">총 {total}명</p></div><Link className="button secondary" href={`/${locale}/admin`}>관리 홈</Link></div>
    {query.status?<p className="admin-message success">{query.status}</p>:null}{query.error?<p className="admin-message error">{query.error}</p>:null}
    <form className="member-filter" method="get"><input name="q" defaultValue={query.q} placeholder="아이디, 이메일, 이름 검색"/><select name="statusFilter" defaultValue={query.statusFilter??""}><option value="">전체 상태</option>{Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><button type="submit">검색</button></form>
    <div className="member-card-list">{members.map((member)=><article className="member-card" key={member.publicId}><header><div><strong>{member.displayName}</strong><span>@{member.username}</span></div><span className={`member-status ${member.status}`}>{statusLabels[member.status]}</span></header><dl><div><dt>이메일</dt><dd>{member.email??"-"}</dd></div><div><dt>언어</dt><dd>{member.preferredLocaleCode}</dd></div><div><dt>거주 국가</dt><dd>{member.residenceCountry??"-"}</dd></div><div><dt>성별</dt><dd>{member.gender?genderLabels[member.gender]??member.gender:"-"}</dd></div><div><dt>가입</dt><dd>{formatDate(member.joinedAt,locale)}</dd></div><div><dt>최근 로그인</dt><dd>{member.lastLoginAt?formatDate(member.lastLoginAt,locale):"-"}</dd></div></dl>
      <form action={updateMemberAction.bind(null,locale)} className="member-manage-form"><input type="hidden" name="publicId" value={member.publicId}/><label>상태<select name="status" defaultValue={member.status}>{Object.entries(statusLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><fieldset><legend>권한</legend>{(["member","editor","admin"] as const).map((role)=><label key={role}><input type="checkbox" name="roles" value={role} defaultChecked={member.roles.includes(role)}/>{role}</label>)}</fieldset><button className="small-button" type="submit">저장</button></form><ResetLinkButton locale={locale} publicId={member.publicId}/></article>)}</div>
    <nav className="pagination">{page>1?<Link className="button secondary" href={`?q=${encodeURIComponent(query.q??"")}&statusFilter=${encodeURIComponent(query.statusFilter??"")}&page=${page-1}`}>이전</Link>:null}<span>{page} / {pages}</span>{page<pages?<Link className="button secondary" href={`?q=${encodeURIComponent(query.q??"")}&statusFilter=${encodeURIComponent(query.statusFilter??"")}&page=${page+1}`}>다음</Link>:null}</nav>
    <section className="form-panel language-panel"><h2>최근 회원 관리 이력</h2><div className="audit-list">{audit.map((item)=><p key={item.id}><strong>{item.targetName}</strong><span>{actionLabels[item.action]??item.action}</span><small>{item.actorName?`처리: ${item.actorName}`:"사용자 처리"} · {formatDate(item.createdAt,locale)}</small></p>)}</div></section>
  </div>;
}
