import { createServiceClient } from '@/lib/supabase/server'
import type { Goal, GoalLevel, GoalType, GoalStatus } from '@/types'

export interface CreateGoalData {
  company_id: string
  title: string
  level: GoalLevel
  type: GoalType
  status?: GoalStatus
  progress?: number
  owner_id?: string
  contributor_ids?: string[]
  parent_id?: string
  quarter?: string
  year?: number
}

type RawGoal = Omit<Goal, 'contributor_ids'> & {
  goal_contributors: { user_id: string }[]
}

function mapGoal(raw: RawGoal): Goal {
  const { goal_contributors, ...rest } = raw
  return {
    ...rest,
    contributor_ids: (goal_contributors ?? []).map((c: { user_id: string }) => c.user_id),
  }
}

export async function getGoalsByCompany(companyId: string): Promise<Goal[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_contributors(user_id)')
    .eq('company_id', companyId)
    .order('level', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[db/goals] getGoalsByCompany error:', error)
    throw new Error(`Failed to fetch goals for company ${companyId}: ${error.message}`)
  }

  return (data ?? []).map(mapGoal)
}

export async function getGoalsByOwner(ownerId: string): Promise<Goal[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_contributors(user_id)')
    .eq('owner_id', ownerId)
    .order('level', { ascending: false })
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[db/goals] getGoalsByOwner error:', error)
    throw new Error(`Failed to fetch goals for owner ${ownerId}: ${error.message}`)
  }

  return (data ?? []).map(mapGoal)
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('goals')
    .select('*, goal_contributors(user_id)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[db/goals] getGoalById error:', error)
    throw new Error(`Failed to fetch goal ${id}: ${error.message}`)
  }

  return data ? mapGoal(data as RawGoal) : null
}

export async function createGoal(data: CreateGoalData): Promise<Goal> {
  const supabase = await createServiceClient()

  const { contributor_ids, ...insertData } = data

  const { data: created, error } = await supabase
    .from('goals')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('[db/goals] createGoal error:', error)
    throw new Error(`Failed to create goal: ${error.message}`)
  }

  if (contributor_ids && contributor_ids.length > 0) {
    const rows = contributor_ids.map((user_id) => ({ goal_id: created.id, user_id }))
    const { error: contribError } = await supabase.from('goal_contributors').insert(rows)
    if (contribError) {
      console.error('[db/goals] createGoal contributors error:', contribError)
      throw new Error(`Failed to insert goal contributors: ${contribError.message}`)
    }
  }

  const goal = await getGoalById(created.id)
  return goal!
}

export async function updateGoal(
  id: string,
  data: Partial<Goal> & { contributor_ids?: string[] }
): Promise<Goal> {
  const supabase = await createServiceClient()

  const { contributor_ids, id: _id, created_at: _ca, ...fields } = data

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase.from('goals').update(fields).eq('id', id)
    if (error) {
      console.error('[db/goals] updateGoal error:', error)
      throw new Error(`Failed to update goal ${id}: ${error.message}`)
    }
  }

  if (contributor_ids !== undefined) {
    const { error: delError } = await supabase
      .from('goal_contributors')
      .delete()
      .eq('goal_id', id)
    if (delError) {
      console.error('[db/goals] updateGoal delete contributors error:', delError)
      throw new Error(`Failed to delete goal contributors: ${delError.message}`)
    }

    if (contributor_ids.length > 0) {
      const rows = contributor_ids.map((user_id) => ({ goal_id: id, user_id }))
      const { error: insError } = await supabase.from('goal_contributors').insert(rows)
      if (insError) {
        console.error('[db/goals] updateGoal insert contributors error:', insError)
        throw new Error(`Failed to insert goal contributors: ${insError.message}`)
      }
    }
  }

  const goal = await getGoalById(id)
  return goal!
}

export async function deleteGoal(id: string): Promise<void> {
  const supabase = await createServiceClient()

  const { error } = await supabase.from('goals').delete().eq('id', id)

  if (error) {
    console.error('[db/goals] deleteGoal error:', error)
    throw new Error(`Failed to delete goal ${id}: ${error.message}`)
  }
}
