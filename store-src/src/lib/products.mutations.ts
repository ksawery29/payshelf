import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { product } from '../db/schema';
import { eq } from 'drizzle-orm';
import { triggerWebhook } from './webhooks';

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
    }) => data
  )
  .handler(async ({ data }) => {
    const [updated] = await db
      .update(product)
      .set({
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        imageUrl: data.imageUrl || null,
        filePath: data.filePath || null,
        stripePriceId: data.stripePriceId || null,
      })
      .where(eq(product.id, data.id))
      .returning();

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

