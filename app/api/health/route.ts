import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hasDatabaseConfiguration } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseConfiguration) {
    return NextResponse.json(
      { status: "degraded", application: "ok", database: "not-configured" },
      { status: 503 },
    );
  }

  try {
    await db.query("SELECT 1");
    return NextResponse.json({ status: "ok", application: "ok", database: "ok" });
  } catch {
    return NextResponse.json(
      { status: "degraded", application: "ok", database: "unavailable" },
      { status: 503 },
    );
  }
}
