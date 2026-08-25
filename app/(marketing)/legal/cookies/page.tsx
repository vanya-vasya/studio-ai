import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Cookies" };

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookies"
      sections={[
        {
          heading: "What we set",
          body: [
            "Only what the service needs to work: session cookies from our auth provider (Clerk) that keep you signed in, and a cookie remembering cookie-notice dismissal.",
          ],
        },
        {
          heading: "What we don't",
          body: [
            "No advertising cookies, no cross-site trackers, no selling of browsing data. Analytics, if enabled, are cookieless and aggregate.",
          ],
        },
        {
          heading: "Managing cookies",
          body: [
            "Blocking cookies in your browser will sign you out and break the dashboard, but public pages keep working.",
          ],
        },
      ]}
    />
  );
}
