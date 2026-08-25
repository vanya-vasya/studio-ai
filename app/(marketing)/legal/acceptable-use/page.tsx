import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Acceptable use" };

export default function AcceptableUsePage() {
  return (
    <LegalPage
      title="Acceptable use"
      sections={[
        {
          heading: "Don't upload",
          body: [
            "Content you have no rights to; images of people used to harass, defame or impersonate them; sexual content involving minors under any circumstances; content that is illegal where you live.",
          ],
        },
        {
          heading: "Don't generate",
          body: [
            "Deceptive media presented as real (deepfakes of real people without consent), content inciting violence or hatred, malware, spam, or anything that violates OpenAI's usage policies — their models power the studio and their rules apply on top of ours.",
          ],
        },
        {
          heading: "The gallery",
          body: [
            "Published items must be safe for a general audience. We remove reported items that break these rules and may suspend repeat offenders.",
          ],
        },
        {
          heading: "Enforcement",
          body: [
            "Violations can lead to removal of content, suspension or termination. Unspent purchased credits on terminated accounts are refunded unless the violation involved fraud or illegal content.",
          ],
        },
      ]}
    />
  );
}
