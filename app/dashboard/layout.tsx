import { SignOutButton } from "@clerk/nextjs";
import {
  Clock,
  Coins,
  CreditCard,
  Images,
  LayoutGrid,
  LogOut,
  Settings,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Logo } from "@/components/logo";
import { getBalance } from "@/lib/credits";
import { ensureUser } from "@/lib/users";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutGrid },
  { href: "/dashboard/tools", label: "Tools", icon: Wrench },
  { href: "/dashboard/gallery", label: "My gallery", icon: Images },
  { href: "/dashboard/history", label: "History", icon: Clock },
  { href: "/dashboard/billing", label: "Credits", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await ensureUser();
  if (!user) redirect("/login");
  const balance = await getBalance(user.id);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/billing"
              className="chip hover:border-white/25"
              aria-label={`Balance ${balance} credits`}
            >
              <Coins className="size-3.5 text-purple-300" aria-hidden />
              <span className="font-semibold text-zinc-100">{balance}</span>
              <span className="text-zinc-400">cr</span>
            </Link>
            <Link href="/dashboard/tools" className="btn-gradient px-4 py-2 text-sm">
              Studio
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-8 px-4 py-8 sm:px-6">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="card-panel p-4">
            <p className="truncate font-semibold text-white">
              {user.name ?? user.email.split("@")[0]}
            </p>
            <p className="truncate text-xs text-zinc-500">{user.email}</p>
            <Link
              href="/dashboard/billing"
              className="chip mt-3 w-full justify-center hover:border-white/25"
            >
              Balance <span className="font-semibold text-white">{balance}</span>
            </Link>
          </div>
          <nav className="mt-4 space-y-1" aria-label="Dashboard">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            ))}
            <SignOutButton redirectUrl="/">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </SignOutButton>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
