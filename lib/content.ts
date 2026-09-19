import "server-only";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { Locale } from "@/lib/i18n";
import type { RoleKey } from "@/lib/auth";

export interface BoardSummary {
  key: string;
  name: string;
  description: string | null;
  postCount: number;
}

export interface PostSummary {
  publicId: string;
  title: string;
  authorName: string;
  publishedAt: Date;
  viewCount: number;
  isPinned: boolean;
  attachments: AttachmentSummary[];
}

export interface AttachmentSummary {
  publicId: string;
  originalFilename: string;
  sizeBytes: number;
  mimeType: string | null;
  downloadCount: number;
}

export interface PostDetail extends PostSummary {
  boardKey: string;
  boardName: string;
  body: string;
  bodyFormat: "html" | "markdown" | "plain";
  attachments: AttachmentSummary[];
}

interface BoardRow extends RowDataPacket {
  board_key: string;
  name: string;
  description: string | null;
  post_count: number;
}

interface PostRow extends RowDataPacket {
  id: number;
  public_id: string;
  title: string;
  author_name: string;
  published_at: Date;
  view_count: number;
  is_pinned: number;
}

interface PostDetailRow extends PostRow {
  board_key: string;
  board_name: string;
  body: string;
  body_format: PostDetail["bodyFormat"];
}

interface AttachmentRow extends RowDataPacket {
  post_id: number;
  public_id: string;
  original_filename: string;
  size_bytes: number;
  mime_type: string | null;
  download_count: number;
}

function rolePlaceholders(roles: RoleKey[]): string {
  return roles.map(() => "?").join(",");
}

export async function getBoards(locale: Locale, roles: RoleKey[]): Promise<BoardSummary[]> {
  const [rows] = await db.query<BoardRow[]>(
    `SELECT b.board_key,
            COALESCE(bt.name, ko.name, b.board_key) AS name,
            COALESCE(bt.description, ko.description) AS description,
            COUNT(DISTINCT CASE WHEN p.status='published' THEN p.id END) AS post_count
       FROM boards b
       JOIN board_role_permissions brp ON brp.board_id=b.id AND brp.can_list=TRUE
       JOIN roles r ON r.id=brp.role_id AND r.role_key IN (${rolePlaceholders(roles)})
       LEFT JOIN board_translations bt ON bt.board_id=b.id AND bt.locale_code=?
       LEFT JOIN board_translations ko ON ko.board_id=b.id AND ko.locale_code='ko'
       LEFT JOIN posts p ON p.board_id=b.id
      WHERE b.status='active'
      GROUP BY b.id, bt.name, bt.description, ko.name, ko.description
      ORDER BY b.sort_order, b.id`,
    [...roles, locale],
  );
  return rows.map((row) => ({
    key: row.board_key,
    name: row.name,
    description: row.description,
    postCount: Number(row.post_count),
  }));
}

export async function getPosts(
  boardKey: string,
  locale: Locale,
  roles: RoleKey[],
  page: number,
  pageSize = 20,
): Promise<{ board: BoardSummary | null; posts: PostSummary[]; hasNext: boolean }> {
  const [boardRows] = await db.query<BoardRow[]>(
    `SELECT b.board_key, COALESCE(bt.name, ko.name, b.board_key) name,
            COALESCE(bt.description, ko.description) description,
            COUNT(DISTINCT CASE WHEN p.status='published' THEN p.id END) post_count
       FROM boards b
       JOIN board_role_permissions brp ON brp.board_id=b.id AND brp.can_list=TRUE
       JOIN roles r ON r.id=brp.role_id AND r.role_key IN (${rolePlaceholders(roles)})
       LEFT JOIN board_translations bt ON bt.board_id=b.id AND bt.locale_code=?
       LEFT JOIN board_translations ko ON ko.board_id=b.id AND ko.locale_code='ko'
       LEFT JOIN posts p ON p.board_id=b.id
      WHERE b.board_key=? AND b.status='active'
      GROUP BY b.id, bt.name, bt.description, ko.name, ko.description
      LIMIT 1`,
    [...roles, locale, boardKey],
  );
  const boardRow = boardRows[0];
  if (!boardRow) return { board: null, posts: [], hasNext: false };

  const offset = Math.max(0, page - 1) * pageSize;
  const [rows] = await db.query<PostRow[]>(
    `SELECT p.id, p.public_id,
            COALESCE(pt.title, ko.title, '[untitled]') title,
            COALESCE(u.display_name, p.guest_name, 'Unknown') author_name,
            p.published_at, p.view_count, p.is_pinned
       FROM posts p
       JOIN boards b ON b.id=p.board_id
       JOIN board_role_permissions brp ON brp.board_id=b.id AND brp.can_read=TRUE
       JOIN roles r ON r.id=brp.role_id AND r.role_key IN (${rolePlaceholders(roles)})
       LEFT JOIN post_translations pt ON pt.post_id=p.id AND pt.locale_code=?
       LEFT JOIN post_translations ko ON ko.post_id=p.id AND ko.locale_code='ko'
       LEFT JOIN users u ON u.id=p.author_user_id
      WHERE b.board_key=? AND p.status='published'
      GROUP BY p.id, pt.title, ko.title, u.display_name
      ORDER BY p.is_pinned DESC, p.published_at DESC, p.id DESC
      LIMIT ? OFFSET ?`,
    [...roles, locale, boardKey, pageSize + 1, offset],
  );

  const visibleRows = rows.slice(0, pageSize);
  const attachmentsByPostId = new Map<number, AttachmentSummary[]>();
  if (visibleRows.length) {
    const postIds = visibleRows.map((row) => row.id);
    const [attachmentRows] = await db.query<AttachmentRow[]>(
      `SELECT post_id, public_id, original_filename, size_bytes, mime_type, download_count
         FROM attachments
        WHERE post_id IN (${postIds.map(() => "?").join(",")})
        ORDER BY post_id, sort_order, id`,
      postIds,
    );
    for (const attachment of attachmentRows) {
      const list = attachmentsByPostId.get(attachment.post_id) ?? [];
      list.push(mapAttachment(attachment));
      attachmentsByPostId.set(attachment.post_id, list);
    }
  }

  return {
    board: {
      key: boardRow.board_key,
      name: boardRow.name,
      description: boardRow.description,
      postCount: Number(boardRow.post_count),
    },
    posts: visibleRows.map((row) => mapPost(row, attachmentsByPostId.get(row.id) ?? [])),
    hasNext: rows.length > pageSize,
  };
}

export async function getPost(
  boardKey: string,
  publicId: string,
  locale: Locale,
  roles: RoleKey[],
): Promise<PostDetail | null> {
  const [rows] = await db.query<PostDetailRow[]>(
    `SELECT p.id, p.public_id, b.board_key,
            COALESCE(bt.name, bko.name, b.board_key) board_name,
            COALESCE(pt.title, ko.title, '[untitled]') title,
            COALESCE(pt.body, ko.body, '') body,
            COALESCE(pt.body_format, ko.body_format, 'plain') body_format,
            COALESCE(u.display_name, p.guest_name, 'Unknown') author_name,
            p.published_at, p.view_count, p.is_pinned
       FROM posts p
       JOIN boards b ON b.id=p.board_id
       JOIN board_role_permissions brp ON brp.board_id=b.id AND brp.can_read=TRUE
       JOIN roles r ON r.id=brp.role_id AND r.role_key IN (${rolePlaceholders(roles)})
       LEFT JOIN board_translations bt ON bt.board_id=b.id AND bt.locale_code=?
       LEFT JOIN board_translations bko ON bko.board_id=b.id AND bko.locale_code='ko'
       LEFT JOIN post_translations pt ON pt.post_id=p.id AND pt.locale_code=?
       LEFT JOIN post_translations ko ON ko.post_id=p.id AND ko.locale_code='ko'
       LEFT JOIN users u ON u.id=p.author_user_id
      WHERE b.board_key=? AND p.public_id=? AND p.status='published'
      GROUP BY p.id, bt.name, bko.name, pt.title, pt.body, pt.body_format,
               ko.title, ko.body, ko.body_format, u.display_name
      LIMIT 1`,
    [...roles, locale, locale, boardKey, publicId],
  );
  const row = rows[0];
  if (!row) return null;

  const [attachmentRows] = await db.query<AttachmentRow[]>(
    `SELECT public_id, original_filename, size_bytes, mime_type, download_count
       FROM attachments
      WHERE post_id=(SELECT id FROM posts WHERE public_id=? LIMIT 1)
      ORDER BY sort_order, id`,
    [publicId],
  );

  await db.execute("UPDATE posts SET view_count=view_count+1 WHERE public_id=?", [publicId]);

  return {
    ...mapPost(row),
    boardKey: row.board_key,
    boardName: row.board_name,
    body: row.body,
    bodyFormat: row.body_format,
    attachments: attachmentRows.map(mapAttachment),
  };
}

function mapPost(row: PostRow, attachments: AttachmentSummary[] = []): PostSummary {
  return {
    publicId: row.public_id,
    title: row.title,
    authorName: row.author_name,
    publishedAt: row.published_at,
    viewCount: Number(row.view_count),
    isPinned: Boolean(row.is_pinned),
    attachments,
  };
}

function mapAttachment(attachment: AttachmentRow): AttachmentSummary {
  return {
    publicId: attachment.public_id,
    originalFilename: attachment.original_filename,
    sizeBytes: Number(attachment.size_bytes),
    mimeType: attachment.mime_type,
    downloadCount: Number(attachment.download_count),
  };
}

export function readableFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
