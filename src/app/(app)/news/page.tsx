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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ margin: 0 }}>{isManager ? 'Uudised ja teadaanded' : 'Tiimi uudised'}</h1>
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
          {isManager
            ? 'Postita uuendusi, jälgi kinnitusi ja halda pinnitud postitusi.'
            : 'Uuendused juhilt ja tiimilt.'}
        </p>
      </div>
      <AnnouncementsFeed initialItems={newsItems} canPin={isManager} />
    </div>
  )
}
