import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId, updateUser } from '@/lib/db/users'
import { getInviteByToken, setInviteConnection } from '@/lib/db/invites'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const { token } = await params
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  try {
    const { connected } = await request.json()
    if (typeof connected !== 'boolean') {
      return Response.json({ error: 'connected must be boolean' }, { status: 400 })
    }

    const invite = await getInviteByToken(token)
    if (!invite) return Response.json({ error: 'Invite not found' }, { status: 404 })

    const isInviter = invite.inviter_id === user.id
    const isInvitee = invite.used_by_user_id === user.id

    if (!isInviter && !isInvitee) {
      return Response.json({ error: 'Not your invite' }, { status: 403 })
    }

    await setInviteConnection(token, connected)

    if (connected && invite.used_by_user_id) {
      // Determine who is the manager and who is the team member
      const supabase = await createServiceClient()
      const { data: inviter } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', invite.inviter_id)
        .single()

      const { data: invitee } = await supabase
        .from('users')
        .select('id, role')
        .eq('id', invite.used_by_user_id)
        .single()

      if (inviter && invitee) {
        // Set manager_id on the team_member, pointing to the manager
        if (inviter.role === 'manager' && invitee.role === 'team_member') {
          await updateUser(invitee.id, { manager_id: inviter.id })
        } else if (invitee.role === 'manager' && inviter.role === 'team_member') {
          await updateUser(inviter.id, { manager_id: invitee.id })
        }
      }
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('[api/invites/[token]/connect] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
