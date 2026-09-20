import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canManageLanguages, getCurrentUser } from "@/lib/auth";
import { exportLanguageBundle, getManagedLocales } from "@/lib/language-admin";
import { isActiveLocale } from "@/lib/i18n-server";
import { importLanguagesAction, saveLanguageAction, saveTranslationAction } from "./actions";

const example = JSON.stringify({ languages: [{
  code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", flagEmoji: "🇻🇳",
  fallbackCode: "ko", isActive: true, isDefault: false, sortOrder: 60,
  translations: { "menu.about": "Giới thiệu", "menu.professors": "Giảng viên", "menu.membership": "Đăng ký" },
}] }, null, 2);

export default async function LanguageAdminPage({ params, searchParams }: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const user = await getCurrentUser();
  if (!user) redirect(`/${locale}/login`);
  if (!canManageLanguages(user)) notFound();
  const [{ status, error }, languages, bundle] = await Promise.all([searchParams, getManagedLocales(), exportLanguageBundle()]);

  return <div className="language-admin">
    <div className="section-heading admin-heading">
      <div><h1>언어 관리</h1><p className="muted">언어 메타정보와 화면 문구를 개별 또는 JSON으로 관리합니다.</p></div>
      <Link className="button secondary" href={`/${locale}/admin`}>관리 홈</Link>
    </div>
    {status ? <p className="admin-message success">{status}</p> : null}
    {error ? <p className="admin-message error">{error}</p> : null}

    <section className="form-panel language-panel">
      <h2>등록된 언어</h2>
      <div className="table-scroll"><table className="language-table"><thead><tr><th>언어</th><th>코드</th><th>대체 언어</th><th>상태</th><th>문구</th></tr></thead><tbody>
        {languages.map((item) => <tr key={item.code}>
          <td>{item.flagEmoji ?? "🌐"} {item.nativeName}<small>{item.name}</small></td><td><code>{item.code}</code></td>
          <td>{item.fallbackCode ?? "-"}</td><td>{item.isDefault ? "기본 / " : ""}{item.isActive ? "사용" : "중지"}</td><td>{item.translationCount}</td>
        </tr>)}
      </tbody></table></div>
    </section>

    <div className="admin-form-grid">
      <section className="form-panel language-panel"><h2>언어 추가·수정</h2>
        <p className="muted">같은 코드를 입력하면 기존 언어 정보가 수정됩니다.</p>
        <form action={saveLanguageAction.bind(null, locale)} className="stack-form">
          <label>언어 코드<input name="code" required placeholder="vi, pt-BR" /></label>
          <label>관리용 이름<input name="name" required placeholder="Vietnamese" /></label>
          <label>현지어 이름<input name="nativeName" required placeholder="Tiếng Việt" /></label>
          <div className="field-row"><label>국기<input name="flagEmoji" placeholder="🇻🇳" /></label><label>정렬 순서<input name="sortOrder" type="number" min="0" defaultValue="100" /></label></div>
          <label>대체 언어<select name="fallbackCode" defaultValue="en"><option value="">없음</option>{languages.map((item) => <option key={item.code} value={item.code}>{item.nativeName} ({item.code})</option>)}</select></label>
          <div className="checkbox-row"><label><input name="isActive" type="checkbox" defaultChecked /> 사이트에 표시</label><label><input name="isDefault" type="checkbox" /> 기본 언어</label></div>
          <button type="submit">언어 저장</button>
        </form>
      </section>

      <section className="form-panel language-panel"><h2>문구 하나 수정</h2>
        <p className="muted">키 단위로 번역을 추가하거나 덮어씁니다.</p>
        <form action={saveTranslationAction.bind(null, locale)} className="stack-form">
          <label>언어<select name="localeCode">{languages.map((item) => <option key={item.code} value={item.code}>{item.nativeName} ({item.code})</option>)}</select></label>
          <label>문구 키<input name="messageKey" required placeholder="menu.about" pattern="[a-z0-9_.-]+" /></label>
          <label>번역 내용<textarea name="value" required rows={7} /></label>
          <button type="submit">문구 저장</button>
        </form>
      </section>
    </div>

    <section className="form-panel language-panel"><h2>전체 JSON 일괄 등록</h2>
      <p className="muted">여러 언어와 각 언어의 전체 문구를 한 번에 추가·수정합니다. 오류가 있으면 전체 작업이 취소됩니다.</p>
      <details className="translation-key-guide"><summary>현재 화면 문구 키 안내</summary><p><code>menu.about</code>, <code>menu.professors</code>, <code>menu.membership</code>, <code>menu.lectures</code>, <code>menu.resources</code>, <code>common.site_name</code>, <code>common.login</code>, <code>common.logout</code>, <code>common.signed_in</code>, <code>common.admin</code>, <code>home.notice</code>, <code>home.lecture</code>, <code>home.family</code>, <code>home.check</code>, <code>home.verse.1.text</code>~<code>home.verse.3.citation</code>, <code>home.about.1</code>~<code>home.about.5</code>, <code>home.vision.1</code>~<code>home.vision.5</code>, <code>home.route.1</code>~<code>home.route.4</code>, <code>page.about.title</code> 등의 하위 페이지 제목, <code>resources.book_old</code> 등의 자료 탭</p></details>
      <form action={importLanguagesAction.bind(null, locale)} className="stack-form"><textarea className="code-editor" name="bundle" required rows={18} defaultValue={example} /><button type="submit">JSON 일괄 등록</button></form>
    </section>

    <section className="form-panel language-panel"><h2>현재 데이터 내보내기</h2>
      <p className="muted">아래 JSON에는 전체 사용 가능 키 목록(catalogKeys)과 현재 번역이 함께 들어 있습니다. 복사해 번역 작업 후 위에서 다시 등록할 수 있습니다.</p>
      <textarea className="code-editor" readOnly rows={18} value={bundle} aria-label="현재 전체 언어 JSON" />
    </section>
  </div>;
}
