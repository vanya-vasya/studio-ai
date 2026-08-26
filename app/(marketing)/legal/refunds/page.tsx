import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Refund policy" };

export default function RefundsPage() {
  return (
    <LegalPage
      title="Refund policy"
      sections={[
        {
          heading: "Automatic refunds",
          body: [
            "Any run that fails for technical reasons — a model error, a timeout, a refusal — refunds its credits to your ledger automatically, usually within seconds. No ticket needed.",
          ],
        },
        {
          heading: "Credit packs",
          body: [
            "An untouched pack (no credits spent from it) can be fully refunded within 14 days of purchase. Partially used packs are refunded pro-rata for the unspent credits at the pack's effective per-credit price.",
          ],
        },
        {
          heading: "Duplicates",
          body: [
            "Accidental duplicate purchases are always refunded in full — just write to support@celunio.com.",
          ],
        },
        {
          heading: "Chargebacks",
          body: [
            "Opening a chargeback instead of contacting us first may lead to account suspension while we investigate. Write to us — refunds are genuinely easy here.",
          ],
        },
      ]}
    />
  );
}
