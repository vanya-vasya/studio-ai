import { auth } from "@clerk/nextjs/server";
import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, inspirationPosts, runFiles, runs, users } from "@/lib/db";
import { getLook } from "@/lib/looks";
import { getTool } from "@/lib/registry";
import { handleFor } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const [run] = await db
    .select()
    .from(runs)
    .where(and(eq(runs.id, id), eq(runs.userId, userId)));
  if (!run || run.status !== "done") {
    return NextResponse.json({ error: "Run not found" }, { status: 404 });
  }
  if (run.outputKind !== "image") {
    return NextResponse.json(
      { error: "Only image results can be shared" },
      { status: 400 },
    );
  }

  const [firstFile] = await db
    .select({ filename: runFiles.filename })
    .from(runFiles)
    .where(eq(runFiles.runId, id))
    .orderBy(asc(runFiles.index))
    .limit(1);
  if (!firstFile) {
    return NextResponse.json({ error: "No files on this run" }, { status: 400 });
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  const tool = getTool(run.toolSlug);
  const look = run.lookSlug ? getLook(run.lookSlug) : undefined;

  await db
    .insert(inspirationPosts)
    .values({
      runId: id,
      userId,
      title: look?.name ?? tool?.name ?? run.toolSlug,
      toolSlug: run.toolSlug,
      lookSlug: run.lookSlug,
      imageUrl: `/api/file/${id}/${firstFile.filename}`,
      authorHandle: user ? handleFor(user) : "studio",
    })
    .onConflictDoNothing({ target: inspirationPosts.runId });

  return NextResponse.json({ ok: true });
}
