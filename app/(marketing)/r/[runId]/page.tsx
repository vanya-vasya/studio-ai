import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db, runFiles, runs } from "@/lib/db";
import { getLook } from "@/lib/looks";
import { getTool } from "@/lib/registry";

export const dynamic = "force-dynamic";

export const generateMetadata = async (props: {
  params: Promise<{ runId: string }>;
}): Promise<Metadata> => {
  const { runId } = await props.params;
  const [run] = await db.select().from(runs).where(eq(runs.id, runId));
  if (!run) return {};
  const tool = getTool(run.toolSlug);
  return {
    title: `${tool?.name ?? "Result"} — made with Framique`,
    description: tool?.tagline,
  };
};

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }) +
  " at " +
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export default async function ResultPage(props: {
  params: Promise<{ runId: string }>;
}) {
  const { runId } = await props.params;
  const [run] = await db.select().from(runs).where(eq(runs.id, runId));
  if (!run || run.status !== "done") notFound();

  const tool = getTool(run.toolSlug);
  const look = run.lookSlug ? getLook(run.lookSlug) : undefined;
  const files = await db
    .select({ filename: runFiles.filename, mime: runFiles.mime })
    .from(runFiles)
    .where(eq(runFiles.runId, runId))
    .orderBy(asc(runFiles.index));

  const makeHref = look
    ? `/tool/photo-studio/${look.slug}`
    : `/tool/${run.toolSlug}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="section-label text-center">Made with Framique</p>
      <h1 className="mt-3 text-center text-4xl font-bold tracking-tight">
        {look ? look.name : (tool?.name ?? run.toolSlug)}
      </h1>
      <p className="mt-3 text-center text-sm text-zinc-500">
        {(look ? look.tagline : tool?.tagline) ?? ""} ·{" "}
        {formatDate(run.createdAt)}
      </p>

      <div className="mt-10">
        {run.outputKind === "text" ? (
          <div className="card-panel whitespace-pre-wrap p-8 font-mono text-sm leading-relaxed text-zinc-200">
            {run.textOutput}
          </div>
        ) : run.outputKind === "audio" ? (
          <div className="card-panel p-8">
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              controls
              className="w-full"
              src={`/api/file/${run.id}/${files[0]?.filename ?? "out.mp3"}`}
            />
          </div>
        ) : (
          <div
            className={`grid gap-4 ${files.length > 1 ? "sm:grid-cols-2" : ""}`}
          >
            {files.map((file) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={file.filename}
                src={`/api/file/${run.id}/${file.filename}`}
                alt={`${tool?.name ?? "Result"} frame`}
                className="w-full rounded-2xl border border-white/8"
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link href={makeHref} className="btn-gradient px-6 py-3 text-sm">
          Make one like this
        </Link>
        <Link
          href="/tools"
          className="rounded-full border border-white/15 px-6 py-3 text-sm text-zinc-200 hover:border-white/30"
        >
          Browse all tools
        </Link>
      </div>
    </div>
  );
}
