import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "How credits, refunds, ownership and speed work on Celunio.",
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need to know how to write prompts?",
    a: "No. Every tool asks for exactly what it needs — a photo, a couple of dropdowns, sometimes one short line of text. The prompt engineering is baked into the tool itself.",
  },
  {
    q: "How do credits work?",
    a: "Credits are the only currency. Each tool shows its price on the run button; the credits are debited when the run starts. New accounts get 20 credits free, packs start at $9, and credits never expire.",
  },
  {
    q: "What happens if a run fails?",
    a: "Technical failures — model errors, timeouts, refusals — refund automatically. You'll see a “Refund” row in your credit ledger within seconds of the failure.",
  },
  {
    q: "Who owns the results?",
    a: "You do. Use them commercially, print them, post them. We claim no rights over your outputs.",
  },
  {
    q: "What happens to my uploads?",
    a: "Uploads are processed in memory and never stored. Only the generated results are kept, and they stay behind your links until you delete them.",
  },
  {
    q: "Will my results appear publicly?",
    a: "Only if you choose. Publishing to the Inspiration gallery is opt-in via the “Share to Inspiration” button on a finished run.",
  },
  {
    q: "The model refused my request. Do I lose credits?",
    a: "No. A refusal counts as a technical failure and returns the credits to your balance automatically.",
  },
  {
    q: "How fast is it?",
    a: "A single frame usually takes 20–60 seconds. A Photo Studio batch of 4 frames takes about a minute and a half, and you watch the frames develop live.",
  },
  {
    q: "Can I get an invoice?",
    a: "Yes — write to support@celunio.com with your account email and we'll send one within two business days.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="section-label">Help</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        Frequently asked questions
      </h1>
      <dl className="mt-10 space-y-4">
        {FAQ.map((item) => (
          <div key={item.q} className="card-panel p-6">
            <dt className="font-semibold text-white">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-zinc-400">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
