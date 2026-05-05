import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateUser } from '@/lib/db/users'
import { getInviteByToken, useInvite } from '@/lib/db/invites'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const { token } = await params
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  try {
    const invite = await getInviteByToken(token)

    if (!invite) return Response.json({ error: 'Invite not found' }, { status: 404 })
    if (invite.inviter_id === user.id) {
      return Response.json({ error: 'Cannot use your own invite' }, { status: 400 })
    }
    if (invite.used_by_user_id && invite.used_by_user_id !== user.id) {
      return Response.json({ error: 'Invite already used by someone else' }, { status: 409 })
    }

    await useInvite(token, user.id)

    // Apply company and role from the invite
    await updateUser(user.id, {
      company_id: invite.company_id,
      role: invite.invitee_role,
    })

    return Response.json({ ok: true, invitee_role: invite.invitee_role })
  } catch (err) {
    console.error('[api/invites/[token]/use] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
