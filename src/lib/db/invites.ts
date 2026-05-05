import { createServiceClient } from '@/lib/supabase/server'

export interface Invite {
  id: string
  token: string
  inviter_id: string
  company_id: string
  invitee_role: 'team_member' | 'manager'
  used_by_user_id: string | null
  used_at: string | null
  connected: boolean | null
  created_at: string
}

export interface InviteWithUsers extends Invite {
  inviter: { id: string; name: string; company_id: string }
  invitee: { id: string; name: string; email: string } | null
}

export async function createInvite(data: {
  inviter_id: string
  company_id: string
  invitee_role: 'team_member' | 'manager'
}): Promise<Invite> {
  const supabase = await createServiceClient()
  const token = crypto.randomUUID().replace(/-/g, '')

  const { data: created, error } = await supabase
    .from('invites')
    .insert({ ...data, token })
    .select()
    .single()

  if (error) throw new Error(`Failed to create invite: ${error.message}`)
  return created as Invite
}

export async function getInviteByToken(token: string): Promise<InviteWithUsers | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('invites')
    .select('*, inviter:users!invites_inviter_id_fkey(id, name, company_id), invitee:users!invites_used_by_user_id_fkey(id, name, email)')
    .eq('token', token)
    .maybeSingle()

  if (error) throw new Error(`Failed to get invite: ${error.message}`)
  return data as InviteWithUsers | null
}

export async function useInvite(
  token: string,
  userId: string
): Promise<Invite> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('invites')
    .update({ used_by_user_id: userId, used_at: new Date().toISOString() })
    .eq('token', token)
    .is('used_by_user_id', null)
    .select()
    .single()

  if (error) throw new Error(`Failed to use invite: ${error.message}`)
  return data as Invite
}

export async function setInviteConnection(
  token: string,
  connected: boolean
): Promise<Invite> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('invites')
    .update({ connected })
    .eq('token', token)
    .select()
    .single()

  if (error) throw new Error(`Failed to update invite connection: ${error.message}`)
  return data as Invite
}

export async function getPendingInvitesByInviter(
  inviterId: string
): Promise<InviteWithUsers[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('invites')
    .select('*, inviter:users!invites_inviter_id_fkey(id, name, company_id), invitee:users!invites_used_by_user_id_fkey(id, name, email)')
    .eq('inviter_id', inviterId)
    .not('used_by_user_id', 'is', null)
    .is('connected', null)
    .order('used_at', { ascending: false })

  if (error) throw new Error(`Failed to get pending invites: ${error.message}`)
  return (data ?? []) as InviteWithUsers[]
}

export async function getPendingInviteByInvitee(
  userId: string
): Promise<InviteWithUsers | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('invites')
    .select('*, inviter:users!invites_inviter_id_fkey(id, name, company_id), invitee:users!invites_used_by_user_id_fkey(id, name, email)')
    .eq('used_by_user_id', userId)
    .is('connected', null)
    .maybeSingle()

  if (error) throw new Error(`Failed to get pending invite: ${error.message}`)
  return data as InviteWithUsers | null
}
