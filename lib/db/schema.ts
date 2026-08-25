import {
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({
  dataType() {
    return "bytea";
  },
});

export const users = pgTable("users", {
  id: text("id").primaryKey(), // Clerk user id
  email: text("email").notNull().unique(),
  name: text("name"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    kind: text("kind", {
      enum: ["welcome", "purchase", "generation", "refund", "admin"],
    }).notNull(),
    delta: integer("delta").notNull(),
    balanceAfter: integer("balance_after").notNull(),
    ref: text("ref"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("ledger_user_idx").on(table.userId, table.createdAt)],
);

export const runs = pgTable(
  "runs",
  {
    id: text("id").primaryKey(), // nanoid ~10 chars
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    toolSlug: text("tool_slug").notNull(),
    lookSlug: text("look_slug"),
    params: jsonb("params").notNull().default({}),
    cost: integer("cost").notNull(),
    status: text("status", {
      enum: ["running", "done", "failed", "cancelled"],
    }).notNull(),
    outputKind: text("output_kind", { enum: ["image", "text", "audio"] }).notNull(),
    textOutput: text("text_output"),
    inputHash: text("input_hash").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    finishedAt: timestamp("finished_at"),
  },
  (table) => [
    index("runs_user_idx").on(table.userId, table.createdAt),
    index("runs_hash_idx").on(table.userId, table.inputHash),
  ],
);

export const runFiles = pgTable(
  "run_files",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    runId: text("run_id")
      .notNull()
      .references(() => runs.id),
    index: integer("index").notNull(),
    filename: text("filename").notNull(),
    mime: text("mime").notNull(),
    bytes: integer("bytes").notNull(),
    width: integer("width"),
    height: integer("height"),
    data: bytea("data").notNull(),
  },
  (table) => [uniqueIndex("run_files_unique").on(table.runId, table.filename)],
);

export const inspirationPosts = pgTable("inspiration_posts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  runId: text("run_id").unique(),
  userId: text("user_id"),
  title: text("title").notNull(),
  toolSlug: text("tool_slug").notNull(),
  lookSlug: text("look_slug"),
  imageUrl: text("image_url").notNull(),
  authorHandle: text("author_handle").notNull(),
  likes: integer("likes").notNull().default(0),
  publishedAt: timestamp("published_at").notNull().defaultNow(),
});

export const purchases = pgTable("purchases", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  pack: text("pack", {
    enum: ["starter", "creator", "studio", "agency"],
  }).notNull(),
  priceCents: integer("price_cents").notNull(),
  credits: integer("credits").notNull(),
  status: text("status", { enum: ["pending", "paid", "refunded"] })
    .notNull()
    .default("pending"),
  billing: jsonb("billing"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
