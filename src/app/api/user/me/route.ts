import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateUser } from '@/lib/db/users'

export async function GET(): Promise<Response> {
  const { userId } = await auth()

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await getUserByClerkId(userId)

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 })
    }

    return Response.json(user, { status: 200 })
  } catch (err) {
    console.error('[api/user/me] GET error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const user = await getUserByClerkId(userId)
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

    // Only admins may change roles — roles are assigned through the invite flow
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { targetUserId, role } = await request.json()
    if (!targetUserId || !['team_member', 'manager'].includes(role)) {
      return Response.json({ error: 'targetUserId and valid role are required' }, { status: 400 })
    }

    const updated = await updateUser(targetUserId, { role })
    return Response.json(updated)
  } catch (err) {
    console.error('[api/user/me] PATCH error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
