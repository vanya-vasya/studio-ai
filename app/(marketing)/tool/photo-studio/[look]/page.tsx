import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LookCard } from "@/components/look-card";
import { ToolMarketing } from "@/components/tool-marketing";
import { LOOKS, getLook } from "@/lib/looks";
import { getTool } from "@/lib/registry";

export const generateStaticParams = () =>
  LOOKS.map((look) => ({ look: look.slug }));

export const generateMetadata = async (props: {
  params: Promise<{ look: string }>;
}): Promise<Metadata> => {
  const { look: lookSlug } = await props.params;
  const look = getLook(lookSlug);
  if (!look) return {};
  return {
    title: `${look.name} — ${look.tagline}`,
    description: `${look.name}: ${look.tagline}. A Photo Studio look on Framique — 4 frames from one upload.`,
    openGraph: { images: [look.previewImage] },
  };
};

export default async function LookPage(props: {
  params: Promise<{ look: string }>;
}) {
  const { look: lookSlug } = await props.params;
  const look = getLook(lookSlug);
  const tool = getTool("photo-studio");
  if (!look || !tool) notFound();

  const otherLooks = LOOKS.filter((item) => item.slug !== look.slug).slice(0, 8);

  return (
    <ToolMarketing
      tool={tool}
      titleOverride={look.name}
      taglineOverride={`${look.tagline}. One upload, four frames in the ${look.name} look — your face stays recognizable.`}
    >
      <section className="mt-14">
        <p className="section-label">Other looks</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          More from Photo Studio
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {otherLooks.map((item) => (
            <LookCard key={item.slug} look={item} />
          ))}
        </div>
      </section>
    </ToolMarketing>
  );
}
