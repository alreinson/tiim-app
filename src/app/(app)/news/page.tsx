import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getNewsByCompany } from '@/lib/db/news'
import { AnnouncementsFeed } from '@/components/shared/announcements-feed'

export default async function NewsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const newsItems = await getNewsByCompany(user.company_id)
  const isManager = user.role === 'manager' || user.role === 'admin'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Tiimi uudised
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          Uuendused juhilt ja tiimilt.
        </p>
      </div>
      <AnnouncementsFeed initialItems={newsItems} canPin={isManager} />
    </div>
  )
}
