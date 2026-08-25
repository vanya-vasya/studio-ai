import { sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ runId: string; filename: string }> },
) {
  const { runId, filename } = await ctx.params;
  const result = await db.execute(sql`
    select mime, bytes, encode(data, 'base64') as b64
    from run_files
    where run_id = ${runId} and filename = ${filename}
    limit 1
  `);
  const file = result.rows[0] as
    | { mime: string; bytes: number; b64: string }
    | undefined;

  if (!file) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const download = req.nextUrl.searchParams.has("download");
  const body = new Uint8Array(Buffer.from(file.b64, "base64"));

  return new Response(body, {
    headers: {
      "Content-Type": file.mime,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      ...(download
        ? { "Content-Disposition": `attachment; filename="${runId}-${filename}"` }
        : {}),
    },
  });
}
