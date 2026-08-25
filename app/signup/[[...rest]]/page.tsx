import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = { title: "Create your studio" };

export default function SignupPage() {
  return (
    <AuthShell
      heading="Create your studio"
      subheading="20 credits land on your balance right away — enough for a first batch of frames. No card needed."
    >
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/dashboard"
        appearance={{ elements: { rootBox: "w-full", cardBox: "w-full shadow-none" } }}
      />
    </AuthShell>
  );
}
