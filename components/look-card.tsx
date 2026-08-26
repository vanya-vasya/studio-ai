import Image from "next/image";
import Link from "next/link";
import type { Look } from "@/lib/looks";

export const LookCard = ({
  look,
  href,
}: {
  look: Look;
  href?: string;
}) => (
  <Link
    href={href ?? `/tool/photo-studio/${look.slug}`}
    className="group relative block overflow-hidden rounded-2xl border border-black/8 transition-transform duration-300 hover:-translate-y-1"
  >
    <div className="relative aspect-[2/3]">
      <Image
        src={look.previewImage}
        alt={look.name}
        fill
        sizes="(max-width: 768px) 50vw, 20vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
    </div>
    <div className="absolute inset-x-0 bottom-0 p-3.5">
      <h3 className="text-sm font-semibold text-white">{look.name}</h3>
      <p className="mt-0.5 line-clamp-1 text-xs text-zinc-300">{look.tagline}</p>
    </div>
  </Link>
);
