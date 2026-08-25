import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description: "Why narrow tools beat an empty prompt box.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="section-label">Company</p>
      <h1 className="mt-2 text-4xl font-bold tracking-tight">
        Why narrow tools beat <span className="text-gradient">an empty prompt box</span>
      </h1>
      <div className="mt-8 space-y-6 leading-relaxed text-zinc-400">
        <p>
          Give someone a blank prompt field and they freeze. Give them a tool
          called “Business Headshot” with three dropdowns and they get a usable
          portrait on the first try. Framique is built on that observation: 23
          narrow tools, each doing one job with the fewest possible knobs.
        </p>
        <p>
          Under the hood there is exactly one engine. A tool is a configuration
          object, not a bespoke page: its inputs, controls, price and prompt
          template live in a single registry, and one shared pipeline runs every
          generation, one workspace renders every form, one pricing mechanism
          charges every run. Adding tool number 24 is a data change, not a
          project.
        </p>
        <p>
          Money is deliberately boring. Credits are prepaid, the price sits on
          the run button, and a failed run refunds itself to your ledger
          automatically. No subscription, no expiry, no feature gates.
        </p>
        <p>
          The models behind the studio are OpenAI&apos;s: gpt-image-1 for
          images, GPT-4o for text, dedicated speech models for voiceovers and
          transcription. We send your inputs there, stream the result back, and
          keep uploads in memory only.
        </p>
      </div>
      <div className="mt-10 flex gap-4">
        <Link href="/signup" className="btn-gradient px-6 py-3 text-sm">
          Start with 20 free credits
        </Link>
        <Link
          href="/tools"
          className="rounded-full border border-white/15 px-6 py-3 text-sm text-zinc-200 hover:border-white/30"
        >
          Browse the tools
        </Link>
      </div>
    </div>
  );
}
