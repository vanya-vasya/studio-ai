import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { creditLedger, db, users } from "@/lib/db";
import { WELCOME_CREDITS } from "@/lib/packs";

export type AppUser = {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
};

/**
 * Idempotent user provisioning: creates the users row and the
 * "Welcome bonus" ledger entry on first sight of a Clerk user.
 * Works without the Clerk webhook (and alongside it).
 */
export const provisionUser = async (params: {
  id: string;
  email: string;
  name: string | null;
}): Promise<AppUser> => {
  // No conflict target: concurrent renders (layout + page) may race on the
  // same insert, and the loser can trip the email unique index instead of
  // the primary key. Any conflict means "row already exists" here.
  const inserted = await db
    .insert(users)
    .values({ id: params.id, email: params.email, name: params.name })
    .onConflictDoNothing()
    .returning();

  if (inserted.length > 0) {
    await db.insert(creditLedger).values({
      userId: params.id,
      kind: "welcome",
      delta: WELCOME_CREDITS,
      balanceAfter: WELCOME_CREDITS,
      ref: "Welcome bonus",
    });
    return inserted[0];
  }

  const [existing] = await db.select().from(users).where(eq(users.id, params.id));
  return existing;
};

/**
 * Resolve the signed-in Clerk user and make sure a DB row exists.
 * Wrapped in React cache() so layout and page share one call per request.
 */
export const ensureUser = cache(async (): Promise<AppUser | null> => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const email =
    clerkUser.primaryEmailAddress?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${clerkUser.id}@unknown.local`;
  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
    clerkUser.username ||
    null;
  return provisionUser({ id: clerkUser.id, email, name });
});

export const handleFor = (user: { name: string | null; email: string }) => {
  const base = user.name?.trim() || user.email.split("@")[0];
  return base.toLowerCase().replace(/[^a-z0-9._-]+/g, ".").replace(/^\.+|\.+$/g, "");
};
