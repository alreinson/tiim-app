import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { createBlocker } from '@/lib/db/blockers'

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  try {
    const { summary, support_type } = await request.json()

    if (!summary?.trim() || !support_type) {
      return Response.json({ error: 'summary and support_type are required' }, { status: 400 })
    }

    const blocker = await createBlocker({
      user_id: user.id,
      company_id: user.company_id,
      summary: summary.trim(),
      support_type,
    })

    return Response.json(blocker, { status: 201 })
  } catch (err) {
    console.error('[api/blockers] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
