import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ToolCard } from "@/components/tool-card";
import { Workspace } from "@/components/workspace/workspace";
import { getBalance } from "@/lib/credits";
import { CATEGORIES, getTool, getToolsByCategory, TOOLS } from "@/lib/registry";
import { ensureUser } from "@/lib/users";

export const generateStaticParams = () =>
  TOOLS.map((tool) => ({ slug: tool.slug }));

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await props.params;
  const tool = getTool(slug);
  return { title: tool ? tool.name : "Tool" };
};

export default async function WorkspacePage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const tool = getTool(slug);
  if (!tool) notFound();

  const user = (await ensureUser())!;
  const balance = await getBalance(user.id);
  const category = CATEGORIES.find((item) => item.id === tool.category)!;
  const siblings = getToolsByCategory(tool.category)
    .filter((item) => item.slug !== tool.slug)
    .slice(0, 4);

  const { systemPrompt: _systemPrompt, ...clientTool } = tool;

  return (
    <div>
      <Link
        href="/dashboard/tools"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-600 hover:text-zinc-900"
      >
        <ArrowLeft className="size-4" aria-hidden /> All tools
      </Link>

      <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-label">{category.name}</p>
          <h1 className="mt-1.5 text-3xl font-bold tracking-tight">{tool.name}</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">{tool.tagline}</p>
        </div>
        <span className="chip font-semibold">Costs {tool.price} cr</span>
      </div>

      <div className="mt-8">
        <Workspace tool={clientTool} initialBalance={balance} />
      </div>

      {siblings.length > 0 ? (
        <section className="mt-16">
          <p className="section-label">More from {category.name}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {siblings.map((sibling) => (
              <ToolCard
                key={sibling.slug}
                tool={sibling}
                href={`/dashboard/tools/${sibling.slug}`}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
