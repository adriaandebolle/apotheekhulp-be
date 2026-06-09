import { cookies } from 'next/headers'
import { IMPERSONATION_COOKIE, type Impersonation } from './impersonation-types'

/**
 * Returns the assistent user ID to query against.
 * When an admin is impersonating, returns the impersonated user's ID instead of the admin's.
 */
export async function getEffectiveUserId(authUserId: string): Promise<string> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(IMPERSONATION_COOKIE)?.value
  if (!raw) return authUserId
  try {
    const imp = JSON.parse(raw) as Impersonation
    return imp.userId
  } catch {
    return authUserId
  }
}
