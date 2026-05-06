import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getNewsByCompany } from '@/lib/db/news'
import { AnnouncementsFeed } from '@/components/shared/announcements-feed'

export default async function TeamNewsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/news')

  const newsItems = await getNewsByCompany(user.company_id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0 }}>Uudised ja teadaanded</h1>
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
          Postita uuendusi, jälgi kinnitusi ja halda pinnitud postitusi.
        </p>
      </div>
      <AnnouncementsFeed initialItems={newsItems} canPin={true} />
    </div>
  )
}
