import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { markAchievementsAnnounced } from '@/lib/db/achievements'

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await getUserByClerkId(userId)
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'ids array is required' }, { status: 400 })
    }

    await markAchievementsAnnounced(ids, user.id)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[api/achievements/announce] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
