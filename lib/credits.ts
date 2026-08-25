import { desc, eq, sql } from "drizzle-orm";
import { creditLedger, db } from "@/lib/db";

export const getBalance = async (userId: string): Promise<number> => {
  const [row] = await db
    .select({ balance: sql<number>`coalesce(sum(${creditLedger.delta}), 0)::int` })
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId));
  return row?.balance ?? 0;
};

/**
 * Atomically debit credits with a single guarded statement.
 * Throws "insufficient" if balance < cost. Returns the balance after.
 */
export const debitCredits = async (
  userId: string,
  cost: number,
  ref: string,
): Promise<number> => {
  const result = await db.execute(sql`
    with bal as (
      select coalesce(sum(delta), 0)::int as b
      from credit_ledger
      where user_id = ${userId}
    )
    insert into credit_ledger (user_id, kind, delta, balance_after, ref)
    select ${userId}, 'generation', ${-cost}, b - ${cost}, ${ref}
    from bal
    where b >= ${cost}
    returning balance_after
  `);
  const row = result.rows[0] as { balance_after: number } | undefined;
  if (!row) throw new Error("insufficient");
  return row.balance_after;
};

export const refundCredits = async (
  userId: string,
  amount: number,
  ref: string,
): Promise<number> => {
  const result = await db.execute(sql`
    with bal as (
      select coalesce(sum(delta), 0)::int as b
      from credit_ledger
      where user_id = ${userId}
    )
    insert into credit_ledger (user_id, kind, delta, balance_after, ref)
    select ${userId}, 'refund', ${amount}, b + ${amount}, ${ref}
    from bal
    returning balance_after
  `);
  const row = result.rows[0] as { balance_after: number };
  return row.balance_after;
};

export const getLedger = async (userId: string) =>
  db
    .select()
    .from(creditLedger)
    .where(eq(creditLedger.userId, userId))
    .orderBy(desc(creditLedger.createdAt), desc(creditLedger.id));
