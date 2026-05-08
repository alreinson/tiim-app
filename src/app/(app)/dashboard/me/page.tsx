import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { getGoalsByOwner } from '@/lib/db/goals'
import { getCheckinsByUser } from '@/lib/db/checkins'
import { getBlockersByUser } from '@/lib/db/blockers'
import { getShoutoutsByCompany } from '@/lib/db/shoutouts'
import { getWorkItemsByOwner } from '@/lib/db/work-items'
import { getStreaksByUserIds } from '@/lib/db/streaks'
import { GoalProgressBar } from '@/components/goals/goal-progress-bar'
import { EnergyPulseChart } from '@/components/dashboard/energy-pulse-chart'
import { MessageSquare, Flame } from 'lucide-react'
import { FirstCheckinModal } from '@/components/dashboard/first-checkin-modal'
import type { GoalStatus } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

function daysAgoLabel(dateStr: string): string {
  const d = daysSince(dateStr)
  if (d === 0) return 'täna'
  if (d === 1) return '1p tagasi'
  return `${d}p tagasi`
}

// ─── Trend calculation ────────────────────────────────────────────────────────

function computeTrend(
  checkins: Awaited<ReturnType<typeof getCheckinsByUser>>,
  currentWeek: string,
  field: 'mood' | 'energy' | 'workload'
): { delta: string; dir: 'up' | 'down' | 'neutral' } | null {
  const current = checkins.find((c) => c.week === currentWeek)?.[field] ?? null
  if (current === null) return null
  const prev = checkins
    .filter((c) => c.week !== currentWeek)
    .slice(0, 5)
    .map((c) => c[field])
    .filter((v): v is number => v != null)
  if (!prev.length) return null
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length
  const delta = current - avg
  const dir = delta > 0.15 ? 'up' : delta < -0.15 ? 'down' : 'neutral'
  return { delta: Math.abs(delta).toFixed(1), dir }
}

// ─── Status pill ──────────────────────────────────────────────────────────────

const STATUS_CFG: Record<GoalStatus, { label: string; bg: string; color: string }> = {
  on_track:    { label: 'Graafikus',   bg: '#e6f7ec', color: '#00a63e' },
  in_progress: { label: 'Käimas',      bg: '#eef4ff', color: '#1f4fd8' },
  at_risk:     { label: 'Ohus',        bg: '#fef3e2', color: '#f59e0b' },
  done:        { label: 'Valmis',      bg: '#e6f7ec', color: '#00a63e' },
  not_started: { label: 'Alustamata', bg: '#f2f4f7', color: '#667085' },
}

function StatusPill({ status }: { status: GoalStatus }) {
  const cfg = STATUS_CFG[status]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 8px', borderRadius: '9999px',
      background: cfg.bg, color: cfg.color,
      fontSize: '10px', fontWeight: 500, whiteSpace: 'nowrap',
      textTransform: 'capitalize',
    }}>
      {cfg.label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function MeDashboardPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const currentWeek = getCurrentWeek()
  const now = new Date()
  const days = ['Pühapäev', 'Esmaspäev', 'Teisipäev', 'Kolmapäev', 'Neljapäev', 'Reede', 'Laupäev']
  const months = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember']
  const dateLabel = `${days[now.getDay()]}, ${now.getDate()}. ${months[now.getMonth()]} ${now.getFullYear()}`

  const [goals, checkins, blockers, workItems, shoutouts, streakMap] = await Promise.all([
    getGoalsByOwner(user.id),
    getCheckinsByUser(user.id, 10),
    getBlockersByUser(user.id),
    getWorkItemsByOwner(user.id),
    getShoutoutsByCompany(user.company_id, 3),
    getStreaksByUserIds([user.id]),
  ])

  const streak = streakMap[user.id] ?? 0
  const thisWeekCheckin = checkins.find((c) => c.week === currentWeek) ?? null
  const activeBlockers = blockers.filter((b) => !b.resolved)
  const displayGoals = goals.slice(0, 3)
  const trendData = buildTrendData(checkins)
  const tasks = workItems.filter((w) => w.type === 'task').slice(0, 5)

  const recentWins = checkins
    .flatMap((c) => (c.wins ?? []).map((w) => ({ text: w, created_at: c.created_at })))
    .slice(0, 6)

  const moodTrend    = computeTrend(checkins, currentWeek, 'mood')
  const energyTrend  = computeTrend(checkins, currentWeek, 'energy')
  const workloadTrend = computeTrend(checkins, currentWeek, 'workload')

  // ── Main dashboard ─────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {checkins.length === 0 && <FirstCheckinModal userName={user.name} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ fontSize: '13px', color: '#667085', marginBottom: '4px' }}>{dateLabel}</div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
            Tere, {user.name.split(' ')[0]}! 👋
          </h1>
          {!thisWeekCheckin && (
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#4a5565' }}>
              Pole veel sisse loginud. Võtab 5 minutit.
            </p>
          )}
        </div>
        {!thisWeekCheckin && (
          <Link href="/chat" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', borderRadius: '10px',
            background: 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)',
            color: '#fff', fontWeight: 600, fontSize: '15px', textDecoration: 'none',
          }}>
            <MessageSquare style={{ width: '16px', height: '16px' }} />
            Alusta iganädalast sisselogimist
          </Link>
        )}
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        {/* Mood */}
        <StatCard
          label="Meeleolu"
          value={thisWeekCheckin?.mood ?? null}
          trend={moodTrend}
          subtitle="vs 6 eelmine nädal"
          tooltip="Enesetunne sel nädalal (1 = halb, 5 = suurepärane)."
        />
        {/* Energy */}
        <StatCard
          label="Energia"
          value={thisWeekCheckin?.energy ?? null}
          trend={energyTrend}
          subtitle={energyTrend?.dir === 'up' ? 'tõusnud' : energyTrend?.dir === 'down' ? 'langenud' : 'stabiilne'}
          tooltip="Kui virge ja keskendumisvõimeline end tundsid."
        />
        {/* Workload */}
        <StatCard
          label="Töökoormus"
          value={thisWeekCheckin?.workload ?? null}
          trend={workloadTrend}
          subtitle="tervislik tase"
          tooltip="Tajutud töökoormus. 1 = kerge, 5 = üle koormatud."
        />
        {/* Streak */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '13px', color: '#4a5565', marginBottom: '10px' }}>Streak</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: '#101828', lineHeight: 1, letterSpacing: '-0.28px' }}>
              {streak}
            </span>
            <Flame style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
          </div>
          <div style={{ fontSize: '11px', color: '#667085' }}>
            {streak === 1 ? '1 nädal järjest' : `${streak} nädalat järjest`}
          </div>
        </div>
      </div>

      {/* ── Chart + Goals ──────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '14px', alignItems: 'start' }}>
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
              Energiapulss · viimased 6 nädalat
            </h3>
          </div>
          <EnergyPulseChart data={trendData} />
        </div>

        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>Minu eesmärgid</h3>
            {goals.length > 3 && (
              <Link href="/goals" style={{ fontSize: '12px', color: '#6030ff', textDecoration: 'none', fontWeight: 500 }}>Kõik →</Link>
            )}
          </div>
          {displayGoals.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#667085', margin: 0 }}>Eesmärke pole veel lisatud.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayGoals.map((goal) => (
                <div key={goal.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '5px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {goal.title}
                    </span>
                    <span style={{ fontSize: '11px', color: '#667085', flexShrink: 0 }}>{goal.progress}%</span>
                  </div>
                  <GoalProgressBar progress={goal.progress} height={5} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '5px', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', padding: '1px 7px', borderRadius: '9999px', background: '#f4f3ff', color: '#6030ff', textTransform: 'capitalize' }}>
                      {goal.level === 'yearly' ? 'aastane' : 'kvartaalne'}
                    </span>
                    <StatusPill status={goal.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {goals.length > 0 && (
            <Link href="/goals" style={{ display: 'block', marginTop: '14px', fontSize: '12px', color: '#6030ff', textDecoration: 'none', fontWeight: 500 }}>
              Vaata kõiki eesmärke →
            </Link>
          )}
        </div>
      </div>

      {/* ── Tasks + Blockers + Achievements ────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>

        {/* Goals and tasks */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
              Eesmärgid ja ülesanded
            </h3>
            <Link href="/goals" style={{ fontSize: '12px', color: '#6030ff', textDecoration: 'none', fontWeight: 500 }}>→</Link>
          </div>
          {tasks.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#667085', margin: 0 }}>Ülesandeid pole lisatud.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {tasks.map((task, idx) => {
                const done = task.status === 'done'
                return (
                  <div
                    key={task.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 0',
                      borderBottom: idx < tasks.length - 1 ? '1px solid #e5e7eb' : 'none',
                    }}
                  >
                    {/* Checkbox circle */}
                    <div style={{
                      width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                      border: done ? 'none' : '1.5px solid #d0d5dd',
                      background: done ? 'linear-gradient(168deg, #6030ff 0%, #1f4fd8 100%)' : 'transparent',
                      display: 'grid', placeItems: 'center',
                    }}>
                      {done && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: '13px', color: done ? '#667085' : '#101828', flex: 1,
                      textDecoration: done ? 'line-through' : 'none', lineHeight: 1.4,
                    }}>
                      {task.title}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Open blockers */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>Avatud takistused</h3>
            {activeBlockers.length > 0 && (
              <span style={{ fontSize: '11px', color: '#667085' }}>{activeBlockers.length} aktiivset</span>
            )}
          </div>
          {activeBlockers.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#667085', margin: 0 }}>Aktiivseid takistusi ei ole. 🎉</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeBlockers.slice(0, 2).map((b) => (
                <div key={b.id} style={{
                  padding: '14px', background: '#fef3e2',
                  border: '1px solid rgba(245,158,11,0.4)', borderRadius: '10px',
                }}>
                  <p style={{ margin: '0 0 6px', fontSize: '13px', fontWeight: 500, color: '#f59e0b', lineHeight: 1.4 }}>
                    {b.summary}
                  </p>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', color: '#4a5565', lineHeight: 1.4 }}>
                    {daysSince(b.created_at) === 0 ? 'Täna' : `${daysSince(b.created_at)}p tagasi`} · {b.support_type === 'feel_heard' ? 'Kuulata' : b.support_type === 'want_solution' ? 'Lahendus' : 'Mõelda läbi'}
                  </p>
                  <Link href="/chat" style={{ fontSize: '11px', color: '#6030ff', textDecoration: 'none', fontWeight: 500 }}>
                    Jätka refleksiooni →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent wins */}
        <div className="pz-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>⭐ Minu võidud</h3>
          </div>
          {recentWins.length === 0 ? (
            <p style={{ margin: 0, fontSize: '13px', color: '#667085', lineHeight: 1.5 }}>
              Võidud ilmuvad siia pärast nädalast sisselogimist.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {recentWins.map((win, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px',
                  padding: '8px 10px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
                  border: '1px solid rgba(245,158,11,0.2)',
                }}>
                  <span style={{ fontSize: '13px', flexShrink: 0 }}>⭐</span>
                  <span style={{ fontSize: '13px', color: '#344054', lineHeight: 1.4 }}>{win.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Shoutouts ──────────────────────────────────────────────────────── */}
      <div className="pz-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
            🎉 Tunnustused
          </h3>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link href="/news" style={{ fontSize: '12px', color: '#6030ff', textDecoration: 'none', fontWeight: 500 }}>
              Vaata tunnustusi
            </Link>
            <Link href="/chat" style={{ fontSize: '12px', color: '#6030ff', textDecoration: 'none', fontWeight: 500 }}>
              Anna tunnustus →
            </Link>
          </div>
        </div>
        {shoutouts.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#667085', margin: 0 }}>Tunnustusi pole veel antud.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {shoutouts.map((s) => {
              const fromName = s.anonymous ? 'Anonüümne' : (s.from_user?.name ?? 'Anonüümne')
              const toName = s.to_user?.name ?? ''
              return (
                <div key={s.id} style={{
                  background: '#f9fafb', border: '1px solid #e5e7eb',
                  borderRadius: '10px', padding: '12px',
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 500, color: '#344054' }}>
                    <span>{fromName}</span>
                    <span style={{ color: '#667085' }}> → </span>
                    <span>{toName}</span>
                    <span style={{ color: '#667085', fontWeight: 400 }}> · {daysAgoLabel(s.created_at)}</span>
                  </p>
                  <p style={{ margin: 0, fontSize: '13px', color: '#344054', lineHeight: 1.5 }}>
                    "{s.message}"
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Stat card component ──────────────────────────────────────────────────────

function StatCard({
  label, value, trend, subtitle, tooltip,
}: {
  label: string
  value: number | null
  trend: { delta: string; dir: 'up' | 'down' | 'neutral' } | null
  subtitle: string
  tooltip: string
}) {
  const trendColor = trend?.dir === 'up' ? '#00a63e' : trend?.dir === 'down' ? '#ef4444' : '#667085'
  const trendIcon = trend?.dir === 'up' ? '↑' : trend?.dir === 'down' ? '↓' : '→'

  return (
    <div className="pz-card" style={{ padding: '20px' }}>
      <div style={{ fontSize: '13px', color: '#4a5565', marginBottom: '10px' }} title={tooltip}>
        {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
        <span className="font-display" style={{ fontSize: '28px', fontWeight: 700, color: '#101828', lineHeight: 1, letterSpacing: '-0.28px' }}>
          {value ?? '—'}
        </span>
        {value !== null && trend && (
          <span style={{ fontSize: '13px', color: trendColor, fontWeight: 500 }}>
            {trendIcon}{trend.delta}
          </span>
        )}
      </div>
      <div style={{ fontSize: '11px', color: '#667085' }}>{subtitle}</div>
    </div>
  )
}
