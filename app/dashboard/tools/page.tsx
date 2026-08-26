import type { Metadata } from "next";
import { ToolCard } from "@/components/tool-card";
import { getBalance } from "@/lib/credits";
import { CATEGORIES, getToolsByCategory } from "@/lib/registry";
import { ensureUser } from "@/lib/users";

export const metadata: Metadata = { title: "Tools" };

export default async function DashboardToolsPage() {
  const user = (await ensureUser())!;
  const balance = await getBalance(user.id);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">All tools</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Your balance: {balance} credits. Every price sits on the run button too.
      </p>
      {CATEGORIES.map((category) => (
        <section key={category.id} className="mt-10">
          <h2 className="text-lg font-semibold text-zinc-900">{category.name}</h2>
          <p className="mt-0.5 text-sm text-zinc-500">{category.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {getToolsByCategory(category.id).map((tool) => (
              <ToolCard
                key={tool.slug}
                tool={tool}
                href={`/dashboard/tools/${tool.slug}`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
