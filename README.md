# Celunio — AI photo studio

23 narrow AI tools (headshots, restoration, product shots, interiors, voiceover, transcription…) on a single shared engine. Users pay per run with prepaid credits, watch results develop live, and get a downloadable file plus a public share link.

**Architecture in one line:** every tool is a declarative config object in `lib/registry.ts`, executed by one run pipeline (`lib/engine.ts`), rendered by one workspace UI (`components/workspace/`), priced by one credits mechanism (`lib/credits.ts`).

## Stack

- Next.js 15 (App Router, TypeScript) on Vercel
- Tailwind CSS v4, Radix primitives, sonner toasts
- Neon Postgres (HTTP serverless driver) + Drizzle ORM — generated files are stored as `bytea` in `run_files`
- Clerk authentication (email/password + Google OAuth)
- OpenAI: `gpt-image-1` (images incl. edits/masks, streamed partials), `gpt-4o-mini` (text), `gpt-4o-mini-tts` (voiceover), `gpt-4o-transcribe` (transcription)

## Environment

```
DATABASE_URL=postgres://…            # Neon
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_…
CLERK_SECRET_KEY=sk_…
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/signup
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/dashboard
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/dashboard
OPENAI_API_KEY=sk-…
IMAGE_QUALITY=low                    # low | medium | high (gpt-image-1)
CLERK_WEBHOOK_SIGNING_SECRET=whsec_… # optional; provisioning also happens lazily
```

## Develop

```bash
npm install
npm run db:push    # create tables in Neon
npm run db:seed    # 47 inspiration gallery posts
npm run dev
```

## Credits economy

- +20 welcome credits on first sign-in (ledger row, lazy provisioning + optional Clerk webhook)
- Debit when a run starts; automatic refund on technical failure or cancel
- Byte-identical rerun (same tool + params + file bytes) is served from cache, free
- Packs: Starter $9/100 · Creator $19/350+50 · Studio $49/1250+250 · Agency $99/3250+750 — checkout stores a pending purchase; the PSP integration hooks in at `continueToPayment` in `app/dashboard/billing/checkout/page.tsx`

## Adding a tool

Add one `ToolConfig` object to `lib/registry.ts` (inputs, controls, price, prompt template) and drop a cover into `public/covers/`. The catalog, marketing page, workspace form, run pipeline and pricing table pick it up automatically.
