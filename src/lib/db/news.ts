import { createServiceClient } from '@/lib/supabase/server'
import type { NewsItem } from '@/types'

export async function getNewsByCompany(
  companyId: string,
  limit = 20
): Promise<(NewsItem & { author: { name: string } })[]> {
  const supabase = await createServiceClient()

  const { data, error } = await supabase
    .from('news_items')
    .select('*, author:users!author_id(name)')
    .eq('company_id', companyId)
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[db/news] getNewsByCompany error:', error)
    throw new Error(`Failed to fetch news for company ${companyId}: ${error.message}`)
  }

  return (data ?? []) as (NewsItem & { author: { name: string } })[]
}

export async function createNewsItem(data: Omit<NewsItem, 'id' | 'created_at'>): Promise<NewsItem> {
  const supabase = await createServiceClient()

  const { data: created, error } = await supabase
    .from('news_items')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('[db/news] createNewsItem error:', error)
    throw new Error(`Failed to create news item: ${error.message}`)
  }

  return created as NewsItem
}

export async function updateNewsItem(id: string, data: Partial<NewsItem>): Promise<NewsItem> {
  const supabase = await createServiceClient()

  const { data: updated, error } = await supabase
    .from('news_items')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('[db/news] updateNewsItem error:', error)
    throw new Error(`Failed to update news item ${id}: ${error.message}`)
  }

  return updated as NewsItem
}
