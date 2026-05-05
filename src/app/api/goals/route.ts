import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { createGoal } from '@/lib/db/goals'

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  try {
    const { title, level, type, status, parent_id, quarter, year } = await request.json()

    if (!title?.trim() || !level || !type) {
      return Response.json({ error: 'title, level, and type are required' }, { status: 400 })
    }

    const goal = await createGoal({
      company_id: user.company_id,
      owner_id: user.id,
      title: title.trim(),
      level,
      type,
      status: status ?? 'not_started',
      progress: 0,
      parent_id: parent_id ?? undefined,
      quarter: quarter ?? undefined,
      year: year ?? undefined,
    })

    return Response.json(goal, { status: 201 })
  } catch (err) {
    console.error('[api/goals] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
