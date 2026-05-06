import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { createNewsItem } from '@/lib/db/news'

export async function POST(request: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await getUserByClerkId(userId)
  if (!user) return Response.json({ error: 'User not found' }, { status: 404 })
  if (!user.company_id) return Response.json({ error: 'No company' }, { status: 400 })

  const { content } = await request.json()
  if (!content?.trim()) return Response.json({ error: 'content is required' }, { status: 400 })

  try {
    const item = await createNewsItem({
      author_id: user.id,
      company_id: user.company_id,
      content: content.trim(),
      pinned: false,
    })
    return Response.json(item, { status: 201 })
  } catch (err) {
    console.error('[api/news] POST error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
