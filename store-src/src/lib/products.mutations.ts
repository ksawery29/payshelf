import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { product, waitlist } from '../db/schema';
import { eq } from 'drizzle-orm';
import { triggerWebhook } from './webhooks';
import { sendWaitlistReadyEmail } from './email';

/**
 * Edit/Update an existing product.
 */
export const updateProductFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      id: string;
      name: string;
      description: string;
      priceCents: number;
      imageUrl?: string;
      filePath?: string;
      stripePriceId?: string;
      isWaitlist?: boolean;
    }) => data
  )
  .handler(async ({ data }) => {
    // Check current state to see if waitlist is being disabled
    const currentRows = await db
      .select({ isWaitlist: product.isWaitlist })
      .from(product)
      .where(eq(product.id, data.id))
      .limit(1);
    
    const wasWaitlist = currentRows[0]?.isWaitlist ?? false;
    const isNowWaitlist = data.isWaitlist ?? false;

    const [updated] = await db
      .update(product)
      .set({
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        imageUrl: data.imageUrl || null,
        filePath: data.filePath || null,
        stripePriceId: data.stripePriceId || null,
        isWaitlist: isNowWaitlist,
      })
      .where(eq(product.id, data.id))
      .returning();

    // If waitlist was toggled from true to false, notify waitlisted users and clear waitlist
    if (wasWaitlist && !isNowWaitlist) {
      const waitlistEntries = await db
        .select()
        .from(waitlist)
        .where(eq(waitlist.productId, data.id));

      if (waitlistEntries.length > 0) {
        // Send emails asynchronously
        for (const entry of waitlistEntries) {
          try {
            await sendWaitlistReadyEmail(entry.email, updated.name, updated.id);
          } catch (err) {
            console.error(`Failed to send waitlist email to ${entry.email}:`, err);
          }
        }

        // Clear waitlist for this product
        await db.delete(waitlist).where(eq(waitlist.productId, data.id));
      }
    }

    // Trigger webhook notification
    await triggerWebhook('product.updated', { product: updated });

    return updated;
  });

/**
 * Delete a product.
 */
export const deleteProductFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const [deleted] = await db.delete(product).where(eq(product.id, data.id)).returning();

    // Trigger webhook notification
    await triggerWebhook('product.deleted', { product: deleted });

    return deleted;
  });

