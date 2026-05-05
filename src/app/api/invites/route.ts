import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { createInvite } from '@/lib/db/invites'
import { headers } from 'next/headers'

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })
  if (!user.company_id) return Response.json({ error: 'Join a company first' }, { status: 400 })

  try {
    const { invitee_role } = await request.json()

    if (!['team_member', 'manager'].includes(invitee_role)) {
      return Response.json({ error: 'invitee_role must be team_member or manager' }, { status: 400 })
    }

    const invite = await createInvite({
      inviter_id: user.id,
      company_id: user.company_id,
      invitee_role,
    })

    const headersList = await headers()
    const host = headersList.get('host') ?? 'tiim.space'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const url = `${protocol}://${host}/invite/${invite.token}`

    return Response.json({ token: invite.token, url }, { status: 201 })
  } catch (err) {
    console.error('[api/invites] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
