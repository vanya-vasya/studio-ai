import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PACKS, formatPrice } from "@/lib/packs";
import { CATEGORIES, getToolsByCategory } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Pay for frames, not for months. Credit packs from $9 — credits never expire, failed runs are refunded.",
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="section-label">Pricing</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        Pay for frames, <span className="text-gradient">not for months</span>
      </h1>
      <p className="mt-4 max-w-2xl text-zinc-400">
        Credits are the only currency here. Nothing renews on its own. New
        accounts start with 20 free credits.
      </p>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            <h2 className="font-semibold text-white">{pack.name}</h2>
            <p className="mt-3 text-3xl font-bold text-white">
              {formatPrice(pack.priceCents)}
            </p>
            <p className="mt-1 text-sm text-zinc-400">
              {pack.credits.toLocaleString()} credits
              {pack.bonus > 0 ? ` + ${pack.bonus} bonus` : ""}
            </p>
            <p className="text-xs text-zinc-500">
              {pack.perCredit} · {pack.note}
            </p>
            <ul className="mt-5 flex-1 space-y-2.5">
              {pack.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2 text-sm text-zinc-400">
                  <Check className="mt-0.5 size-4 shrink-0 text-purple-400" aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
            <Link
              href={`/dashboard/billing/checkout?pack=${pack.id}`}
              className={`mt-6 block w-full rounded-full py-2.5 text-center text-sm font-semibold ${
                pack.bestValue
                  ? "btn-gradient"
                  : "border border-white/15 text-zinc-200 hover:border-white/30"
              }`}
            >
              Buy {pack.name}
            </Link>
          </div>
        ))}
      </div>

      <section id="tools" className="mt-20">
        <h2 className="text-2xl font-bold tracking-tight">Per-tool prices</h2>
        <p className="mt-2 text-sm text-zinc-500">
          The price sits on the run button too — no surprises.
        </p>
        <div className="card-panel mt-6 overflow-hidden">
          {CATEGORIES.map((category) => (
            <div key={category.id}>
              <p className="section-label border-b border-white/5 bg-white/[0.02] px-5 py-3">
                {category.name}
              </p>
              {getToolsByCategory(category.id).map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tool/${tool.slug}`}
                  className="flex items-center justify-between border-b border-white/5 px-5 py-3.5 transition-colors last:border-0 hover:bg-white/[0.03]"
                >
                  <span>
                    <span className="text-sm font-medium text-zinc-100">
                      {tool.name}
                    </span>
                    <span className="ml-2 hidden text-sm text-zinc-500 sm:inline">
                      {tool.tagline}
                    </span>
                  </span>
                  <span className="chip font-semibold">
                    {tool.price} cr
                    {tool.output.frames && tool.output.frames > 1
                      ? ` · ${tool.output.frames} frames`
                      : ""}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
