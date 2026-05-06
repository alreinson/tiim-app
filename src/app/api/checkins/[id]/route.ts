import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { updateCheckin } from '@/lib/db/checkins'
import { createServiceClient } from '@/lib/supabase/server'
import type { GoalProposal } from '@/types'

/** PATCH /api/checkins/:id — dismiss one proposal by goal_id */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })

  const { id } = await params
  const { dismiss_goal_id } = await request.json()

  const supabase = await createServiceClient()
  const { data: checkin, error } = await supabase
    .from('checkins')
    .select('pending_ai_actions, user_id')
    .eq('id', id)
    .single()

  if (error || !checkin) return Response.json({ error: 'Not found' }, { status: 404 })
  if (checkin.user_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 })

  const current: GoalProposal[] = checkin.pending_ai_actions ?? []
  const updated = current.filter((p) => p.goal_id !== dismiss_goal_id)

  await updateCheckin(id, { pending_ai_actions: updated })
  return Response.json({ ok: true })
}
