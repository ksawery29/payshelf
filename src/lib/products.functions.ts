import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { product } from '../db/schema'
import { desc } from 'drizzle-orm'

/**
 * List all products, newest first.
 */
export const listProductsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const products = await db
      .select()
      .from(product)
      .orderBy(desc(product.createdAt))

    return products
  },
)

/**
 * Create a new product (admin only — route is already protected).
 */
export const createProductFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      name: string
      description: string
      priceCents: number
      imageUrl?: string
      filePath?: string
      stripeProductId?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const [created] = await db
      .insert(product)
      .values({
        name: data.name,
        description: data.description,
        priceCents: data.priceCents,
        imageUrl: data.imageUrl || null,
        filePath: data.filePath || null,
        stripeProductId: data.stripeProductId || null,
      })
      .returning()

    return created
  })
