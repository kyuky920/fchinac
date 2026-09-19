import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { env } from "@/lib/env";

export const runtime = "nodejs";

interface DownloadRow extends RowDataPacket {
  id: number;
  storage_key: string;
  original_filename: string;
  mime_type: string | null;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ publicId: string }> },
) {
  const { publicId } = await context.params;
  const user = await getCurrentUser();
  if (!user) {
    return new NextResponse("Authentication required", {
      status: 401,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  const roles = user.roles.filter((role) => role !== "guest");
  if (!roles.length) {
    return new NextResponse("Download permission required", {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
  const placeholders = roles.map(() => "?").join(",");
  const [rows] = await db.query<DownloadRow[]>(
    `SELECT a.id, a.storage_key, a.original_filename, a.mime_type
       FROM attachments a
       JOIN posts p ON p.id=a.post_id AND p.status='published'
       JOIN board_role_permissions brp ON brp.board_id=p.board_id AND brp.can_download=TRUE
       JOIN roles r ON r.id=brp.role_id AND r.role_key IN (${placeholders})
      WHERE a.public_id=?
      GROUP BY a.id
      LIMIT 1`,
    [...roles, publicId],
  );
  const attachment = rows[0];
  if (!attachment) return new NextResponse("Not found", { status: 404 });

  const root = resolve(env.UPLOAD_ROOT);
  const filePath = resolve(root, attachment.storage_key);
  if (!filePath.startsWith(`${root}${sep}`)) {
    return new NextResponse("Invalid storage path", { status: 400 });
  }

  try {
    const data = await readFile(filePath);
    await db.execute("UPDATE attachments SET download_count=download_count+1 WHERE id=?", [attachment.id]);
    const encodedName = encodeURIComponent(attachment.original_filename);
    return new NextResponse(data, {
      headers: {
        "Content-Type": attachment.mime_type ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodedName}`,
        "Content-Length": String(data.byteLength),
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new NextResponse("File unavailable", { status: 404 });
  }
}
