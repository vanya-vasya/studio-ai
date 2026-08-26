import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { CATEGORIES, getToolsByCategory } from "@/lib/registry";

export const metadata: Metadata = {
  title: "All tools",
  description:
    "23 tools, one engine. Each tool does one job and shows its price in credits.",
};

export default function ToolsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <p className="section-label">Catalog</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        23 tools, <span className="text-gradient">one engine</span>
      </h1>
      <p className="mt-4 max-w-2xl text-zinc-600">
        Each tool does one job and shows its price in credits. Sign up and 20
        credits land on your balance to try them.
      </p>
      {CATEGORIES.map((category) => (
        <section key={category.id} className="mt-14">
          <h2 className="text-xl font-semibold text-zinc-900">{category.name}</h2>
          <p className="mt-1 text-sm text-zinc-500">{category.description}</p>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {getToolsByCategory(category.id).map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
