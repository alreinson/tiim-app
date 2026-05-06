import { cache } from 'react'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import type { User } from '@/types'

// Deduplicates auth() + DB lookup across all server components in a single request.
// Without this, each page + layout independently hits Clerk and Supabase.
export const getUser = cache(async (): Promise<User | null> => {
  const { userId } = await auth()
  if (!userId) return null
  return getUserByClerkId(userId)
})
