import { Heart } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { db, inspirationPosts } from "@/lib/db";
import { getTool } from "@/lib/registry";

export const metadata: Metadata = {
  title: "Inspiration",
  description:
    "Frames made in the Framique studio. Every tile links to the tool and look behind it.",
};

export const dynamic = "force-dynamic";

export default async function InspirationPage(props: {
  searchParams: Promise<{ tool?: string }>;
}) {
  const { tool: toolFilter } = await props.searchParams;
  const posts = await db
    .select()
    .from(inspirationPosts)
    .orderBy(desc(inspirationPosts.publishedAt), desc(inspirationPosts.id));

  const counts = new Map<string, number>();
  for (const post of posts) {
    counts.set(post.toolSlug, (counts.get(post.toolSlug) ?? 0) + 1);
  }
  const chips = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([slug, count]) => ({
      slug,
      count,
      name: getTool(slug)?.name ?? slug,
    }));

  const visible = toolFilter
    ? posts.filter((post) => post.toolSlug === toolFilter)
    : posts;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="section-label">Gallery</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Inspiration</h1>
      <p className="mt-4 max-w-2xl text-zinc-400">
        {posts.length} frames made in the studio. Every tile links to the tool
        and look behind it, so you can reproduce the result with your own photo.
      </p>

      <div className="mt-8 flex flex-wrap gap-2">
        <Link
          href="/inspiration"
          className={`chip transition-colors hover:border-white/30 ${
            toolFilter ? "" : "border-purple-400/60 text-white"
          }`}
        >
          Everything
        </Link>
        {chips.map((chip) => (
          <Link
            key={chip.slug}
            href={`/inspiration?tool=${chip.slug}`}
            className={`chip transition-colors hover:border-white/30 ${
              toolFilter === chip.slug ? "border-purple-400/60 text-white" : ""
            }`}
          >
            {chip.name} · {chip.count}
          </Link>
        ))}
      </div>

      <div className="masonry mt-10">
        {visible.map((post) => (
          <Link
            key={post.id}
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
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4 pt-12">
              <p className="text-sm font-semibold text-white">{post.title}</p>
              <div className="mt-1 flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  {getTool(post.toolSlug)?.name ?? post.toolSlug} · @
                  {post.authorHandle}
                </p>
                <span className="flex items-center gap-1 text-xs text-zinc-400">
                  <Heart className="size-3" aria-hidden /> {post.likes}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="mt-16 text-center text-zinc-500">
          Nothing here yet for this filter.
        </p>
      ) : null}
    </div>
  );
}
