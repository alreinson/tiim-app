import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getUserByClerkId } from '@/lib/db/users'
import { getUsersByCompany } from '@/lib/db/users'
import { getGoalsByCompany } from '@/lib/db/goals'
import { getCheckinsByCompany } from '@/lib/db/checkins'
import { getActiveBlockersByCompany } from '@/lib/db/blockers'
import { getShoutoutsByCompany } from '@/lib/db/shoutouts'
import { TeamMemberCard } from '@/components/dashboard/team-member-card'
import type { SupportType } from '@/types'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function formatWeekLabel(week: string): string {
  return week.replace('-', ' ')
}

function daysSince(dateStr: string): number {
  const diff = Date.now() - new Date(dateStr).getTime()
  return Math.floor(diff / 86400000)
}

function truncate(str: string, len: number): string {
  return str.length > len ? str.slice(0, len) + '…' : str
}

function supportTypeLabel(type: SupportType): string {
  if (type === 'feel_heard') return 'Tahan olla kuuldud'
  if (type === 'want_solution') return 'Tahan lahendust'
  return 'Tahan läbi mõelda'
}

export default async function TeamDashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  if (user.role === 'team_member') redirect('/dashboard/me')

  const currentWeek = getCurrentWeek()

  const [teamMembers, weekCheckins, activeBlockers, recentShoutouts, goals] = await Promise.all([
    getUsersByCompany(user.company_id),
    getCheckinsByCompany(user.company_id, currentWeek),
    getActiveBlockersByCompany(user.company_id),
    getShoutoutsByCompany(user.company_id, 5),
    getGoalsByCompany(user.company_id),
  ])

  const checkedInUserIds = new Set(weekCheckins.map((c) => c.user_id))
  const memberCount = teamMembers.filter((m) => m.id !== user.id).length
  const checkedInCount = teamMembers.filter((m) => m.id !== user.id && checkedInUserIds.has(m.id)).length
  const onTrackGoals = goals.filter((g) => g.status === 'on_track' || g.status === 'done').length

  const statCardStyle: React.CSSProperties = {
    background: 'var(--pz-surface)',
    border: '1px solid var(--pz-border)',
    borderRadius: 'var(--pz-radius-md)',
    boxShadow: 'var(--pz-shadow-sm)',
    padding: '24px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', flexWrap: 'wrap' }}>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 700,
            color: 'var(--pz-fg-1)',
            margin: 0,
          }}
        >
          Meeskonna ülevaade
        </h1>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--pz-fg-3)',
            background: 'rgba(96,48,255,0.07)',
            border: '1px solid rgba(96,48,255,0.15)',
            borderRadius: 'var(--pz-radius-pill)',
            padding: '2px 10px',
          }}
        >
          {formatWeekLabel(currentWeek)}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <div style={statCardStyle}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--pz-fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Sisselogimisi
          </span>
          <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--pz-fg-1)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {checkedInCount}
            <span style={{ fontSize: '20px', fontWeight: 400, color: 'var(--pz-fg-3)' }}> / {memberCount}</span>
          </span>
        </div>

        <div style={statCardStyle}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--pz-fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Aktiivsed takistused
          </span>
          <span
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: activeBlockers.length > 0 ? 'var(--pz-danger)' : 'var(--pz-fg-1)',
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {activeBlockers.length}
          </span>
        </div>

        <div style={statCardStyle}>
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--pz-fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Eesmärke graafikus
          </span>
          <span style={{ fontSize: '36px', fontWeight: 700, color: 'var(--pz-fg-1)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {onTrackGoals}
            <span style={{ fontSize: '20px', fontWeight: 400, color: 'var(--pz-fg-3)' }}> / {goals.length}</span>
          </span>
        </div>
      </div>

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--pz-fg-1)', margin: 0 }}>
          Tiimiliikmed
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '16px',
          }}
        >
          {teamMembers
            .filter((m) => m.id !== user.id)
            .map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                hasCheckedInThisWeek={checkedInUserIds.has(member.id)}
                activeBlockerCount={activeBlockers.filter((b) => b.user_id === member.id).length}
              />
            ))}
        </div>
      </section>

      {activeBlockers.length > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--pz-fg-1)', margin: 0 }}>
              Lahendamist vajavad takistused
            </h2>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#fff',
                background: 'var(--pz-danger)',
                borderRadius: 'var(--pz-radius-pill)',
                padding: '2px 9px',
              }}
            >
              {activeBlockers.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeBlockers.map((blocker) => (
              <div
                key={blocker.id}
                style={{
                  background: 'var(--pz-surface)',
                  border: '1px solid var(--pz-border)',
                  borderRadius: 'var(--pz-radius-md)',
                  boxShadow: 'var(--pz-shadow-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'var(--pz-danger)',
                    marginTop: '5px',
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)' }}>
                      {blocker.user.name}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: 'var(--pz-fg-3)',
                        background: 'rgba(74,85,101,0.08)',
                        border: '1px solid var(--pz-border)',
                        borderRadius: 'var(--pz-radius-pill)',
                        padding: '1px 8px',
                      }}
                    >
                      {supportTypeLabel(blocker.support_type)}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--pz-fg-2)', marginBottom: '6px' }}>
                    {truncate(blocker.summary, 80)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--pz-fg-3)' }}>
                    {daysSince(blocker.created_at) === 0
                      ? 'Täna'
                      : `${daysSince(blocker.created_at)} päeva tagasi`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--pz-fg-1)', margin: 0 }}>
          Viimased tunnustused
        </h2>
        {recentShoutouts.length === 0 ? (
          <div
            style={{
              background: 'var(--pz-surface)',
              border: '1px solid var(--pz-border)',
              borderRadius: 'var(--pz-radius-md)',
              padding: '32px',
              textAlign: 'center',
              color: 'var(--pz-fg-3)',
              fontSize: '14px',
            }}
          >
            Tunnustusi pole veel lisatud.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentShoutouts.map((shoutout) => (
              <div
                key={shoutout.id}
                style={{
                  background: 'var(--pz-surface)',
                  border: '1px solid var(--pz-border)',
                  borderRadius: 'var(--pz-radius-md)',
                  boxShadow: 'var(--pz-shadow-sm)',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  style={{
                    fontSize: '28px',
                    lineHeight: 1,
                    color: 'var(--pz-violet)',
                    opacity: 0.25,
                    flexShrink: 0,
                    marginTop: '-2px',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  &ldquo;
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: 'var(--pz-fg-2)', marginBottom: '8px', lineHeight: 1.5 }}>
                    {shoutout.message}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--pz-fg-3)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--pz-fg-2)' }}>
                      {shoutout.from_user?.name ?? 'Anonüümne'}
                    </span>
                    {' → '}
                    <span style={{ fontWeight: 600, color: 'var(--pz-fg-2)' }}>
                      {shoutout.to_user.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
