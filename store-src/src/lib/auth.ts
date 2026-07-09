import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { tanstackStartCookies } from 'better-auth/tanstack-start';
import { db } from '../db';
import * as schema from '../db/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite', // libsql speaks sqlite dialect, use "sqlite" here not "turso"
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async () => {
          // Only allow sign-up if no users exist yet (single admin model)
          const existing = await db.select({ id: schema.user.id }).from(schema.user).limit(1);

          if (existing.length > 0) {
            return false; // Returning false blocks the creation
          }
        },
      },
    },
  },
  plugins: [tanstackStartCookies()], // Must be the last plugin
});
