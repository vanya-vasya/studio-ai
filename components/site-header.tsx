import { auth } from "@clerk/nextjs/server";
import { Coins } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { getBalance } from "@/lib/credits";

const NAV = [
  { href: "/tools", label: "Tools" },
  { href: "/inspiration", label: "Inspiration" },
  { href: "/pricing", label: "Pricing" },
];

export const SiteHeader = async () => {
  const { userId } = await auth();
  const balance = userId ? await getBalance(userId) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-600 transition-colors hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userId ? (
            <>
              <Link
                href="/dashboard/billing"
                className="chip hover:border-zinc-400"
                aria-label={`Balance ${balance} credits`}
              >
                <Coins className="size-3.5 text-purple-600" aria-hidden />
                <span className="font-semibold text-zinc-900">{balance}</span>
                <span className="text-zinc-600">cr</span>
              </Link>
              <Link
                href="/dashboard"
                className="btn-gradient px-4 py-2 text-sm"
              >
                Studio
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-zinc-700 transition-colors hover:text-zinc-900"
              >
                Sign in
              </Link>
              <Link href="/signup" className="btn-gradient px-4 py-2 text-sm">
                Start free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
