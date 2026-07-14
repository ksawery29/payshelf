import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { purchase, product } from '../db/schema';
import { desc, eq } from 'drizzle-orm';
import { stripe } from './stripe';

/**
 * List all orders (purchases) with product details.
 */
export const listOrdersFn = createServerFn({ method: 'GET' }).handler(async () => {
  const orders = await db
    .select({
      id: purchase.id,
      productId: purchase.productId,
      customerEmail: purchase.customerEmail,
      stripeSessionId: purchase.stripeSessionId,
      stripePaymentIntentId: purchase.stripePaymentIntentId,
      accessToken: purchase.accessToken,
      status: purchase.status,
      createdAt: purchase.createdAt,
      productName: product.name,
      productPriceCents: product.priceCents,
    })
    .from(purchase)
    .innerJoin(product, eq(purchase.productId, product.id))
    .orderBy(desc(purchase.createdAt));

  return orders;
});

/**
 * Update the status of an order and optionally issue a Stripe refund.
 */
export const updateOrderStatusFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string; status: 'active' | 'refunded' | 'disputed' }) => data)
  .handler(async ({ data }) => {
    const [p] = await db
      .select()
      .from(purchase)
      .where(eq(purchase.id, data.id))
      .limit(1);

    if (!p) {
      throw new Error('Order not found');
    }

    if (p.status === 'refunded' || p.status === 'disputed') {
      throw new Error('Cannot change status of a refunded or disputed order.');
    }

    // If status is refunded, trigger Stripe Refund API if payment_intent exists
    if (data.status === 'refunded') {
      if (p.stripePaymentIntentId) {
        try {
          await stripe.refunds.create({
            payment_intent: p.stripePaymentIntentId,
          });
        } catch (stripeErr) {
          console.error('[Payshelf] Stripe refund failed:', stripeErr);
          throw new Error(
            stripeErr instanceof Error ? stripeErr.message : 'Stripe refund failed'
          );
        }
      }
    }

    const [updated] = await db
      .update(purchase)
      .set({ status: data.status })
      .where(eq(purchase.id, data.id))
      .returning();

    return updated;
  });
