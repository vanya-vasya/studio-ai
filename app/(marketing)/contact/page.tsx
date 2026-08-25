import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Support, billing, abuse reports and legal — support@framique.com.",
};

const BLOCKS = [
  {
    title: "Support",
    body: "Stuck runs, missing results, account questions — include the run link if you have one.",
  },
  {
    title: "Billing and refunds",
    body: "Purchases, invoices and refund requests. Mention the email on the account.",
  },
  {
    title: "Abuse reports",
    body: "Content in the public gallery that shouldn't be there. Send the link and we'll review it.",
  },
  {
    title: "Legal and privacy",
    body: "Data requests, takedowns and anything for the lawyers.",
  },
];

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <p className="section-label">Contact</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">Talk to us</h1>
      <p className="mt-4 text-zinc-400">
        Everything goes through{" "}
        <a
          href="mailto:support@framique.com"
          className="text-purple-300 underline-offset-4 hover:underline"
        >
          support@framique.com
        </a>{" "}
        and is answered within two business days.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {BLOCKS.map((block) => (
          <div key={block.title} className="card-panel p-6">
            <h2 className="font-semibold text-white">{block.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">{block.body}</p>
            <a
              href="mailto:support@framique.com"
              className="mt-4 inline-block text-sm text-purple-300 underline-offset-4 hover:underline"
            >
              support@framique.com
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
