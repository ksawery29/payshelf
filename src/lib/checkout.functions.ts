import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { product } from '../db/schema'
import { eq } from 'drizzle-orm'
import { stripe } from './stripe'

const appUrl = process.env.APP_URL || 'http://localhost:3000'

/**
 * Create a Stripe Checkout Session for purchasing a product.
 */
export const createCheckoutFn = createServerFn({ method: 'POST' })
  .validator((data: { productId: string }) => data)
  .handler(async ({ data }) => {
    // Look up the product
    const [prod] = await db
      .select()
      .from(product)
      .where(eq(product.id, data.productId))
      .limit(1)

    if (!prod) {
      throw new Error('Product not found')
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
    })

    return { url: session.url }
  })
