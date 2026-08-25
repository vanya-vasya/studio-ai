import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Account" };

export default function AccountPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Account</h1>
      <UserProfile
        routing="path"
        path="/dashboard/settings/account"
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none border border-white/10",
          },
        }}
      />
    </div>
  );
}
