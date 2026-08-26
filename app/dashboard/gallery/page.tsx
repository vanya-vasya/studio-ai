import { desc, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { db, runs } from "@/lib/db";
import { getTool } from "@/lib/registry";
import { ensureUser } from "@/lib/users";

export const metadata: Metadata = { title: "My gallery" };

export default async function GalleryPage() {
  const user = (await ensureUser())!;
  const doneRuns = await db
    .select()
    .from(runs)
    .where(eq(runs.userId, user.id))
    .orderBy(desc(runs.createdAt));
  const finished = doneRuns.filter((run) => run.status === "done");

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">My gallery</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Every finished run, newest first. Tiles open the shareable result page.
      </p>
      {finished.length === 0 ? (
        <div className="card-panel mt-8 p-12 text-center">
          <p className="text-zinc-600">
            Nothing here yet. Your finished frames will show up on this shelf.
          </p>
          <Link
            href="/dashboard/tools/photo-studio"
            className="mt-4 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-500"
          >
            Open Photo Studio <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {finished.map((run) => (
            <Link
              key={run.id}
              href={`/r/${run.id}`}
              className="card-panel group overflow-hidden"
            >
              {run.outputKind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`/api/file/${run.id}/out-0.png`}
                  alt={run.toolSlug}
                  className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  loading="lazy"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-4xl">
                  {run.outputKind === "audio" ? "🎙" : "📝"}
                </div>
              )}
              <div className="p-3">
                <p className="text-sm font-medium text-zinc-900">
                  {getTool(run.toolSlug)?.name ?? run.toolSlug}
                </p>
                <p className="text-xs text-zinc-500">
                  {run.cost} cr ·{" "}
                  {run.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
