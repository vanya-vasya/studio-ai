import Link from "next/link";

export const Logo = ({ href = "/" }: { href?: string }) => (
  <Link href={href} className="flex items-center gap-2.5" aria-label="Framique home">
    <span className="btn-gradient flex size-7 items-center justify-center rounded-full text-sm font-bold">
      F
    </span>
    <span className="text-sm font-bold tracking-[0.22em] text-zinc-100">
      FRAMIQUE
    </span>
  </Link>
);
