import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateUser } from '@/lib/db/users'
import type { Language } from '@/types'

const VALID_LANGUAGES: Language[] = ['et', 'en']

export async function PATCH(req: Request): Promise<Response> {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const language = (body as Record<string, unknown>)?.language as Language | undefined

  if (!language || !VALID_LANGUAGES.includes(language)) {
    return Response.json(
      { error: `language must be one of: ${VALID_LANGUAGES.join(', ')}` },
      { status: 422 },
    )
  }

  try {
    const user = await getUserByClerkId(userId)

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await updateUser(user.id, { language })
    return Response.json(updated, { status: 200 })
  } catch (err) {
    console.error('[api/user/language] PATCH error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
