import { auth } from '@clerk/nextjs/server'
import { markAchievementsAnnounced } from '@/lib/db/achievements'

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { ids } = await request.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'ids array is required' }, { status: 400 })
    }

    await markAchievementsAnnounced(ids)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('[api/achievements/announce] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
