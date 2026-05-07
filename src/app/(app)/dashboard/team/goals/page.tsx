import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getGoalsByCompany } from '@/lib/db/goals'
import { getWorkItemsByCompany } from '@/lib/db/work-items'
import { getUsersByCompany } from '@/lib/db/users'
import { TeamGoalsClient } from './team-goals-client'

export default async function TeamGoalsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/goals')

  const [goals, workItems, members] = await Promise.all([
    getGoalsByCompany(user.company_id),
    getWorkItemsByCompany(user.company_id),
    getUsersByCompany(user.company_id),
  ])

  const userMap: Record<string, string> = {}
  for (const m of members) userMap[m.id] = m.name

  const onTrack = goals.filter((g) => g.status === 'on_track' || g.status === 'done').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Tiimi eesmärgid
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          Sirvi kõiki eesmärke või keskendu ühe tiimiliikme panusele. {onTrack}/{goals.length} graafikus.
        </p>
      </div>

      <TeamGoalsClient
        goals={goals}
        workItems={workItems}
        members={members.map((m) => ({ id: m.id, name: m.name }))}
        userMap={userMap}
      />
    </div>
  )
}
