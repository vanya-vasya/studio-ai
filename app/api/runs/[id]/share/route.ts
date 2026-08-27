import { and, asc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db, inspirationPosts, runFiles, runs } from "@/lib/db";
import { getLook } from "@/lib/looks";
import { getTool } from "@/lib/registry";
import { ensureUser, handleFor } from "@/lib/users";

export const runtime = "nodejs";

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  // Resolve the canonical DB user (not the raw Clerk id): runs are stored
  // under the row id from ensureUser, which can differ from the live Clerk
  // id after an account is re-created with the same email.
  const user = await ensureUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  }
  const { id } = await ctx.params;

  const [run] = await db
    .select()
    .from(runs)
    .where(and(eq(runs.id, id), eq(runs.userId, user.id)));
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

  const tool = getTool(run.toolSlug);
  const look = run.lookSlug ? getLook(run.lookSlug) : undefined;

  await db
    .insert(inspirationPosts)
    .values({
      runId: id,
      userId: user.id,
      title: look?.name ?? tool?.name ?? run.toolSlug,
      toolSlug: run.toolSlug,
      lookSlug: run.lookSlug,
      imageUrl: `/api/file/${id}/${firstFile.filename}`,
      authorHandle: handleFor(user),
    })
    .onConflictDoNothing({ target: inspirationPosts.runId });

  return NextResponse.json({ ok: true });
}
