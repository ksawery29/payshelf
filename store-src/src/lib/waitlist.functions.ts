import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { waitlist, product } from '../db/schema';
import { desc, eq, and } from 'drizzle-orm';

/**
 * Join the waitlist for a product.
 */
export const joinWaitlistFn = createServerFn({ method: 'POST' })
  .validator((data: { productId: string; email: string }) => data)
  .handler(async ({ data }) => {
    const emailLower = data.email.trim().toLowerCase();
    
    // Check if already signed up
    const existing = await db
      .select()
      .from(waitlist)
      .where(and(
        eq(waitlist.productId, data.productId),
        eq(waitlist.email, emailLower)
      ))
      .limit(1);

    if (existing.length > 0) {
      return { success: true, alreadyExists: true };
    }

    await db.insert(waitlist).values({
      productId: data.productId,
      email: emailLower,
    });

    return { success: true };
  });

/**
 * List all waitlist signups.
 */
export const listWaitlistFn = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db
    .select({
      id: waitlist.id,
      email: waitlist.email,
      createdAt: waitlist.createdAt,
      productId: waitlist.productId,
      productName: product.name,
    })
    .from(waitlist)
    .innerJoin(product, eq(waitlist.productId, product.id))
    .orderBy(desc(waitlist.createdAt));

  return rows;
});
