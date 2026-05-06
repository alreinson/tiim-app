import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { getGoalsByOwner } from '@/lib/db/goals'
import { getCheckinsByUser } from '@/lib/db/checkins'
import { getBlockersByUser } from '@/lib/db/blockers'
import { getShoutoutsForUser } from '@/lib/db/shoutouts'
import { getUnannouncedAchievements } from '@/lib/db/achievements'
import { StatCard } from '@/components/dashboard/stat-card'
import { GoalProgressBar } from '@/components/goals/goal-progress-bar'
import { StatusBadge } from '@/components/goals/status-badge'
import { AchievementBanner } from '@/components/dashboard/achievement-banner'
import type { GoalLevel, GoalType } from '@/types'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(week).padStart(2, '0')}`
}

function getCurrentWeekLabel(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const week = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `Nädal ${week}, ${now.getFullYear()}`
}

const LEVEL_BADGE: Record<GoalLevel, { label: string; color: string; bg: string }> = {
  yearly:    { label: 'Aastane',     color: '#7C3AED', bg: '#7C3AED18' },
  quarterly: { label: 'Kvartaalne', color: '#2563EB', bg: '#2563EB18' },
}

const TYPE_BADGE: Record<GoalType, { label: string; color: string; bg: string }> = {
  work:        { label: 'Töö',       color: '#2563EB', bg: '#2563EB18' },
  development: { label: 'Areng',     color: '#7C3AED', bg: '#7C3AED18' },
}

const SUPPORT_TYPE_LABELS: Record<string, string> = {
  feel_heard:    'Kuulata',
  want_solution: 'Lahendus',
  think_through: 'Mõelda läbi',
}

export default async function MeDashboardPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const currentWeek = getCurrentWeek()

  const [goals, checkins, blockers, shoutouts, unannouncedAchievements] = await Promise.all([
    getGoalsByOwner(user.id),
    getCheckinsByUser(user.id, 5),
    getBlockersByUser(user.id),
    getShoutoutsForUser(user.id, 3),
    getUnannouncedAchievements(user.id),
  ])

  const thisWeekCheckin = checkins.find((c) => c.week === currentWeek) ?? null
  const activeBlockers = blockers.filter((b) => !b.resolved)
  const displayGoals = goals.slice(0, 5)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-8)' }}>
      {/* DEV: view toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 'var(--pz-radius-pill)', alignSelf: 'flex-start' }}>
        <span style={{ fontSize: '12px', color: '#92400E', fontWeight: 500 }}>Vaatad: tiimiliige</span>
        <Link href="/dashboard/team" style={{ fontSize: '12px', color: '#6030FF', fontWeight: 600, textDecoration: 'none' }}>→ Vaata juhi vaadet</Link>
      </div>

      {/* Achievement banners */}
      {unannouncedAchievements.length > 0 && (
        <AchievementBanner achievements={unannouncedAchievements} />
      )}

      {/* Page header */}
      <div>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--pz-fg-1)',
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          Tere, {user.name}!
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--pz-fg-3)' }}>
          {getCurrentWeekLabel()}
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 'var(--pz-s-4)', flexWrap: 'wrap' }}>
        <StatCard
          label="Meeleolu"
          value={thisWeekCheckin?.mood ?? null}
          accentColor="var(--pz-violet)"
          icon="😊"
        />
        <StatCard
          label="Energia"
          value={thisWeekCheckin?.energy ?? null}
          accentColor="var(--pz-sky)"
          icon="⚡"
        />
        <StatCard
          label="Töökoormus"
          value={thisWeekCheckin?.workload ?? null}
          accentColor="var(--pz-warning)"
          icon="📊"
        />
      </div>

      {/* Check-in CTA */}
      {!thisWeekCheckin && (
        <div
          style={{
            background: 'var(--pz-grad-primary)',
            borderRadius: 'var(--pz-radius-md)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--pz-s-4)',
            flexWrap: 'wrap',
          }}
        >
          <p style={{ margin: 0, color: '#fff', fontWeight: 600, fontSize: '16px' }}>
            Nädalane sisselogimine ootab
          </p>
          <Link
            href="/checkins/new"
            style={{
              display: 'inline-block',
              padding: '8px 20px',
              border: '1.5px solid rgba(255,255,255,0.8)',
              borderRadius: 'var(--pz-radius-pill)',
              color: '#fff',
              fontWeight: 500,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'background var(--pz-dur-base)',
              background: 'rgba(255,255,255,0.12)',
            }}
          >
            Alusta sisselogimist
          </Link>
        </div>
      )}

      {/* My Goals */}
      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--pz-s-4)',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
            Minu eesmärgid
          </h2>
          {goals.length > 5 && (
            <Link
              href="/goals"
              style={{ fontSize: '14px', color: 'var(--pz-violet)', textDecoration: 'none', fontWeight: 500 }}
            >
              Vaata kõiki →
            </Link>
          )}
        </div>

        {displayGoals.length === 0 ? (
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>Eesmärke ei ole veel lisatud.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-3)' }}>
            {displayGoals.map((goal) => {
              const levelCfg = LEVEL_BADGE[goal.level]
              const typeCfg = TYPE_BADGE[goal.type]
              return (
                <div
                  key={goal.id}
                  style={{
                    background: 'var(--pz-surface)',
                    border: '1px solid var(--pz-border)',
                    borderRadius: 'var(--pz-radius-md)',
                    boxShadow: 'var(--pz-shadow-sm)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--pz-fg-1)', fontSize: '15px', flex: 1 }}>
                      {goal.title}
                    </p>
                    <StatusBadge status={goal.status} />
                  </div>

                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 'var(--pz-radius-pill)',
                        background: levelCfg.bg,
                        color: levelCfg.color,
                        border: `1px solid ${levelCfg.color}40`,
                      }}
                    >
                      {levelCfg.label}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        padding: '2px 8px',
                        borderRadius: 'var(--pz-radius-pill)',
                        background: typeCfg.bg,
                        color: typeCfg.color,
                        border: `1px solid ${typeCfg.color}40`,
                      }}
                    >
                      {typeCfg.label}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <GoalProgressBar progress={goal.progress} />
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--pz-fg-3)', whiteSpace: 'nowrap', minWidth: '36px', textAlign: 'right' }}>
                      {goal.progress}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {goals.length > 0 && goals.length <= 5 && (
          <div style={{ marginTop: 'var(--pz-s-3)' }}>
            <Link
              href="/goals"
              style={{ fontSize: '14px', color: 'var(--pz-violet)', textDecoration: 'none', fontWeight: 500 }}
            >
              Vaata kõiki →
            </Link>
          </div>
        )}
      </section>

      {/* Active Blockers */}
      <section>
        <h2
          style={{
            margin: '0 0 var(--pz-s-4)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--pz-fg-1)',
          }}
        >
          Takistused
        </h2>

        {activeBlockers.length === 0 ? (
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>Aktiivseid takistusi ei ole.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-3)' }}>
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
                  justifyContent: 'space-between',
                  gap: '12px',
                }}
              >
                <p style={{ margin: 0, color: 'var(--pz-fg-1)', fontSize: '14px', flex: 1 }}>
                  {blocker.summary}
                </p>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 'var(--pz-radius-pill)',
                    background: '#F59E0B18',
                    color: '#F59E0B',
                    border: '1px solid #F59E0B40',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  {SUPPORT_TYPE_LABELS[blocker.support_type] ?? blocker.support_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Shoutouts */}
      <section>
        <h2
          style={{
            margin: '0 0 var(--pz-s-4)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--pz-fg-1)',
          }}
        >
          Tunnustused
        </h2>

        {shoutouts.length === 0 ? (
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px' }}>Tunnustusi ei ole veel saadud.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-3)' }}>
            {shoutouts.map((shoutout) => (
              <div
                key={shoutout.id}
                style={{
                  background: 'var(--pz-surface)',
                  border: '1px solid var(--pz-border)',
                  borderLeft: '3px solid var(--pz-violet)',
                  borderRadius: 'var(--pz-radius-md)',
                  boxShadow: 'var(--pz-shadow-sm)',
                  padding: '16px 20px',
                }}
              >
                <p
                  style={{
                    margin: '0 0 8px',
                    color: 'var(--pz-fg-1)',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    lineHeight: 1.6,
                  }}
                >
                  &ldquo;{shoutout.message}&rdquo;
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--pz-fg-3)', fontWeight: 500 }}>
                  — {shoutout.anonymous ? 'Anonüümne' : (shoutout.from_user?.name ?? 'Anonüümne')}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
