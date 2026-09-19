import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const username = process.env.PREVIEW_BASIC_AUTH_USER;
  const password = process.env.PREVIEW_BASIC_AUTH_PASSWORD;

  if (!username || !password) return NextResponse.next();

  const expected = `Basic ${btoa(`${username}:${password}`)}`;
  if (request.headers.get("authorization") === expected) return NextResponse.next();

  return new NextResponse("Preview authentication required", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "WWW-Authenticate": 'Basic realm="ABCMISSION Preview", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow, noarchive",
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|legacy/|favicon.ico).*)"],
};
