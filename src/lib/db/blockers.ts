import { createServiceClient } from '@/lib/supabase/server'
import type { Blocker } from '@/types'

export async function getBlockersByUser(userId: string): Promise<Blocker[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('blockers')
    .select('*')
    .eq('user_id', userId)
    .order('resolved', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[db/blockers] getBlockersByUser error:', error)
    throw new Error(`Failed to fetch blockers for user ${userId}: ${error.message}`)
  }

  return (data ?? []) as Blocker[]
}

export async function getActiveBlockersByCompany(
  companyId: string
): Promise<(Blocker & { user: { name: string; id: string } })[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('blockers')
    .select('*, users!inner(id, name)')
    .eq('company_id', companyId)
    .eq('resolved', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[db/blockers] getActiveBlockersByCompany error:', error)
    throw new Error(`Failed to fetch active blockers for company ${companyId}: ${error.message}`)
  }

  return (data ?? []) as (Blocker & { user: { name: string; id: string } })[]
}

export async function createBlocker(
  data: Omit<Blocker, 'id' | 'created_at' | 'resolved' | 'resolved_at'>
): Promise<Blocker> {
  const supabase = await createServiceClient()

  const { data: created, error } = await supabase
    .from('blockers')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('[db/blockers] createBlocker error:', error)
    throw new Error(`Failed to create blocker: ${error.message}`)
  }

  return created as Blocker
}

export async function getResolvedBlockerUserIdsByCompany(companyId: string): Promise<string[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('blockers')
    .select('user_id')
    .eq('company_id', companyId)
    .eq('resolved', true)
  if (error) throw new Error(`Failed to fetch resolved blockers: ${error.message}`)
  return [...new Set((data ?? []).map((r: { user_id: string }) => r.user_id))]
}

export async function getAllBlockersByCompany(
  companyId: string
): Promise<(Blocker & { user: { name: string; id: string } })[]> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('blockers')
    .select('*, users!inner(id, name)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(`Failed to fetch all blockers for company ${companyId}: ${error.message}`)
  return (data ?? []) as (Blocker & { user: { name: string; id: string } })[]
}

export async function updateBlocker(id: string, data: Partial<Blocker>): Promise<Blocker> {
  const supabase = await createServiceClient()

  const { data: updated, error } = await supabase
    .from('blockers')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[db/blockers] updateBlocker error:', error)
    throw new Error(`Failed to update blocker ${id}: ${error.message}`)
  }

  return updated as Blocker
}
