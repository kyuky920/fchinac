import "server-only";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db, withTransaction } from "@/lib/db";
import type { AuthUser } from "@/lib/auth";
import type { Locale } from "@/lib/i18n";
import { createPublicId } from "@/lib/ids";

interface CountRow extends RowDataPacket { count: number }
interface WritableBoardRow extends RowDataPacket { id: number; board_key: string; name: string }

export interface AdminStats {
  users: number;
  posts: number;
  attachments: number;
  boards: number;
  courses: number;
  lessons: number;
  migrationIssues: number;
}

export interface WritableBoard {
  id: number;
  key: string;
  name: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  const [rows] = await db.query<(CountRow & { entity: string })[]>(
    `SELECT 'users' entity,COUNT(*) count FROM users
     UNION ALL SELECT 'posts',COUNT(*) FROM posts WHERE status<>'deleted'
     UNION ALL SELECT 'attachments',COUNT(*) FROM attachments
     UNION ALL SELECT 'boards',COUNT(*) FROM boards WHERE status='active'
     UNION ALL SELECT 'courses',COUNT(*) FROM lecture_courses WHERE is_active=TRUE
     UNION ALL SELECT 'lessons',COUNT(*) FROM lecture_lessons WHERE is_visible=TRUE
     UNION ALL SELECT 'migrationIssues',COUNT(*) FROM migration_issues WHERE resolved_at IS NULL`,
  );
  const values = Object.fromEntries(rows.map((row) => [row.entity, Number(row.count)]));
  return {
    users: values.users ?? 0,
    posts: values.posts ?? 0,
    attachments: values.attachments ?? 0,
    boards: values.boards ?? 0,
    courses: values.courses ?? 0,
    lessons: values.lessons ?? 0,
    migrationIssues: values.migrationIssues ?? 0,
  };
}

export async function getWritableBoards(user: AuthUser, locale: Locale): Promise<WritableBoard[]> {
  const placeholders = user.roles.map(() => "?").join(",");
  if (!placeholders) return [];
  const [rows] = await db.query<WritableBoardRow[]>(
    `SELECT b.id,b.board_key,COALESCE(bt.name,ko.name,b.board_key) name
       FROM boards b
       JOIN board_role_permissions brp ON brp.board_id=b.id AND brp.can_create=TRUE
       JOIN roles r ON r.id=brp.role_id AND r.role_key IN (${placeholders})
       LEFT JOIN board_translations bt ON bt.board_id=b.id AND bt.locale_code=?
       LEFT JOIN board_translations ko ON ko.board_id=b.id AND ko.locale_code='ko'
      WHERE b.status='active'
      GROUP BY b.id,bt.name,ko.name
      ORDER BY b.sort_order,b.id`,
    [...user.roles, locale],
  );
  return rows.map((row) => ({ id: row.id, key: row.board_key, name: row.name }));
}

export async function createPost(input: {
  user: AuthUser;
  boardKey: string;
  locale: Locale;
  title: string;
  body: string;
}): Promise<string> {
  const writableBoards = await getWritableBoards(input.user, input.locale);
  const board = writableBoards.find((item) => item.key === input.boardKey);
  if (!board) throw new Error("게시판 작성 권한이 없습니다.");
  const publicId = createPublicId();

  await withTransaction(async (connection) => {
    const [result] = await connection.execute<ResultSetHeader>(
      `INSERT INTO posts
         (public_id,board_id,author_user_id,status,visibility,published_at,created_at,updated_at)
       VALUES (?,?,?,'published','public',UTC_TIMESTAMP(3),UTC_TIMESTAMP(3),UTC_TIMESTAMP(3))`,
      [publicId, board.id, input.user.id],
    );
    await connection.execute(
      `INSERT INTO post_translations
         (post_id,locale_code,title,body,body_format,translation_status)
       VALUES (?,?,?,?,'plain','original')`,
      [result.insertId, input.locale, input.title, input.body],
    );
  });
  return publicId;
}
