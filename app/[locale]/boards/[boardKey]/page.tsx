import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, roleKeysFor } from "@/lib/auth";
import { getPosts, readableFileSize } from "@/lib/content";
import { formatDate, getDictionary } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero, ResourceTabs } from "@/app/[locale]/_components/legacy-subpage";

const resourceBoards = new Set(["book_old", "book_faith2", "book_faith", "book_data", "korean_reference"]);

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; boardKey: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale, boardKey } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const requestedPage = Number((await searchParams).page ?? "1");
  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const user = await getCurrentUser();
  const result = await getPosts(boardKey, locale, roleKeysFor(user), page);
  if (!result.board) notFound();
  const dictionary = getDictionary(locale);
  const isResource = resourceBoards.has(boardKey);
  const messages = await getTranslations(locale, {
    "boards.notice_badge": "Notice",
    "boards.empty": dictionary.noPosts,
    "boards.previous": dictionary.previous,
    "boards.next": dictionary.next,
    "resources.download": locale === "ko" ? "다운로드" : "Download",
    "resources.login_to_download": locale === "ko" ? "로그인 후 다운로드" : "Sign in to download",
  });

  return (
    <div className={isResource ? "legacy-subpage" : ""}>
      {isResource ? <LegacySubHero kind="resources" locale={locale} /> : null}
    <section className={isResource ? "legacy-resource-board legacy-content-wrap" : ""}>
      {isResource ? <ResourceTabs locale={locale} active={boardKey} /> : null}
      <div className="section-heading">
        <div>
          <h1>{result.board.name}</h1>
          {result.board.description ? <p className="muted">{result.board.description}</p> : null}
        </div>
      </div>
      <div className="post-list">
        {result.posts.length ? result.posts.map((post) => isResource ? (
          <article className="resource-list-item" key={post.publicId}>
            <Link className="post-row resource-post-summary" href={`/${locale}/boards/${boardKey}/${post.publicId}`}>
              <span className="post-title">{post.isPinned ? <span className="badge">{messages["boards.notice_badge"]}</span> : null}{post.title}</span>
              <span className="muted">{post.authorName}</span>
              <span className="muted">{formatDate(post.publishedAt, locale)}</span>
              <span className="muted">{post.viewCount}</span>
            </Link>
            {post.attachments.length ? (
              <div className="resource-downloads">
                {post.attachments.map((attachment) => user ? (
                  <a className="resource-download-link" href={`/api/attachments/${attachment.publicId}`} key={attachment.publicId} download>
                    <span>{attachment.originalFilename}</span>
                    <small>{readableFileSize(attachment.sizeBytes)}</small>
                    <strong>{messages["resources.download"]}</strong>
                  </a>
                ) : (
                  <Link className="resource-download-link login-required" href={`/${locale}/login`} key={attachment.publicId}>
                    <span>{attachment.originalFilename}</span>
                    <small>{readableFileSize(attachment.sizeBytes)}</small>
                    <strong>{messages["resources.login_to_download"]}</strong>
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        ) : (
          <Link className="post-row" href={`/${locale}/boards/${boardKey}/${post.publicId}`} key={post.publicId}>
            <span className="post-title">{post.isPinned ? <span className="badge">{messages["boards.notice_badge"]}</span> : null}{post.title}</span>
            <span className="muted">{post.authorName}</span>
            <span className="muted">{formatDate(post.publishedAt, locale)}</span>
            <span className="muted">{post.viewCount}</span>
          </Link>
        )) : <p className="card muted">{messages["boards.empty"]}</p>}
      </div>
      <nav className="pagination">
        {page > 1 ? <Link className="button secondary" href={`/${locale}/boards/${boardKey}?page=${page - 1}`}>{messages["boards.previous"]}</Link> : null}
        {result.hasNext ? <Link className="button secondary" href={`/${locale}/boards/${boardKey}?page=${page + 1}`}>{messages["boards.next"]}</Link> : null}
      </nav>
    </section>
    </div>
  );
}
