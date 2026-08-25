import Image from "next/image";
import { Logo } from "@/components/logo";
import { getLook } from "@/lib/looks";

const AUTH_LOOK_SLUGS = ["noir", "neon-city", "yearbook-98", "golden-hour"];

export const AuthShell = ({
  heading,
  subheading,
  children,
}: {
  heading: string;
  subheading: string;
  children: React.ReactNode;
}) => {
  const looks = AUTH_LOOK_SLUGS.map((slug) => getLook(slug)!);
  return (
    <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-4 py-12 sm:px-6 lg:grid-cols-2">
      <div className="mx-auto w-full max-w-md">
        <Logo />
        <h1 className="mt-10 text-3xl font-bold tracking-tight">{heading}</h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">{subheading}</p>
        <div className="mt-8">{children}</div>
      </div>
      <div className="hidden grid-cols-2 gap-4 lg:grid">
        {looks.map((look) => (
          <div
            key={look.slug}
            className="relative overflow-hidden rounded-2xl border border-white/8"
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={look.previewImage}
                alt={look.name}
                fill
                sizes="25vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3.5">
              <p className="text-sm font-semibold text-white">{look.name}</p>
              <p className="text-xs text-zinc-300">{look.tagline}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
