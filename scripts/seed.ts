import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { SEED_POSTS } from "../lib/inspiration-seed";
import { inspirationPosts } from "../lib/db/schema";

const main = async () => {
  const client = neon(process.env.DATABASE_URL!);
  const db = drizzle(client);

  const existing = await db
    .select({ id: inspirationPosts.id })
    .from(inspirationPosts);
  if (existing.length > 0) {
    console.log(`Inspiration already has ${existing.length} posts — skipping seed.`);
    return;
  }

  // Spread publish dates over the last ~60 days, oldest first
  const now = Date.now();
  const rows = SEED_POSTS.map((post, index) => ({
    ...post,
    publishedAt: new Date(
      now - (SEED_POSTS.length - index) * 29 * 60 * 60 * 1000,
    ),
  }));

  await db.insert(inspirationPosts).values(rows);
  console.log(`Seeded ${rows.length} inspiration posts.`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
