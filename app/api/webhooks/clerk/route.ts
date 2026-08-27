import { NextRequest, NextResponse } from "next/server";
import { provisionUser } from "@/lib/users";

export const runtime = "nodejs";

/**
 * Clerk `user.created` webhook → provision the user with the welcome bonus.
 * Provisioning is also done lazily on first dashboard visit, so this
 * endpoint is a fast-path, not a requirement.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  const payload = await req.text();

  if (secret) {
    const { Webhook } = await import("svix").catch(() => ({ Webhook: null }));
    if (Webhook) {
      try {
        const webhook = new Webhook(secret);
        webhook.verify(payload, {
          "svix-id": req.headers.get("svix-id") ?? "",
          "svix-timestamp": req.headers.get("svix-timestamp") ?? "",
          "svix-signature": req.headers.get("svix-signature") ?? "",
        });
      } catch {
        return NextResponse.json({ error: "Bad signature" }, { status: 400 });
      }
    }
  }

  let event: {
    type?: string;
    data?: {
      id?: string;
      email_addresses?: { id: string; email_address: string }[];
      primary_email_address_id?: string | null;
      first_name?: string | null;
      last_name?: string | null;
    };
  };
  try {
    event = JSON.parse(payload);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.type === "user.created" && event.data?.id) {
    const addresses = event.data.email_addresses ?? [];
    const email =
      addresses.find((item) => item.id === event.data?.primary_email_address_id)
        ?.email_address ?? addresses[0]?.email_address;
    if (email) {
      await provisionUser({
        id: event.data.id,
        email,
        name:
          [event.data.first_name, event.data.last_name].filter(Boolean).join(" ") ||
          null,
      });
    }
  }

  return NextResponse.json({ ok: true });
}

export async function GET() {
  return NextResponse.json({ status: "healthy" });
}
