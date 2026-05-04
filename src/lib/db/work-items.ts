import { createServiceClient } from '@/lib/supabase/server'
import type { WorkItem, WorkItemType, WorkItemStatus } from '@/types'

export interface CreateWorkItemData {
  company_id: string
  title: string
  type: WorkItemType
  owner_id?: string
  goal_ids?: string[]
  status?: WorkItemStatus
}

type RawWorkItem = Omit<WorkItem, 'goal_ids'> & {
  work_item_goals: { goal_id: string }[]
}

function mapWorkItem(raw: RawWorkItem): WorkItem {
  const { work_item_goals, ...rest } = raw
  return {
    ...rest,
    goal_ids: (work_item_goals ?? []).map((g: { goal_id: string }) => g.goal_id),
  }
}

export async function getWorkItemsByCompany(companyId: string): Promise<WorkItem[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('work_items')
    .select('*, work_item_goals(goal_id)')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[db/work-items] getWorkItemsByCompany error:', error)
    throw new Error(`Failed to fetch work items for company ${companyId}: ${error.message}`)
  }

  return (data ?? []).map(mapWorkItem)
}

export async function getWorkItemsByOwner(ownerId: string): Promise<WorkItem[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('work_items')
    .select('*, work_item_goals(goal_id)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[db/work-items] getWorkItemsByOwner error:', error)
    throw new Error(`Failed to fetch work items for owner ${ownerId}: ${error.message}`)
  }

  return (data ?? []).map(mapWorkItem)
}

async function getWorkItemById(id: string): Promise<WorkItem | null> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('work_items')
    .select('*, work_item_goals(goal_id)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[db/work-items] getWorkItemById error:', error)
    throw new Error(`Failed to fetch work item ${id}: ${error.message}`)
  }

  return data ? mapWorkItem(data as RawWorkItem) : null
}

export async function createWorkItem(data: CreateWorkItemData): Promise<WorkItem> {
  const supabase = await createServiceClient()

  const { goal_ids, ...insertData } = data

  const { data: created, error } = await supabase
    .from('work_items')
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error('[db/work-items] createWorkItem error:', error)
    throw new Error(`Failed to create work item: ${error.message}`)
  }

  if (goal_ids && goal_ids.length > 0) {
    const rows = goal_ids.map((goal_id) => ({ work_item_id: created.id, goal_id }))
    const { error: linkError } = await supabase.from('work_item_goals').insert(rows)
    if (linkError) {
      console.error('[db/work-items] createWorkItem goal links error:', linkError)
      throw new Error(`Failed to link work item goals: ${linkError.message}`)
    }
  }

  const item = await getWorkItemById(created.id)
  return item!
}

export async function updateWorkItem(
  id: string,
  data: Partial<WorkItem> & { goal_ids?: string[] }
): Promise<WorkItem> {
  const supabase = await createServiceClient()

  const { goal_ids, id: _id, created_at: _ca, updated_at: _ua, ...fields } = data

  if (Object.keys(fields).length > 0) {
    const { error } = await supabase.from('work_items').update(fields).eq('id', id)
    if (error) {
      console.error('[db/work-items] updateWorkItem error:', error)
      throw new Error(`Failed to update work item ${id}: ${error.message}`)
    }
  }

  if (goal_ids !== undefined) {
    const { error: delError } = await supabase
      .from('work_item_goals')
      .delete()
      .eq('work_item_id', id)
    if (delError) {
      console.error('[db/work-items] updateWorkItem delete goal links error:', delError)
      throw new Error(`Failed to delete work item goal links: ${delError.message}`)
    }

    if (goal_ids.length > 0) {
      const rows = goal_ids.map((goal_id) => ({ work_item_id: id, goal_id }))
      const { error: insError } = await supabase.from('work_item_goals').insert(rows)
      if (insError) {
        console.error('[db/work-items] updateWorkItem insert goal links error:', insError)
        throw new Error(`Failed to insert work item goal links: ${insError.message}`)
      }
    }
  }

  const item = await getWorkItemById(id)
  return item!
}
