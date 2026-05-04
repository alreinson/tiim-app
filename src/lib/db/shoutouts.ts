import { createServiceClient } from '@/lib/supabase/server'
import type { Shoutout } from '@/types'

export async function getShoutoutsByCompany(
  companyId: string,
  limit = 20
): Promise<(Shoutout & { from_user: { name: string } | null; to_user: { name: string } })[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('shoutouts')
    .select('*, from_user:users!from_user_id(name), to_user:users!to_user_id(name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[db/shoutouts] getShoutoutsByCompany error:', error)
    throw new Error(`Failed to fetch shoutouts for company ${companyId}: ${error.message}`)
  }

  return (data ?? []) as (Shoutout & { from_user: { name: string } | null; to_user: { name: string } })[]
}

export async function getShoutoutsForUser(
  toUserId: string,
  limit = 10
): Promise<(Shoutout & { from_user: { name: string } | null })[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('shoutouts')
    .select('*, from_user:users!from_user_id(name)')
    .eq('to_user_id', toUserId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[db/shoutouts] getShoutoutsForUser error:', error)
    throw new Error(`Failed to fetch shoutouts for user ${toUserId}: ${error.message}`)
  }

  return (data ?? []) as (Shoutout & { from_user: { name: string } | null })[]
}

export async function createShoutout(data: Omit<Shoutout, 'id' | 'created_at'>): Promise<Shoutout> {
  const supabase = await createServiceClient()

  const { data: created, error } = await supabase
    .from('shoutouts')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('[db/shoutouts] createShoutout error:', error)
    throw new Error(`Failed to create shoutout: ${error.message}`)
  }

  return created as Shoutout
}
