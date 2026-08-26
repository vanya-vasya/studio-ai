import { TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db, purchases } from "@/lib/db";
import { formatPrice, getPack } from "@/lib/packs";
import { ensureUser } from "@/lib/users";

export const metadata: Metadata = { title: "Checkout" };

/**
 * Payments are deferred: this records a pending purchase and shows the
 * "payments coming soon" state. When a PSP is wired up, implement
 * createCheckoutSession(purchaseId) and redirect to the provider from here.
 */
async function continueToPayment(formData: FormData) {
  "use server";
  const user = await ensureUser();
  if (!user) redirect("/login");
  const pack = getPack(String(formData.get("pack")));
  if (!pack) redirect("/dashboard/billing");

  await db.insert(purchases).values({
    userId: user.id,
    pack: pack.id,
    priceCents: pack.priceCents,
    credits: pack.credits + pack.bonus,
    status: "pending",
    billing: {
      firstName: String(formData.get("firstName") ?? ""),
      lastName: String(formData.get("lastName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      postalCode: String(formData.get("postalCode") ?? ""),
      country: String(formData.get("country") ?? ""),
    },
  });

  redirect("/dashboard/billing/checkout?pack=" + pack.id + "&state=pending");
}

const FIELDS: {
  id: string;
  label: string;
  type?: string;
  placeholder?: string;
  half?: boolean;
}[] = [
  { id: "firstName", label: "First name", half: true },
  { id: "lastName", label: "Last name", half: true },
  { id: "email", label: "Email", type: "email" },
  { id: "phone", label: "Phone", placeholder: "+1 555 000 1234" },
  { id: "address", label: "Address" },
  { id: "city", label: "City", half: true },
  { id: "postalCode", label: "Postal code", half: true },
  { id: "country", label: "Country (2-letter code)", placeholder: "US" },
];

export default async function CheckoutPage(props: {
  searchParams: Promise<{ pack?: string; state?: string }>;
}) {
  const { pack: packId, state } = await props.searchParams;
  const user = (await ensureUser())!;
  const pack = getPack(packId ?? "");
  if (!pack) notFound();

  if (state === "pending") {
    return (
      <div className="mx-auto max-w-lg">
        <div className="card-panel p-8 text-center">
          <TriangleAlert className="mx-auto size-8 text-amber-300" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold">Almost there</h1>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Your {pack.name} order is saved. Card payments are being switched
            on — until then, write to{" "}
            <a
              href="mailto:support@celunio.com"
              className="text-purple-300 underline underline-offset-4"
            >
              support@celunio.com
            </a>{" "}
            and we will top up your balance manually within a few hours.
          </p>
          <Link
            href="/dashboard/billing"
            className="btn-gradient mt-6 inline-block px-6 py-2.5 text-sm"
          >
            Back to Credits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-3 text-sm text-zinc-400">
        {pack.name} pack —{" "}
        <span className="font-semibold text-zinc-200">
          {(pack.credits + pack.bonus).toLocaleString()} credits
        </span>{" "}
        for {formatPrice(pack.priceCents)}.
      </p>
      <p className="mt-1 text-xs text-zinc-600">
        Card details are entered on the payment provider&apos;s page, not here.
      </p>

      <form action={continueToPayment} className="card-panel mt-6 p-6">
        <input type="hidden" name="pack" value={pack.id} />
        <div className="grid grid-cols-2 gap-4">
          {FIELDS.map((field) => (
            <label
              key={field.id}
              className={field.half ? "" : "col-span-2"}
            >
              <span className="mb-1.5 block text-xs font-medium text-zinc-400">
                {field.label}
              </span>
              <input
                name={field.id}
                type={field.type ?? "text"}
                required
                defaultValue={field.id === "email" ? user.email : ""}
                placeholder={field.placeholder}
                maxLength={field.id === "country" ? 2 : undefined}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-purple-400/60 focus:outline-none"
              />
            </label>
          ))}
        </div>
        <button type="submit" className="btn-gradient mt-6 w-full py-3 text-sm">
          Continue to payment
        </button>
      </form>
    </div>
  );
}
