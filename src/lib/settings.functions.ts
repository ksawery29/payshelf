import { createServerFn } from '@tanstack/react-start'
import { db } from '../db'
import { shopSettings } from '../db/schema'

const SINGLETON_ID = 'singleton'

/**
 * Get shop settings, inserting defaults if the row doesn't exist yet.
 */
export const getSettingsFn = createServerFn({ method: 'GET' }).handler(async () => {
  const rows = await db.select().from(shopSettings).limit(1)

  if (rows.length > 0) return rows[0]

  // First-time: seed defaults
  const [created] = await db
    .insert(shopSettings)
    .values({ id: SINGLETON_ID })
    .returning()

  return created
})

/**
 * Save shop settings (upsert on the singleton row).
 */
export const saveSettingsFn = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      shopName: string
      shopTagline?: string
      fromEmail?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const [row] = await db
      .insert(shopSettings)
      .values({
        id: SINGLETON_ID,
        shopName: data.shopName,
        shopTagline: data.shopTagline || null,
        fromEmail: data.fromEmail || null,
      })
      .onConflictDoUpdate({
        target: shopSettings.id,
        set: {
          shopName: data.shopName,
          shopTagline: data.shopTagline || null,
          fromEmail: data.fromEmail || null,
        },
      })
      .returning()

    return row
  })
