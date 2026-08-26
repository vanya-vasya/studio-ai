import Image from "next/image";
import Link from "next/link";

export const Logo = ({ href = "/" }: { href?: string }) => (
  <Link href={href} className="flex items-center gap-2.5" aria-label="Celunio home">
    <Image
      src="/logo.png"
      alt="Celunio logo"
      width={28}
      height={28}
      priority
      className="size-7 rounded-full"
    />
    <span className="text-sm font-bold tracking-[0.22em] text-zinc-100">
      CELUNIO
    </span>
  </Link>
);
