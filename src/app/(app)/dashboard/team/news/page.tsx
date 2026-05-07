import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getNewsByCompany } from '@/lib/db/news'
import { getUsersByCompany } from '@/lib/db/users'
import { TeamNewsClient } from './team-news-client'

export default async function TeamNewsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/news')

  const [newsItems, members] = await Promise.all([
    getNewsByCompany(user.company_id),
    getUsersByCompany(user.company_id),
  ])

  return (
    <TeamNewsClient
      initialItems={newsItems}
      user={user}
      members={members.map((m) => ({ id: m.id, name: m.name }))}
    />
  )
}
