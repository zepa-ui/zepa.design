import {
  bigint,
  bigserial,
  index,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

/**
 * Schema per backend.md Part 3.
 *
 * The link to Clerk is a single string: `users.id` IS the Clerk userId. We
 * never generate our own. Clerk owns identity; this database owns everything
 * that is about Zepa rather than about a person.
 */

/**
 * Mirror of the Clerk user, populated by the Clerk webhook. It exists so other
 * tables have something to reference and so admin queries can join without a
 * round-trip to Clerk's API — not as a second source of truth for identity.
 */
export const users = pgTable("users", {
  /** Clerk userId. Never generated here. */
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  /** 'user' | 'admin'. Mirrored from Clerk publicMetadata by webhook. */
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

/**
 * The compound primary key is the feature: a duplicate bookmark is
 * structurally impossible, so toggling is a single INSERT … ON CONFLICT
 * with no read-then-write and no race between two tabs.
 */
export const bookmarks = pgTable(
  "bookmarks",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.slug] }),
    index("bookmarks_user_idx").on(t.userId, t.createdAt.desc()),
  ]
)

/** Likes are user-based (one per person). Views, by contrast, are event-based. */
export const likes = pgTable(
  "likes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.slug] }),
    index("likes_slug_idx").on(t.slug),
  ]
)

export const submissions = pgTable(
  "submissions",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    slug: text("slug"),
    title: text("title").notNull(),
    /** 'pending' | 'approved' | 'rejected' */
    status: text("status").notNull().default("pending"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("submissions_status_idx").on(t.status, t.createdAt.desc())]
)

/**
 * One row per component — counters only, no per-event rows.
 *
 * Denormalised on purpose: counting `select count(*) from likes` on every
 * gallery card would be one query per card per page load. This is the number
 * the UI reads; the `likes` table is the record of *who*.
 *
 * All four counters are collected from day one. Which ones are *rendered* is a
 * separate decision — currently views only on public surfaces, all four in
 * admin analytics. Surfacing likes later is a template change, not a migration.
 */
export const componentStats = pgTable("component_stats", {
  slug: text("slug").primaryKey(),
  views: bigint("views", { mode: "number" }).notNull().default(0),
  likes: bigint("likes", { mode: "number" }).notNull().default(0),
  saves: bigint("saves", { mode: "number" }).notNull().default(0),
  installs: bigint("installs", { mode: "number" }).notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export type User = typeof users.$inferSelect
export type Bookmark = typeof bookmarks.$inferSelect
export type Like = typeof likes.$inferSelect
export type Submission = typeof submissions.$inferSelect
export type ComponentStatsRow = typeof componentStats.$inferSelect
