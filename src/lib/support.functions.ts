import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { db } from '../db'
import { supportChat, supportMessage } from '../db/schema'
import { desc, eq } from 'drizzle-orm'
import { auth } from './auth'

/**
 * Helper to assert admin session.
 */
async function requireAdmin() {
  const headers = getRequestHeaders()
  const session = await auth.api.getSession({ headers })
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

/**
 * Find or create a support chat session for a given visitorId.
 */
export const getOrCreateSupportChatFn = createServerFn({ method: 'POST' })
  .validator((data: { visitorId: string; customerEmail?: string }) => data)
  .handler(async ({ data }) => {
    // Look for an open chat first
    const existing = await db
      .select()
      .from(supportChat)
      .where(eq(supportChat.visitorId, data.visitorId))
      .orderBy(desc(supportChat.createdAt))
      .limit(1)

    if (existing.length > 0 && existing[0].status === 'open') {
      // Update email if provided now and not already set
      if (data.customerEmail && !existing[0].customerEmail) {
        const [updated] = await db
          .update(supportChat)
          .set({ customerEmail: data.customerEmail })
          .where(eq(supportChat.id, existing[0].id))
          .returning()
        return updated
      }
      return existing[0]
    }

    // Otherwise create a new chat session
    const [created] = await db
      .insert(supportChat)
      .values({
        visitorId: data.visitorId,
        customerEmail: data.customerEmail || null,
        status: 'open',
      })
      .returning()

    return created
  })

/**
 * Fetch all messages for a support chat.
 */
export const getChatMessagesFn = createServerFn({ method: 'GET' })
  .validator((data: { chatId: string }) => data)
  .handler(async ({ data }) => {
    const messages = await db
      .select()
      .from(supportMessage)
      .where(eq(supportMessage.chatId, data.chatId))
      .orderBy(supportMessage.createdAt)

    return messages
  })

/**
 * Send a message in a chat session.
 */
export const sendSupportMessageFn = createServerFn({ method: 'POST' })
  .validator(
    (data: { chatId: string; sender: 'customer' | 'agent'; content: string }) =>
      data,
  )
  .handler(async ({ data }) => {
    // If agent is sending, verify authorization
    if (data.sender === 'agent') {
      await requireAdmin()
    }

    const [msg] = await db
      .insert(supportMessage)
      .values({
        chatId: data.chatId,
        sender: data.sender,
        content: data.content,
      })
      .returning()

    // Touch supportChat's updatedAt
    await db
      .update(supportChat)
      .set({ updatedAt: new Date() })
      .where(eq(supportChat.id, data.chatId))

    return msg
  })

/**
 * List all support chats (admin only).
 */
export const listAllChatsFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requireAdmin()

    const chats = await db
      .select()
      .from(supportChat)
      .orderBy(desc(supportChat.updatedAt))

    return chats
  },
)

/**
 * Close/resolve a support chat (admin only).
 */
export const closeSupportChatFn = createServerFn({ method: 'POST' })
  .validator((data: { chatId: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin()

    const [updated] = await db
      .update(supportChat)
      .set({ status: 'closed', updatedAt: new Date() })
      .where(eq(supportChat.id, data.chatId))
      .returning()

    return updated
  })
