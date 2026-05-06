import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { updateNewsItem } from '@/lib/db/news'
import { createServiceClient } from '@/lib/supabase/server'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })
  if (user.role === 'team_member') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { pinned } = await request.json()

  try {
    const supabase = await createServiceClient()
    const { data: existing } = await supabase
      .from('news_items')
      .select('company_id')
      .eq('id', id)
      .maybeSingle()

    if (!existing || existing.company_id !== user.company_id) {
      return Response.json({ error: 'Not found' }, { status: 404 })
    }

    const item = await updateNewsItem(id, { pinned })
    return Response.json(item)
  } catch (err) {
    console.error('[api/news/[id]] PATCH error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
