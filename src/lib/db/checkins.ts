import { createServiceClient } from '@/lib/supabase/server'
import type { Checkin, CheckinSharing } from '@/types'

export async function getCheckinsByUser(userId: string, limit = 10): Promise<Checkin[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[db/checkins] getCheckinsByUser error:', error)
    throw new Error(`Failed to fetch checkins for user ${userId}: ${error.message}`)
  }

  return (data ?? []) as Checkin[]
}

export async function getLatestCheckinByUser(userId: string): Promise<Checkin | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[db/checkins] getLatestCheckinByUser error:', error)
    throw new Error(`Failed to fetch latest checkin for user ${userId}: ${error.message}`)
  }

  return data as Checkin | null
}

export async function getCheckinsByCompany(
  companyId: string,
  week?: string
): Promise<(Checkin & { user: { name: string; id: string } })[]> {
  const supabase = await createServiceClient()

  let query = supabase
    .from('checkins')
    .select('*, users!inner(id, name)')
    .eq('users.company_id', companyId)
    .order('created_at', { ascending: false })

  if (week !== undefined) {
    query = query.eq('week', week)
  }

  const { data, error } = await query

  if (error) {
    console.error('[db/checkins] getCheckinsByCompany error:', error)
    throw new Error(`Failed to fetch checkins for company ${companyId}: ${error.message}`)
  }

  return (data ?? []) as (Checkin & { user: { name: string; id: string } })[]
}

export async function createCheckin(
  data: Omit<Checkin, 'id' | 'created_at' | 'approved' | 'approved_at'>
): Promise<Checkin> {
  const supabase = await createServiceClient()

  const { data: created, error } = await supabase
    .from('checkins')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('[db/checkins] createCheckin error:', error)
    throw new Error(`Failed to create checkin: ${error.message}`)
  }

  return created as Checkin
}

export async function updateCheckinSharing(id: string, sharing: CheckinSharing): Promise<Checkin> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('checkins')
    .update({ sharing })
    .eq('id', id)
    .select()
    .single()
  if (error) throw new Error(`Failed to update checkin sharing: ${error.message}`)
  return data as Checkin
}

export async function updateCheckin(id: string, data: Partial<Checkin>): Promise<Checkin> {
  const supabase = await createServiceClient()

  const { data: updated, error } = await supabase
    .from('checkins')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[db/checkins] updateCheckin error:', error)
    throw new Error(`Failed to update checkin ${id}: ${error.message}`)
  }

  return updated as Checkin
}
