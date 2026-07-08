import { createServerFn } from '@tanstack/react-start';
import { db } from '../db';
import { product, analyticsEvent } from '../db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from './stripe';

const appUrl = process.env.APP_URL || 'http://localhost:3000';

/**
 * Create a Stripe Checkout Session for purchasing a product.
 * Also fires a checkout_initiated analytics event.
 */
export const createCheckoutFn = createServerFn({ method: 'POST' })
  .validator((data: { productId: string; visitorId?: string }) => data)
  .handler(async ({ data }) => {
    // Look up the product
    const [prod] = await db.select().from(product).where(eq(product.id, data.productId)).limit(1);

    if (!prod) {
      throw new Error('Product not found');
    }

    // Create checkout session with dynamic price
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: prod.priceCents,
            product_data: {
              name: prod.name,
              description: prod.description || undefined,
              images: prod.imageUrl ? [prod.imageUrl] : undefined,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId: prod.id,
      },
      customer_email: undefined, // Let Stripe collect it
      success_url: `${appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/checkout/cancel`,
      managed_payments: {
        enabled: true,
      }
    });

    // Fire checkout_initiated event (best-effort, don't block checkout)
    try {
      await db.insert(analyticsEvent).values({
        event: 'checkout_initiated',
        productId: prod.id,
        visitorId: data.visitorId ?? null,
      });
    } catch (err) {
      console.warn('[Payshelf] Failed to record checkout_initiated event:', err);
    }

    return { url: session.url };
  });
