import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LookCard } from "@/components/look-card";
import { ToolCard } from "@/components/tool-card";
import { SEED_POSTS } from "@/lib/inspiration-seed";
import { LOOKS } from "@/lib/looks";
import { CATEGORIES, TOOLS, getToolsByCategory } from "@/lib/registry";

const HERO_LOOK_SLUGS = [
  "noir",
  "golden-hour",
  "neon-city",
  "yearbook-98",
  "runway",
  "astronaut",
];

const STEPS = [
  {
    title: "Pick a tool",
    body: "Each one does a single job and says what it needs. No prompt engineering, no settings maze.",
  },
  {
    title: "Upload a photo",
    body: "Or type a couple of lines for the tools that draw from scratch. Files stay in memory.",
  },
  {
    title: "Spend a few credits",
    body: "The price sits right on the button. If a run fails, the credits come straight back.",
  },
  {
    title: "Download or share",
    body: "Every result gets a file and a public link. Post the good ones to Inspiration.",
  },
];

export default function LandingPage() {
  const featured = TOOLS.filter((tool) => tool.popular);
  const heroLooks = HERO_LOOK_SLUGS.map(
    (slug) => LOOKS.find((look) => look.slug === slug)!,
  );
  const galleryTiles = SEED_POSTS.filter((_, i) => i % 3 === 0).slice(0, 16);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="chip">23 tools · 24 ready-made looks</span>
          <h1 className="mt-6 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            A photo studio that fits{" "}
            <span className="text-gradient">in one upload</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
            Headshots, retouching, restored family photos, product shots,
            interiors, voiceovers. Pick a tool, drop in a picture and watch the
            result develop — no prompt writing, no subscription.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="btn-gradient px-6 py-3 text-sm">
              Start with 20 free credits →
            </Link>
            <Link
              href="/inspiration"
              className="rounded-full border border-white/15 px-6 py-3 text-sm text-zinc-200 transition-colors hover:border-white/30"
            >
              See what people made
            </Link>
          </div>
          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <dt className="text-2xl font-bold text-white">~40 s</dt>
              <dd className="text-sm text-zinc-500">per frame</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-white">from $0.02</dt>
              <dd className="text-sm text-zinc-500">per credit</dd>
            </div>
            <div>
              <dt className="text-2xl font-bold text-white">No plan</dt>
              <dd className="text-sm text-zinc-500">credits never expire</dd>
            </div>
          </dl>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            {heroLooks.slice(0, 3).map((look) => (
              <LookCard key={look.slug} look={look} />
            ))}
          </div>
          <div className="space-y-4 pt-10">
            {heroLooks.slice(3).map((look) => (
              <LookCard key={look.slug} look={look} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured tools */}
      <section className="py-16">
        <p className="section-label">Start here</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">
            The tools people open first
          </h2>
          <Link
            href="/tools"
            className="flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200"
          >
            All 23 tools <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
          {featured.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="py-16">
        <p className="section-label">How it works</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          Four steps, about a minute
        </h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => (
            <li key={step.title} className="card-panel p-6">
              <span className="text-gradient text-sm font-bold">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Gallery */}
      <section className="py-16">
        <p className="section-label">Inspiration</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 className="text-3xl font-bold tracking-tight">Made in the studio</h2>
          <Link
            href="/inspiration"
            className="flex items-center gap-1 text-sm text-purple-300 hover:text-purple-200"
          >
            Browse Inspiration <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
        <div className="masonry mt-8">
          {galleryTiles.map((post) => (
            <Link
              key={post.imageUrl}
              href={
                post.lookSlug
                  ? `/tool/photo-studio/${post.lookSlug}`
                  : `/tool/${post.toolSlug}`
              }
              className="group relative block overflow-hidden rounded-2xl border border-white/8"
            >
              <Image
                src={post.imageUrl}
                alt={post.title}
                width={720}
                height={1080}
                className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3.5 pt-10">
                <p className="text-sm font-semibold text-white">{post.title}</p>
                <p className="text-xs text-zinc-400">@{post.authorHandle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Full catalog */}
      <section className="py-16">
        <p className="section-label">All looks</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">
          The full catalog
        </h2>
        {CATEGORIES.map((category) => (
          <div key={category.id} className="mt-12">
            <h3 className="text-xl font-semibold text-white">{category.name}</h3>
            <p className="mt-1 text-sm text-zinc-500">{category.description}</p>
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
              {getToolsByCategory(category.id).map((tool) => (
                <ToolCard key={tool.slug} tool={tool} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Pricing teaser */}
      <section className="py-16">
        <div className="card-panel grid items-center gap-8 p-8 md:grid-cols-2 md:p-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Pay for frames, <span className="text-gradient">not for months</span>
            </h2>
            <p className="mt-4 text-zinc-400">
              Credits are the only currency here. Nothing renews on its own.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            <Link href="/pricing" className="btn-gradient px-6 py-3 text-sm">
              See credit packs
            </Link>
            <Link
              href="/pricing#tools"
              className="rounded-full border border-white/15 px-6 py-3 text-sm text-zinc-200 hover:border-white/30"
            >
              Per-tool prices
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight">
          20 credits <span className="text-gradient">are waiting</span>
        </h2>
        <p className="mx-auto mt-4 max-w-md text-zinc-400">
          Enough for a first batch of studio frames. No card, no trial countdown
          — make something and decide afterwards.
        </p>
        <Link
          href="/signup"
          className="btn-gradient mt-8 inline-block px-8 py-3.5 text-sm"
        >
          Create a free account
        </Link>
      </section>
    </div>
  );
}
