import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser, roleKeysFor } from "@/lib/auth";
import { getBoards } from "@/lib/content";
import { getDictionary } from "@/lib/i18n";
import { getTranslations, isActiveLocale } from "@/lib/i18n-server";

export default async function BoardsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!(await isActiveLocale(locale))) notFound();
  const user = await getCurrentUser();
  const boards = await getBoards(locale, roleKeysFor(user));
  const dictionary = getDictionary(locale);
  const messages = await getTranslations(locale, { "boards.title": dictionary.boards });

  return (
    <section>
      <div className="section-heading"><h1>{messages["boards.title"]}</h1></div>
      <div className="grid">
        {boards.map((board) => (
          <Link className="card" href={`/${locale}/boards/${board.key}`} key={board.key}>
            <h3>{board.name}</h3>
            <p className="muted">{board.description ?? board.key}</p>
            <span className="count">{board.postCount}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
