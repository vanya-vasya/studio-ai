import { SignOutButton } from "@clerk/nextjs";
import type { Metadata } from "next";
import Link from "next/link";
import { getBalance } from "@/lib/credits";
import { ensureUser } from "@/lib/users";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = (await ensureUser())!;
  const balance = await getBalance(user.id);

  const rows = [
    { label: "Email", value: user.email },
    { label: "Name", value: user.name ?? "—" },
    { label: "Credits", value: String(balance) },
    {
      label: "Member since",
      value: user.createdAt.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
  ];

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

      <section className="card-panel mt-8 overflow-hidden">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between border-b border-white/5 px-5 py-4 last:border-0"
          >
            <span className="text-sm text-zinc-500">{row.label}</span>
            <span className="text-sm font-medium text-zinc-100">{row.value}</span>
          </div>
        ))}
      </section>

      <section className="card-panel mt-6 p-6">
        <h2 className="font-semibold text-white">Password & security</h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
          Password, email and connected accounts are managed on your secure
          account page. Changing the password signs you out everywhere else.
        </p>
        <Link
          href="/dashboard/settings/account"
          className="mt-4 inline-block rounded-full border border-white/15 px-5 py-2.5 text-sm text-zinc-200 hover:border-white/30"
        >
          Manage account
        </Link>
      </section>

      <section className="card-panel mt-6 flex items-center justify-between p-6">
        <div>
          <h2 className="font-semibold text-white">Sign out</h2>
          <p className="mt-1 text-sm text-zinc-400">
            You can sign back in any time — the credits stay put.
          </p>
        </div>
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="rounded-full border border-red-400/30 px-5 py-2.5 text-sm text-red-300 transition-colors hover:border-red-400/60"
          >
            Sign out
          </button>
        </SignOutButton>
      </section>
    </div>
  );
}
