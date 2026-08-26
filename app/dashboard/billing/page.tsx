import { desc, eq } from "drizzle-orm";
import { Check, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getBalance } from "@/lib/credits";
import { db, purchases } from "@/lib/db";
import { PACKS, formatPrice, getPack } from "@/lib/packs";
import { ensureUser } from "@/lib/users";

export const metadata: Metadata = { title: "Credits" };

export default async function BillingPage() {
  const user = (await ensureUser())!;
  const [balance, userPurchases] = await Promise.all([
    getBalance(user.id),
    db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, user.id))
      .orderBy(desc(purchases.createdAt)),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Credits</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Balance: <span className="font-semibold text-zinc-700">{balance} credits</span>.
        Credits never expire; failed runs refund automatically.
      </p>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4">
        <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden />
        <p className="text-sm leading-relaxed text-amber-900">
          Card payments are being switched on. Until then, write to{" "}
          <a
            href="mailto:support@celunio.com"
            className="font-medium underline underline-offset-4"
          >
            support@celunio.com
          </a>{" "}
          and we will top up your balance manually.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {PACKS.map((pack) => (
          <div
            key={pack.id}
            className={`card-panel relative flex flex-col p-6 ${
              pack.bestValue ? "border-purple-500/50" : ""
            }`}
          >
            {pack.bestValue ? (
              <span className="btn-gradient absolute -top-3 right-4 px-3 py-1 text-[11px]">
                Best value
              </span>
            ) : null}
            <h2 className="font-semibold text-zinc-900">{pack.name}</h2>
            <p className="mt-2 text-3xl font-bold text-zinc-900">
              {formatPrice(pack.priceCents)}
            </p>
            <p className="mt-1 text-sm text-zinc-600">
              {pack.credits.toLocaleString()} credits
              {pack.bonus > 0 ? ` + ${pack.bonus} bonus` : ""}
            </p>
            <p className="text-xs text-zinc-500">
              {pack.perCredit} · {pack.note}
            </p>
            <ul className="mt-4 flex-1 space-y-2">
              {pack.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-xs text-zinc-600">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-purple-500" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
            <Link
              href={`/dashboard/billing/checkout?pack=${pack.id}`}
              className={`mt-5 block w-full rounded-full py-2.5 text-center text-sm font-semibold ${
                pack.bestValue
                  ? "btn-gradient"
                  : "border border-zinc-300 text-zinc-700 hover:border-zinc-400"
              }`}
            >
              Buy {pack.name}
            </Link>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-zinc-900">Purchase history</h2>
        {userPurchases.length === 0 ? (
          <p className="card-panel mt-4 p-8 text-center text-sm text-zinc-500">
            No purchases yet.
          </p>
        ) : (
          <div className="card-panel mt-4 overflow-hidden">
            {userPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between gap-4 border-b border-black/5 px-5 py-3.5 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    {getPack(purchase.pack)?.name ?? purchase.pack} —{" "}
                    {purchase.credits.toLocaleString()} credits
                  </p>
                  <p className="text-xs text-zinc-500">
                    {purchase.createdAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-zinc-700">
                    {formatPrice(purchase.priceCents)}
                  </span>
                  <span
                    className={`chip text-[11px] ${
                      purchase.status === "paid"
                        ? "border-emerald-600/30 text-emerald-700"
                        : purchase.status === "pending"
                          ? "border-amber-500/50 text-amber-600"
                          : ""
                    }`}
                  >
                    {purchase.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-zinc-400">
          Payments are processed by our gateway; we never see your card details.
        </p>
      </section>
    </div>
  );
}
