import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { getUsersByCompany } from '@/lib/db/users'
import { getGoalsByCompany } from '@/lib/db/goals'
import { getCheckinsByCompany, getCheckinsByUser } from '@/lib/db/checkins'
import { getActiveBlockersByCompany } from '@/lib/db/blockers'
import { getShoutoutsByCompany } from '@/lib/db/shoutouts'
import { getNewsByCompany } from '@/lib/db/news'
import { TeamMemberCard } from '@/components/dashboard/team-member-card'
import { AnnouncementsFeed } from '@/components/shared/announcements-feed'
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
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const currentWeek = getCurrentWeek()

  const [teamMembers, weekCheckins, activeBlockers, recentShoutouts, goals, myCheckins, newsItems] = await Promise.all([
    getUsersByCompany(user.company_id),
    getCheckinsByCompany(user.company_id, currentWeek),
    getActiveBlockersByCompany(user.company_id),
    getShoutoutsByCompany(user.company_id, 5),
    getGoalsByCompany(user.company_id),
    getCheckinsByUser(user.id, 1),
    getNewsByCompany(user.company_id),
  ])

  const myThisWeekCheckin = myCheckins[0]?.week === currentWeek ? myCheckins[0] : null

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
      {/* DEV: view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 'var(--pz-radius-pill)', alignSelf: 'flex-start' }}>
        <span style={{ fontSize: '12px', color: '#166534', fontWeight: 500 }}>Vaatad: juhi vaade</span>
        <Link href="/dashboard/me" style={{ fontSize: '12px', color: '#6030FF', fontWeight: 600, textDecoration: 'none' }}>→ Vaata tiimiliikme vaadet</Link>
      </div>

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

      {/* Manager's own PPP this week */}
      {myThisWeekCheckin && (myThisWeekCheckin.progress.length > 0 || myThisWeekCheckin.plans.length > 0 || myThisWeekCheckin.problems.length > 0) && (
        <section>
          <h2 style={{ margin: '0 0 var(--pz-s-4)', fontSize: '18px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
            Minu PPP selle nädal
          </h2>
          <div style={{ display: 'flex', gap: 'var(--pz-s-4)', flexWrap: 'wrap' }}>
            {[
              { label: 'Progress', items: myThisWeekCheckin.progress, color: '#00B894' },
              { label: 'Plaanid', items: myThisWeekCheckin.plans, color: 'var(--pz-violet)' },
              { label: 'Probleemid', items: myThisWeekCheckin.problems, color: 'var(--pz-danger)' },
            ].map(({ label, items, color }) => items.length > 0 && (
              <div
                key={label}
                style={{
                  flex: '1 1 200px', background: 'var(--pz-surface)',
                  border: '1px solid var(--pz-border)', borderRadius: 'var(--pz-radius-md)',
                  boxShadow: 'var(--pz-shadow-sm)', padding: '16px',
                }}
              >
                <p style={{ margin: '0 0 10px', fontSize: '12px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--pz-fg-1)', lineHeight: 1.4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {!myThisWeekCheckin && (
            <Link
              href="/chat"
              style={{ display: 'inline-block', marginTop: '8px', fontSize: '14px', color: 'var(--pz-violet)', fontWeight: 500, textDecoration: 'none' }}
            >
              Lisa oma PPP →
            </Link>
          )}
        </section>
      )}

      {/* Team members' shared PPP */}
      {weekCheckins.some((c) => c.user_id !== user.id && (c.progress.length > 0 || c.plans.length > 0 || c.problems.length > 0)) && (
        <section>
          <h2 style={{ margin: '0 0 var(--pz-s-4)', fontSize: '18px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
            Tiimi PPP selle nädal
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weekCheckins
              .filter((c) => c.user_id !== user.id)
              .map((checkin) => {
                const member = teamMembers.find((m) => m.id === checkin.user_id)
                if (!member) return null
                const sharing = checkin.sharing ?? {}
                const sharedProgress = (sharing.progress ?? checkin.progress.map((_: string, i: number) => i)).map((i: number) => checkin.progress[i]).filter(Boolean)
                const sharedPlans = (sharing.plans ?? checkin.plans.map((_: string, i: number) => i)).map((i: number) => checkin.plans[i]).filter(Boolean)
                const sharedProblems = (sharing.problems ?? checkin.problems.map((_: string, i: number) => i)).map((i: number) => checkin.problems[i]).filter(Boolean)
                if (!sharedProgress.length && !sharedPlans.length && !sharedProblems.length) return null
                return (
                  <div key={checkin.id} style={{ background: 'var(--pz-surface)', border: '1px solid var(--pz-border)', borderRadius: 'var(--pz-radius-md)', padding: '16px', boxShadow: 'var(--pz-shadow-sm)' }}>
                    <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)' }}>{member.name}</p>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {[
                        { label: 'Progress', items: sharedProgress, color: '#00B894' },
                        { label: 'Plaanid', items: sharedPlans, color: 'var(--pz-violet)' },
                        { label: 'Probleemid', items: sharedProblems, color: 'var(--pz-danger)' },
                      ].map(({ label, items, color }) => items.length > 0 && (
                        <div key={label} style={{ flex: '1 1 140px' }}>
                          <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                          <ul style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {items.map((item: string, i: number) => (
                              <li key={i} style={{ fontSize: '12px', color: 'var(--pz-fg-2)', lineHeight: 1.4 }}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
          </div>
        </section>
      )}

      {/* Announcements */}
      <AnnouncementsFeed initialItems={newsItems} canPin={true} />
    </div>
  )
}
