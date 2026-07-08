import { createServerFn } from '@tanstack/react-start'
import { getRequestHeaders } from '@tanstack/react-start/server'
import { auth } from './auth'
import { db } from '../db'
import { user as userTable } from '../db/schema'

/**
 * Server function to get the current session.
 * Uses request headers to extract cookies for Better Auth.
 */
export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    return session
  },
)

/**
 * Server function to check if any users exist in the database.
 * Used to determine whether to show setup (onboarding) or login.
 */
export const getHasUsersFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const existing = await db
      .select({ id: userTable.id })
      .from(userTable)
      .limit(1)

    return existing.length > 0
  },
)
