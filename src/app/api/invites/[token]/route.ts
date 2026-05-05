import { getInviteByToken } from '@/lib/db/invites'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const { token } = await params

  try {
    const invite = await getInviteByToken(token)

    if (!invite) {
      return Response.json({ error: 'Invite not found or expired' }, { status: 404 })
    }

    return Response.json({
      inviter_name: invite.inviter.name,
      invitee_role: invite.invitee_role,
      already_used: invite.used_by_user_id !== null,
      connected: invite.connected,
    })
  } catch (err) {
    console.error('[api/invites/[token]] GET error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
