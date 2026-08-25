import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Terms of service" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of service"
      sections={[
        {
          heading: "1. The service",
          body: [
            "Framique is an AI generation studio: you upload images, audio or text, pick a tool, and OpenAI models produce new images, text or audio in return. You must be at least 16 years old to use the service.",
          ],
        },
        {
          heading: "2. Credits",
          body: [
            "All generation is paid with prepaid credits. Credits are debited when a run starts, never expire, and are non-transferable between accounts. A rerun with byte-identical inputs is served from cache and is free.",
            "Runs that fail for technical reasons — model errors, timeouts, refusals — are refunded to your ledger automatically. A finished result you simply dislike is not a technical failure.",
          ],
        },
        {
          heading: "3. Your content",
          body: [
            "Uploads are processed in memory and are not retained after the run finishes. Generated results are stored so your links keep working, until you delete them or ask us to.",
            "You own the results of your runs and may use them commercially. You are responsible for having the rights to whatever you upload.",
          ],
        },
        {
          heading: "4. Publishing",
          body: [
            "Sharing a result to the public Inspiration gallery is opt-in. We may remove published items on request or when they break the acceptable use policy.",
          ],
        },
        {
          heading: "5. Liability",
          body: [
            "The service is provided as is. To the extent the law allows, our total liability is capped at the amount you paid us in the 12 months before the claim arose.",
          ],
        },
        {
          heading: "6. Contact",
          body: ["Questions about these terms: support@framique.com."],
        },
      ]}
    />
  );
}
