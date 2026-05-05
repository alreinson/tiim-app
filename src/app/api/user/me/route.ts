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

    const { role } = await request.json()
    if (!['team_member', 'manager'].includes(role)) {
      return Response.json({ error: 'role must be team_member or manager' }, { status: 400 })
    }

    const updated = await updateUser(user.id, { role })
    return Response.json(updated)
  } catch (err) {
    console.error('[api/user/me] PATCH error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
