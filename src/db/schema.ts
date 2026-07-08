import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ── Products ──────────────────────────────────────────────────────────────

export const product = sqliteTable("product", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  stripeProductId: text("stripe_product_id"),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  imageUrl: text("image_url"),
  filePath: text("file_path"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ── Purchases ─────────────────────────────────────────────────────────────

export const purchase = sqliteTable(
  "purchase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    productId: text("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    customerEmail: text("customer_email").notNull(),
    stripeSessionId: text("stripe_session_id").notNull().unique(),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    accessToken: text("access_token")
      .notNull()
      .unique()
      .$defaultFn(() => crypto.randomUUID()),
    status: text("status", { enum: ["active", "refunded", "disputed"] })
      .notNull()
      .default("active"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("purchase_productId_idx").on(table.productId),
    index("purchase_accessToken_idx").on(table.accessToken),
    index("purchase_stripePaymentIntentId_idx").on(table.stripePaymentIntentId),
  ],
);

export const purchaseRelations = relations(purchase, ({ one }) => ({
  product: one(product, {
    fields: [purchase.productId],
    references: [product.id],
  }),
}));

export const productRelations = relations(product, ({ many }) => ({
  purchases: many(purchase),
  analyticsEvents: many(analyticsEvent),
  cancelFeedbacks: many(cancelFeedback),
}));

// ── Shop Settings ──────────────────────────────────────────────────────────
// Single-row table — always upserted with id = 'singleton'

export const shopSettings = sqliteTable("shop_settings", {
  id: text("id").primaryKey().default("singleton"),
  shopName: text("shop_name").notNull().default("My Shop"),
  shopTagline: text("shop_tagline"),
  fromEmail: text("from_email"),
  termsOfService: text("terms_of_service"),
  privacyPolicy: text("privacy_policy"),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

// ── Analytics Events ───────────────────────────────────────────────────────

export const analyticsEvent = sqliteTable(
  "analytics_event",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    event: text("event", {
      enum: [
        "page_view",
        "checkout_initiated",
        "checkout_completed",
        "checkout_cancelled",
      ],
    }).notNull(),
    productId: text("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    visitorId: text("visitor_id"), // anonymous localStorage UUID
    metadata: text("metadata"), // JSON blob for any extra fields
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("analytics_event_event_createdAt_idx").on(table.event, table.createdAt),
    index("analytics_event_productId_event_idx").on(table.productId, table.event),
    index("analytics_event_visitorId_idx").on(table.visitorId),
  ],
);

export const analyticsEventRelations = relations(analyticsEvent, ({ one }) => ({
  product: one(product, {
    fields: [analyticsEvent.productId],
    references: [product.id],
  }),
}));

// ── Cancel Feedback ────────────────────────────────────────────────────────

export const cancelFeedback = sqliteTable(
  "cancel_feedback",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    visitorId: text("visitor_id"),
    productId: text("product_id").references(() => product.id, {
      onDelete: "set null",
    }),
    reason: text("reason", {
      enum: [
        "too_expensive",
        "just_browsing",
        "found_alternative",
        "trust",
        "other",
      ],
    }).notNull(),
    comment: text("comment"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index("cancel_feedback_productId_idx").on(table.productId),
    index("cancel_feedback_reason_idx").on(table.reason),
  ],
);

export const cancelFeedbackRelations = relations(cancelFeedback, ({ one }) => ({
  product: one(product, {
    fields: [cancelFeedback.productId],
    references: [product.id],
  }),
}));

// ── Support Chats ─────────────────────────────────────────────────────────

export const supportChat = sqliteTable("support_chat", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  visitorId: text("visitor_id").notNull(),
  customerEmail: text("customer_email"),
  status: text("status", { enum: ["open", "closed"] }).notNull().default("open"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const supportMessage = sqliteTable("support_message", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  chatId: text("chat_id")
    .notNull()
    .references(() => supportChat.id, { onDelete: "cascade" }),
  sender: text("sender", { enum: ["customer", "agent"] }).notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const supportChatRelations = relations(supportChat, ({ many }) => ({
  messages: many(supportMessage),
}));

export const supportMessageRelations = relations(supportMessage, ({ one }) => ({
  chat: one(supportChat, {
    fields: [supportMessage.chatId],
    references: [supportChat.id],
  }),
}));

