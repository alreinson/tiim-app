import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { updateNewsItem } from '@/lib/db/news'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })
  if (user.role === 'team_member') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { pinned } = await request.json()

  try {
    const item = await updateNewsItem(id, { pinned })
    return Response.json(item)
  } catch (err) {
    console.error('[api/news/[id]] PATCH error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
