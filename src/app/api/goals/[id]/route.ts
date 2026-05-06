import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { updateGoal } from '@/lib/db/goals'

/** PATCH /api/goals/:id — update status and/or progress */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  const { id } = await params
  const { status, progress } = await request.json()

  try {
    const updated = await updateGoal(id, {
      ...(status !== undefined ? { status } : {}),
      ...(progress !== undefined ? { progress } : {}),
    })
    return Response.json(updated)
  } catch (err) {
    console.error('[api/goals/[id]] PATCH error:', err)
    return Response.json({ error: 'Failed to update goal' }, { status: 500 })
  }
}
