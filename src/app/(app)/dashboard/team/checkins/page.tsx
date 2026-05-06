import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getCheckinsByCompany } from '@/lib/db/checkins'
import { getUsersByCompany } from '@/lib/db/users'
import { HistoryTimeline } from '@/components/dashboard/history-timeline'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

export default async function TeamCheckinsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/dashboard/me')

  const currentWeek = getCurrentWeek()
  const [checkins, teamMembers] = await Promise.all([
    getCheckinsByCompany(user.company_id),
    getUsersByCompany(user.company_id),
  ])

  const checkedInThisWeek = new Set(
    checkins.filter((c) => c.week === currentWeek).map((c) => c.user_id)
  )

  const timelineCheckins = checkins
    .map((c) => ({ ...c, member: { id: c.user.id, name: c.user.name } }))
    .slice(0, 200)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Tiimi sisselogimised</h1>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
            {checkedInThisWeek.size} / {teamMembers.filter((m) => m.id !== user.id).length} logisid sisse selle nädal
          </p>
        </div>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--pz-fg-3)',
            background: 'rgba(96,48,255,0.07)',
            border: '1px solid rgba(96,48,255,0.15)',
            borderRadius: 'var(--pz-radius-pill)',
            padding: '4px 12px',
          }}
        >
          {currentWeek.replace('-', ' ')}
        </span>
      </div>

      {/* This week status */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {teamMembers
          .filter((m) => m.id !== user.id)
          .map((member) => {
            const checkedIn = checkedInThisWeek.has(member.id)
            return (
              <div
                key={member.id}
                className="pz-card"
                style={{
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderLeft: `3px solid ${checkedIn ? 'var(--pz-success)' : 'var(--pz-border)'}`,
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: checkedIn ? 'var(--pz-success-bg)' : 'var(--pz-surface-2)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: checkedIn ? 'var(--pz-success)' : 'var(--pz-fg-4)',
                    flexShrink: 0,
                  }}
                >
                  {member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--pz-fg-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {member.name}
                  </div>
                  <div style={{ fontSize: '11px', color: checkedIn ? 'var(--pz-success)' : 'var(--pz-fg-4)' }}>
                    {checkedIn ? '✓ Logis sisse' : '○ Pole logitud'}
                  </div>
                </div>
              </div>
            )
          })}
      </div>

      {/* Full history */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>Ajalugu</h2>
        <HistoryTimeline checkins={timelineCheckins} />
      </div>
    </div>
  )
}
