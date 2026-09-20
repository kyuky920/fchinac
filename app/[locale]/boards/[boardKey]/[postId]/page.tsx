import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, roleKeysFor } from "@/lib/auth";
import { getPost, readableFileSize } from "@/lib/content";
import { sanitizeLegacyHtml } from "@/lib/html";
import { formatDate, getDictionary } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";
import { LegacySubHero, ResourceTabs } from "@/app/[locale]/_components/legacy-subpage";
import { LECTURE_NOTES_BOARD_KEY, isDownloadBoard, isResourceBoard } from "@/lib/board-presentation";

export default async function PostPage({ params }: {
  params: Promise<{ locale: string; boardKey: string; postId: string }>;
}) {
  const { locale, boardKey, postId } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const user = await getCurrentUser();
  const post = await getPost(boardKey, postId, locale, roleKeysFor(user));
  if (!post) notFound();
  const dictionary = getDictionary(locale);
  const isResource = isResourceBoard(boardKey);
  const showsDownloads = isDownloadBoard(boardKey);
  const isLectureNotes = boardKey === LECTURE_NOTES_BOARD_KEY;
  const messages = await getTranslations(locale, {
    "post.views": "Views",
    "post.attachments": dictionary.attachments,
    "resources.login_to_download": locale === "ko" ? "로그인 후 다운로드" : "Sign in to download",
  });

  return (
    <div className={showsDownloads ? "legacy-subpage" : ""}>
      {isLectureNotes ? <LegacySubHero kind="notes" locale={locale} /> : isResource ? <LegacySubHero kind="resources" locale={locale} /> : null}
      {isResource ? <div className="legacy-content-wrap legacy-post-tabs"><ResourceTabs locale={locale} active={boardKey} /></div> : null}
    <article className="article">
      <Link className="muted" href={`/${locale}/boards/${boardKey}`}>← {post.boardName}</Link>
      <h1>{post.title}</h1>
      <div className="article-meta">
        <span>{post.authorName}</span>
        <span>{formatDate(post.publishedAt, locale)}</span>
        <span>{messages["post.views"]} {post.viewCount + 1}</span>
      </div>
      {post.bodyFormat === "html" ? (
        <div className="article-body" dangerouslySetInnerHTML={{ __html: sanitizeLegacyHtml(post.body) }} />
      ) : (
        <div className="article-body" style={{ whiteSpace: "pre-wrap" }}>{post.body}</div>
      )}
      {post.attachments.length ? (
        <section className="attachment-list">
          <strong>{messages["post.attachments"]}</strong>
          <ul>
            {post.attachments.map((attachment) => (
              <li key={attachment.publicId}>
                {user ? (
                  <a href={`/api/attachments/${attachment.publicId}`} download>
                    {attachment.originalFilename} ({readableFileSize(attachment.sizeBytes)})
                  </a>
                ) : (
                  <Link href={`/${locale}/login`}>
                    {attachment.originalFilename} ({readableFileSize(attachment.sizeBytes)}) · {messages["resources.login_to_download"]}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
    </div>
  );
}
