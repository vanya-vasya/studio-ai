import Link from "next/link";
import { Logo } from "@/components/logo";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Studio",
    links: [
      { href: "/tools", label: "All tools" },
      { href: "/tool/photo-studio", label: "Photo Studio" },
      { href: "/inspiration", label: "Inspiration" },
      { href: "/pricing", label: "Pricing" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/signup", label: "Create account" },
      { href: "/login", label: "Sign in" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/dashboard/billing", label: "Buy credits" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/terms", label: "Terms of service" },
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/refunds", label: "Refund policy" },
      { href: "/legal/acceptable-use", label: "Acceptable use" },
      { href: "/legal/cookies", label: "Cookies" },
    ],
  },
];

export const SiteFooter = () => (
  <footer className="mt-24 border-t border-white/5">
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(4,1fr)]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
            23 AI tools on a single engine. Images, text and audio are generated
            by OpenAI models.
          </p>
          <p className="max-w-xs text-sm leading-relaxed text-zinc-500">
            Uploads are processed in memory and never stored. Results live
            behind the link you get.
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h3 className="section-label mb-4">{column.title}</h3>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="mt-12 border-t border-white/5 pt-6 text-xs text-zinc-600">
        © 2026 Celunio. All rights reserved.
      </p>
    </div>
  </footer>
);
