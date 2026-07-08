import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { product } from '../db/schema'
import { eq } from 'drizzle-orm'

/**
 * Edit/Update an existing product.
 */
export const updateProductFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      id: string
      name: string
      description: string
      priceCents: number
      imageUrl?: string
      filePath?: string
      stripeProductId?: string
    }) => data,
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
        stripeProductId: data.stripeProductId || null,
      })
      .where(eq(product.id, data.id))
      .returning()

    return updated
  })

/**
 * Delete a product.
 */
export const deleteProductFn = createServerFn({ method: 'POST' })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const [deleted] = await db
      .delete(product)
      .where(eq(product.id, data.id))
      .returning()

    return deleted
  })
