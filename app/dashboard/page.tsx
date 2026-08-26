import { desc, eq } from "drizzle-orm";
import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ToolCard } from "@/components/tool-card";
import { getBalance } from "@/lib/credits";
import { db, runs } from "@/lib/db";
import { getTool } from "@/lib/registry";
import { ensureUser } from "@/lib/users";

export const metadata: Metadata = { title: "Overview" };

const FEATURED = ["photo-studio", "retouch", "product-shot", "fitting-room"];

export default async function DashboardPage() {
  const user = (await ensureUser())!;
  const balance = await getBalance(user.id);
  const recentRuns = await db
    .select()
    .from(runs)
    .where(eq(runs.userId, user.id))
    .orderBy(desc(runs.createdAt))
    .limit(6);
  const doneRuns = recentRuns.filter((run) => run.status === "done");

  const stats = [
    {
      label: "Credit balance",
      value: balance,
      action: { href: "/dashboard/billing", label: "Top up" },
    },
    {
      label: "Generations",
      value: doneRuns.length,
      action: { href: "/dashboard/gallery", label: "Open gallery" },
    },
    {
      label: "Welcome bonus",
      value: "+20",
      action: { href: "/inspiration", label: "See inspiration" },
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Hi, {user.name?.split(" ")[0] ?? "there"}
      </h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="card-panel p-5">
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900">{stat.value}</p>
            <Link
              href={stat.action.href}
              className="mt-3 inline-flex items-center gap-1 text-sm text-purple-600 hover:text-purple-500"
            >
              {stat.action.label} <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <p className="section-label">Start here</p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-900">
          The tools people open first
        </h2>
        <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {FEATURED.map((slug) => {
            const tool = getTool(slug)!;
            return (
              <ToolCard
                key={slug}
                tool={tool}
                href={`/dashboard/tools/${slug}`}
              />
            );
          })}
        </div>
      </section>

      <section className="mt-12">
        <p className="section-label">Latest results</p>
        <h2 className="mt-1 text-xl font-semibold text-zinc-900">Fresh from the studio</h2>
        {doneRuns.length === 0 ? (
          <div className="card-panel mt-5 p-10 text-center">
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
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
            {doneRuns.map((run) => (
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
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
