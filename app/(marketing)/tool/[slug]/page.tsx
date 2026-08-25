import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LookCard } from "@/components/look-card";
import { ToolMarketing } from "@/components/tool-marketing";
import { LOOKS } from "@/lib/looks";
import { TOOLS, getTool } from "@/lib/registry";

export const generateStaticParams = () =>
  TOOLS.map((tool) => ({ slug: tool.slug }));

export const generateMetadata = async (props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> => {
  const { slug } = await props.params;
  const tool = getTool(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} — ${tool.tagline}`,
    description: `${tool.tagline}. ${tool.price} credits per run on Framique.`,
    openGraph: { images: [tool.cover] },
  };
};

export default async function ToolPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const tool = getTool(slug);
  if (!tool) notFound();

  return (
    <ToolMarketing tool={tool}>
      {tool.slug === "photo-studio" ? (
        <section className="mt-14">
          <p className="section-label">All looks</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            24 looks, one upload
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {LOOKS.map((look) => (
              <LookCard key={look.slug} look={look} />
            ))}
          </div>
        </section>
      ) : null}
    </ToolMarketing>
  );
}
