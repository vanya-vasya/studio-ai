import { Flame } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ToolConfig } from "@/lib/registry";

const priceLabel = (tool: ToolConfig) => {
  if (tool.output.kind === "text") return `text ${tool.price} cr`;
  if (tool.output.kind === "audio") return `audio ${tool.price} cr`;
  return `${tool.price} cr`;
};

export const ToolCard = ({
  tool,
  href,
}: {
  tool: ToolConfig;
  href?: string;
}) => (
  <Link
    href={href ?? `/tool/${tool.slug}`}
    className="group relative block overflow-hidden rounded-2xl border border-black/8 transition-transform duration-300 hover:-translate-y-1"
  >
    <div className="relative aspect-[3/4]">
      <Image
        src={tool.cover}
        alt={tool.name}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
    </div>
    <span className="chip absolute right-3 top-3 border-white/20 bg-black/50 font-semibold text-white backdrop-blur">
      {priceLabel(tool)}
    </span>
    {tool.popular ? (
      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur">
        <Flame className="size-3" aria-hidden /> popular
      </span>
    ) : null}
    <div className="absolute inset-x-0 bottom-0 p-4">
      <h3 className="text-base font-semibold text-white">{tool.name}</h3>
      <p className="mt-0.5 line-clamp-1 text-sm text-zinc-300">{tool.tagline}</p>
    </div>
  </Link>
);
