import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { getGoalsByOwner } from '@/lib/db/goals'
import { getCheckinsByUser } from '@/lib/db/checkins'
import { getBlockersByUser } from '@/lib/db/blockers'
import { getShoutoutsForUser } from '@/lib/db/shoutouts'
import { getUnannouncedAchievements } from '@/lib/db/achievements'
import { getNewsByCompany } from '@/lib/db/news'
import { GoalProgressBar } from '@/components/goals/goal-progress-bar'
import { StatusBadge } from '@/components/goals/status-badge'
import { AchievementBanner } from '@/components/dashboard/achievement-banner'
import { EnergyPulseChart } from '@/components/dashboard/energy-pulse-chart'
import { MessageSquare, Flame, Info } from 'lucide-react'
import type { GoalLevel, GoalType } from '@/types'

function getCurrentWeek(): string {
  const now = new Date()
  const jan1 = new Date(now.getFullYear(), 0, 1)
  const w = Math.ceil(((now.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
  return `${now.getFullYear()}-W${String(w).padStart(2, '0')}`
}

function buildTrendData(checkins: Awaited<ReturnType<typeof getCheckinsByUser>>) {
  const now = new Date()
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (5 - i) * 7)
    const jan1 = new Date(d.getFullYear(), 0, 1)
    const w = Math.ceil(((d.getTime() - jan1.getTime()) / 86400000 + jan1.getDay() + 1) / 7)
    const weekKey = `${d.getFullYear()}-W${String(w).padStart(2, '0')}`
    const c = checkins.find((x) => x.week === weekKey)
    return {
      week: `N${String(w).padStart(2, '0')}`,
      mood:     c?.mood     ?? null,
      energy:   c?.energy   ?? null,
      workload: c?.workload ?? null,
    }
  })
}

const LEVEL_BADGE: Record<GoalLevel, { label: string; color: string }> = {
  yearly:    { label: 'Aastane',     color: '#7C3AED' },
  quarterly: { label: 'Kvartaalne', color: '#2563EB' },
}

const TYPE_BADGE: Record<GoalType, { label: string; color: string }> = {
  work:        { label: 'Töö',   color: '#2563EB' },
  development: { label: 'Areng', color: '#7C3AED' },
}

const SUPPORT_LABELS: Record<string, string> = {
  feel_heard:    'Kuulata',
  want_solution: 'Lahendus',
  think_through: 'Mõelda läbi',
}

function StatCard({
  label, value, tooltip, suffix, icon,
}: {
  label: string; value: number | null; tooltip: string; suffix?: string; icon?: React.ReactNode
}) {
  return (
    <div className="pz-card" style={{ padding: '20px', flex: '1 1 120px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--pz-fg-3)', marginBottom: '8px' }}>
        {label}
        <span title={tooltip} style={{ cursor: 'help', display: 'inline-flex' }}>
          <Info style={{ width: '13px', height: '13px', color: 'var(--pz-fg-4)' }} />
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span className="font-display" style={{ fontSize: '30px', fontWeight: 700, color: 'var(--pz-fg-1)', lineHeight: 1 }}>
          {value ?? '—'}
        </span>
        {icon}
      </div>
      {suffix && (
        <div style={{ fontSize: '11px', color: 'var(--pz-fg-4)', marginTop: '4px' }}>{suffix}</div>
      )}
    </div>
  )
}

export default async function MeDashboardPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const currentWeek = getCurrentWeek()
  const now = new Date()
  const days = ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev']
  const months = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember']
  const dateLabel = `${days[now.getDay()]}, ${now.getDate()}. ${months[now.getMonth()]} ${now.getFullYear()}`

  const [goals, checkins, blockers, shoutouts, unannouncedAchievements] = await Promise.all([
    getGoalsByOwner(user.id),
    getCheckinsByUser(user.id, 10),
    getBlockersByUser(user.id),
    getShoutoutsForUser(user.id, 3),
    getUnannouncedAchievements(user.id),
  ])

  const thisWeekCheckin = checkins.find((c) => c.week === currentWeek) ?? null
  const activeBlockers = blockers.filter((b) => !b.resolved)
  const displayGoals = goals.slice(0, 4)
  const trendData = buildTrendData(checkins)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {unannouncedAchievements.length > 0 && (
        <AchievementBanner achievements={unannouncedAchievements} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--pz-fg-4)', marginBottom: '4px' }}>{dateLabel}</div>
          <h1 style={{ margin: 0 }}>Tere, {user.name.split(' ')[0]}! 👋</h1>
          {!thisWeekCheckin && (
            <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--pz-fg-3)' }}>
              Pole veel sisse loginud. Võtab 5 minutit.
            </p>
          )}
        </div>
        {!thisWeekCheckin && (
          <Link
            href="/chat"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: 'var(--pz-radius-md)',
              background: 'var(--pz-grad-primary)',
              color: '#fff',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
            }}
          >
            <MessageSquare style={{ width: '16px', height: '16px' }} />
            Alusta sisselogimist
          </Link>
        )}
      </div>

      {/* Stat cards */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <StatCard
          label="Meeleolu"
          value={thisWeekCheckin?.mood ?? null}
          tooltip="Enesetunne sel nädalal (1 = halb, 5 = suurepärane). Ise hinnatud iganädalaselt."
          suffix="/ 5"
        />
        <StatCard
          label="Energia"
          value={thisWeekCheckin?.energy ?? null}
          tooltip="Kui virge ja keskendumisvõimeline sa end tundsid — erineb meeleolust."
          suffix="/ 5"
        />
        <StatCard
          label="Töökoormus"
          value={thisWeekCheckin?.workload ?? null}
          tooltip="Tajutud töökoormus, mitte tunnid. 1 = kerge, 5 = üle koormatud."
          suffix="/ 5"
        />
        <StatCard
          label="Streak"
          value={checkins.length}
          tooltip="Järjestikused nädalased sisselogimised. Puhkuserežiimis peatub automaatselt."
          icon={<Flame style={{ width: '20px', height: '20px', color: '#F59E0B' }} />}
          suffix="nädalat"
        />
      </div>

      {/* Charts + Goals row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>
        {/* Energy pulse chart */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Energiapulss · viimased 6 nädalat</h3>
            <span title="Meeleolu, energia ja töökoormus jälgitakse iganädalase vestluse kaudu." style={{ cursor: 'help' }}>
              <Info style={{ width: '14px', height: '14px', color: 'var(--pz-fg-4)' }} />
            </span>
          </div>
          <EnergyPulseChart data={trendData} />
        </div>

        {/* Goals card */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Minu eesmärgid</h3>
            {goals.length > 4 && (
              <Link href="/goals" style={{ fontSize: '12px', color: 'var(--pz-violet)', textDecoration: 'none', fontWeight: 500 }}>
                Kõik →
              </Link>
            )}
          </div>
          {displayGoals.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--pz-fg-3)', margin: 0 }}>Eesmärke ei ole veel lisatud.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayGoals.map((goal) => (
                <div key={goal.id}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--pz-fg-1)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {goal.title}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--pz-fg-4)', flexShrink: 0 }}>{goal.progress}%</span>
                  </div>
                  <GoalProgressBar progress={goal.progress} />
                  <div style={{ display: 'flex', gap: '4px', marginTop: '5px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 7px', borderRadius: 'var(--pz-radius-pill)', background: `${LEVEL_BADGE[goal.level].color}15`, color: LEVEL_BADGE[goal.level].color }}>
                      {LEVEL_BADGE[goal.level].label}
                    </span>
                    <StatusBadge status={goal.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {goals.length > 0 && (
            <Link href="/goals" style={{ display: 'block', marginTop: '12px', fontSize: '12px', color: 'var(--pz-violet)', textDecoration: 'none', fontWeight: 500 }}>
              Vaata kõiki eesmärke →
            </Link>
          )}
        </div>
      </div>

      {/* Blockers + Achievements + Shoutouts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Blockers */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0 }}>Takistused</h3>
            {activeBlockers.length > 0 && (
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--pz-radius-pill)', background: 'var(--pz-danger-bg)', color: 'var(--pz-danger)', border: '1px solid rgba(231,0,11,0.15)' }}>
                {activeBlockers.length}
              </span>
            )}
          </div>
          {activeBlockers.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--pz-fg-4)', margin: 0 }}>Aktiivseid takistusi ei ole. 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeBlockers.map((b) => (
                <div key={b.id} style={{ padding: '12px', background: 'var(--pz-warning-bg)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--pz-radius-md)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--pz-fg-1)', marginBottom: '4px', lineHeight: 1.4 }}>{b.summary}</div>
                  <div style={{ fontSize: '11px', color: 'var(--pz-fg-4)' }}>{SUPPORT_LABELS[b.support_type]}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0 }}>Saavutused</h3>
            <Link href="/achievements" style={{ fontSize: '12px', color: 'var(--pz-violet)', textDecoration: 'none', fontWeight: 500 }}>Kõik →</Link>
          </div>
          {unannouncedAchievements.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--pz-fg-4)', margin: 0 }}>Jätka sisselogimisi saavutuste teenimiseks.</p>
          ) : (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {unannouncedAchievements.map((a) => (
                <div key={a.id} style={{ padding: '8px 12px', borderRadius: 'var(--pz-radius-pill)', background: 'linear-gradient(135deg,#F4F3FF,#FCE7FB)', border: '1px solid rgba(96,48,255,0.15)', fontSize: '12px', fontWeight: 500, color: 'var(--pz-violet)' }}>
                  🏆 {a.code.replace('_', ' ')}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Shoutouts */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0 }}>Tunnustused</h3>
            <Link href="/chat" style={{ fontSize: '12px', color: 'var(--pz-violet)', textDecoration: 'none', fontWeight: 500 }}>Anna tunnustus →</Link>
          </div>
          {shoutouts.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--pz-fg-4)', margin: 0 }}>Tunnustusi ei ole veel saadud.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shoutouts.map((s) => (
                <div key={s.id} style={{ padding: '12px', background: 'var(--pz-surface-2)', borderRadius: 'var(--pz-radius-md)', fontSize: '13px' }}>
                  <p style={{ margin: '0 0 6px', color: 'var(--pz-fg-1)', fontStyle: 'italic', lineHeight: 1.5 }}>"{s.message}"</p>
                  <p style={{ margin: 0, fontSize: '11px', color: 'var(--pz-fg-4)', fontWeight: 500 }}>
                    — {s.anonymous ? 'Anonüümne' : (s.from_user?.name ?? 'Anonüümne')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* This week's PPP */}
      {thisWeekCheckin && (thisWeekCheckin.progress.length > 0 || thisWeekCheckin.plans.length > 0 || thisWeekCheckin.problems.length > 0) && (
        <section>
          <h2 style={{ margin: '0 0 16px' }}>Selle nädala PPP</h2>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {[
              { label: 'Progress', items: thisWeekCheckin.progress, color: '#00B894' },
              { label: 'Plaanid', items: thisWeekCheckin.plans, color: 'var(--pz-violet)' },
              { label: 'Probleemid', items: thisWeekCheckin.problems, color: 'var(--pz-danger)' },
            ].map(({ label, items, color }) => items.length > 0 && (
              <div key={label} className="pz-card" style={{ flex: '1 1 200px', padding: '16px' }}>
                <p style={{ margin: '0 0 10px', fontSize: '11px', fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                <ul style={{ margin: 0, paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {items.map((item, i) => (
                    <li key={i} style={{ fontSize: '13px', color: 'var(--pz-fg-1)', lineHeight: 1.4 }}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
