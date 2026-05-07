import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateUser } from '@/lib/db/users'
import type { Language } from '@/types'

const VALID_LANGUAGES: Language[] = ['et', 'en']
const VALID_DIRECTNESS = ['direct', 'balanced', 'gentle'] as const

export async function PATCH(req: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const updates: Record<string, unknown> = {}

  if ('language' in body) {
    if (!VALID_LANGUAGES.includes(body.language as Language)) {
      return Response.json({ error: 'Invalid language' }, { status: 422 })
    }
    updates.language = body.language
  }

  if ('support_style' in body) {
    const v = Number(body.support_style)
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      return Response.json({ error: 'support_style must be 1–5' }, { status: 422 })
    }
    updates.support_style = v
  }

  if ('feedback_directness' in body) {
    if (!VALID_DIRECTNESS.includes(body.feedback_directness as typeof VALID_DIRECTNESS[number])) {
      return Response.json({ error: 'Invalid feedback_directness' }, { status: 422 })
    }
    updates.feedback_directness = body.feedback_directness
  }

  if ('vacation_mode' in body) {
    if (typeof body.vacation_mode !== 'boolean') {
      return Response.json({ error: 'vacation_mode must be boolean' }, { status: 422 })
    }
    updates.vacation_mode = body.vacation_mode
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No valid fields to update' }, { status: 422 })
  }

  try {
    const user = await getUserByClerkId(userId)
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    const updated = await updateUser(user.id, updates as Parameters<typeof updateUser>[1])
    return Response.json(updated)
  } catch (err) {
    console.error('[api/user/settings] PATCH error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
