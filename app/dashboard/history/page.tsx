import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { getLedger } from "@/lib/credits";
import { db, runs } from "@/lib/db";
import { getTool } from "@/lib/registry";
import { ensureUser } from "@/lib/users";

export const metadata: Metadata = { title: "History" };

const KIND_LABELS: Record<string, string> = {
  welcome: "Welcome bonus",
  purchase: "Purchase",
  generation: "Generation",
  refund: "Refund",
  admin: "Adjustment",
};

const formatWhen = (date: Date) =>
  date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) +
  ", " +
  date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

export default async function HistoryPage() {
  const user = (await ensureUser())!;
  const [userRuns, ledger] = await Promise.all([
    db
      .select()
      .from(runs)
      .where(eq(runs.userId, user.id))
      .orderBy(desc(runs.createdAt))
      .limit(100),
    getLedger(user.id),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">History</h1>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-zinc-900">Generations</h2>
        {userRuns.length === 0 ? (
          <p className="card-panel mt-4 p-8 text-center text-sm text-zinc-500">
            No runs yet — open a tool and make something.
          </p>
        ) : (
          <div className="card-panel mt-4 overflow-hidden">
            {userRuns.map((run) => (
              <div
                key={run.id}
                className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-3.5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">
                    {getTool(run.toolSlug)?.name ?? run.toolSlug}
                    {run.status !== "done" ? (
                      <span
                        className={`ml-2 text-xs ${
                          run.status === "running"
                            ? "text-blue-600"
                            : "text-red-600"
                        }`}
                      >
                        {run.status}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-zinc-500">{formatWhen(run.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4">
                  <span className="text-sm font-semibold text-zinc-700">
                    −{run.cost} cr
                  </span>
                  {run.status === "done" ? (
                    <Link
                      href={`/r/${run.id}`}
                      className="text-sm text-purple-600 hover:text-purple-500"
                    >
                      Result
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-zinc-900">Credit ledger</h2>
        <div className="card-panel mt-4 overflow-hidden">
          {ledger.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-3.5 last:border-0"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900">
                  {KIND_LABELS[entry.kind] ?? entry.kind}
                  {entry.ref ? (
                    <span className="ml-2 truncate text-xs text-zinc-500">
                      {entry.ref}
                    </span>
                  ) : null}
                </p>
                <p className="text-xs text-zinc-500">{formatWhen(entry.createdAt)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-4">
                <span
                  className={`text-sm font-semibold ${
                    entry.delta > 0 ? "text-emerald-600" : "text-zinc-700"
                  }`}
                >
                  {entry.delta > 0 ? "+" : ""}
                  {entry.delta}
                </span>
                <span className="w-16 text-right text-xs text-zinc-500">
                  = {entry.balanceAfter}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
