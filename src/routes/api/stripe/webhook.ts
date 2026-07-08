import { createFileRoute } from '@tanstack/react-router'
import { stripe } from '#/lib/stripe'
import { db } from '#/db'
import { purchase, product } from '#/db/schema'
import { eq } from 'drizzle-orm'
import { sendPurchaseEmail } from '#/lib/email'

export const Route = createFileRoute('/api/stripe/webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.text()
        const signature = request.headers.get('stripe-signature')

        if (!signature) {
          return new Response('Missing stripe-signature header', { status: 400 })
        }

        let event

        try {
          event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!,
          )
        } catch (err) {
          console.error('[Payshelf] Webhook signature verification failed:', err)
          return new Response('Webhook signature verification failed', { status: 400 })
        }

        try {
          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object
              const productId = session.metadata?.productId
              const customerEmail = session.customer_details?.email

              if (!productId || !customerEmail) {
                console.error('[Payshelf] Missing productId or customerEmail in checkout session')
                break
              }

              // Idempotency: check if we already processed this session
              const existing = await db
                .select({ id: purchase.id })
                .from(purchase)
                .where(eq(purchase.stripeSessionId, session.id))
                .limit(1)

              if (existing.length > 0) {
                console.log('[Payshelf] Checkout session already processed:', session.id)
                break
              }

              // Look up product for the email
              const [prod] = await db
                .select()
                .from(product)
                .where(eq(product.id, productId))
                .limit(1)

              if (!prod) {
                console.error('[Payshelf] Product not found for checkout:', productId)
                break
              }

              // Create purchase record
              const [newPurchase] = await db
                .insert(purchase)
                .values({
                  productId,
                  customerEmail,
                  stripeSessionId: session.id,
                  stripePaymentIntentId:
                    typeof session.payment_intent === 'string'
                      ? session.payment_intent
                      : session.payment_intent?.id ?? null,
                  status: 'active',
                })
                .returning()

              // Send magic link email
              await sendPurchaseEmail(
                customerEmail,
                prod.name,
                newPurchase.accessToken,
              )

              console.log('[Payshelf] Purchase created:', newPurchase.id)
              break
            }

            case 'charge.refunded': {
              const charge = event.data.object
              const paymentIntentId =
                typeof charge.payment_intent === 'string'
                  ? charge.payment_intent
                  : charge.payment_intent?.id

              if (paymentIntentId) {
                await db
                  .update(purchase)
                  .set({ status: 'refunded' })
                  .where(eq(purchase.stripePaymentIntentId, paymentIntentId))

                console.log('[Payshelf] Purchase refunded for PI:', paymentIntentId)
              }
              break
            }

            case 'charge.dispute.created': {
              const dispute = event.data.object
              const paymentIntentId =
                typeof dispute.payment_intent === 'string'
                  ? dispute.payment_intent
                  : dispute.payment_intent?.id

              if (paymentIntentId) {
                await db
                  .update(purchase)
                  .set({ status: 'disputed' })
                  .where(eq(purchase.stripePaymentIntentId, paymentIntentId))

                console.log('[Payshelf] Purchase disputed for PI:', paymentIntentId)
              }
              break
            }

            default:
              // Unhandled event type — ignore
              break
          }
        } catch (err) {
          console.error('[Payshelf] Error handling webhook event:', err)
          return new Response('Webhook handler error', { status: 500 })
        }

        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      },
    },
  },
})
