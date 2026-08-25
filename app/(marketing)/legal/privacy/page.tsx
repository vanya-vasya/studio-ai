import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      sections={[
        {
          heading: "What we collect",
          body: [
            "Account data (email, name) via our auth provider Clerk; your credit ledger and run history; the generated results of your runs. Payment card details never touch our servers.",
          ],
        },
        {
          heading: "What we do not keep",
          body: [
            "Files you upload for a run are processed in memory and discarded when the run finishes. They are sent to OpenAI to produce your result and are subject to OpenAI's API data policies, which do not use API inputs for training by default.",
          ],
        },
        {
          heading: "How results are stored",
          body: [
            "Generated files live in our database behind unguessable links so your result pages keep working. Delete requests via support@framique.com are honoured within 30 days.",
          ],
        },
        {
          heading: "Third parties",
          body: [
            "Clerk (authentication), Neon (database), Vercel (hosting), OpenAI (generation). Each processes only the data needed for its role.",
          ],
        },
        {
          heading: "Your rights",
          body: [
            "You can request a copy or deletion of your data at any time: support@framique.com.",
          ],
        },
      ]}
    />
  );
}
