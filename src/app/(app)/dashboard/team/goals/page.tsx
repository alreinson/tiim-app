import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth/session'
import { getGoalsByCompany } from '@/lib/db/goals'
import { GoalProgressBar } from '@/components/goals/goal-progress-bar'
import { StatusBadge } from '@/components/goals/status-badge'

export default async function TeamGoalsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')
  if (user.role === 'team_member') redirect('/goals')

  const goals = await getGoalsByCompany(user.company_id)
  const yearly    = goals.filter((g) => g.level === 'yearly')
  const quarterly = goals.filter((g) => g.level === 'quarterly')
  const onTrack   = goals.filter((g) => g.status === 'on_track' || g.status === 'done').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ margin: 0 }}>Tiimi eesmärgid</h1>
          <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
            {onTrack} / {goals.length} eesmärki graafikus
          </p>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Kõik eesmärgid', value: goals.length },
          { label: 'Aasta-eesmärgid', value: yearly.length },
          { label: 'Kvartali-eesmärgid', value: quarterly.length },
          { label: 'Graafikus', value: onTrack, highlight: true },
        ].map(({ label, value, highlight }) => (
          <div
            key={label}
            className="pz-card"
            style={{ padding: '20px 24px', flex: '1 1 140px' }}
          >
            <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--pz-fg-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
              {label}
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: highlight ? 'var(--pz-success)' : 'var(--pz-fg-1)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Yearly goals */}
      {yearly.length > 0 && (
        <section>
          <h2 style={{ marginBottom: '16px' }}>Aasta-eesmärgid</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {yearly.map((goal) => (
              <div key={goal.id} className="pz-card" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 600, fontSize: '15px', color: 'var(--pz-fg-1)', flex: 1 }}>{goal.title}</div>
                  <StatusBadge status={goal.status} />
                </div>
                <GoalProgressBar progress={goal.progress ?? 0} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quarterly goals */}
      {quarterly.length > 0 && (
        <section>
          <h2 style={{ marginBottom: '16px' }}>Kvartali-eesmärgid</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
            {quarterly.map((goal) => (
              <div key={goal.id} className="pz-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '10px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)', flex: 1, lineHeight: 1.4 }}>{goal.title}</div>
                  <StatusBadge status={goal.status} />
                </div>
                <GoalProgressBar progress={goal.progress ?? 0} />
                {goal.quarter && (
                  <div style={{ fontSize: '11px', color: 'var(--pz-fg-4)', marginTop: '8px' }}>
                    {goal.quarter}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <div className="pz-card" style={{ padding: '48px', textAlign: 'center', color: 'var(--pz-fg-3)', fontSize: '14px' }}>
          Eesmärke pole veel lisatud.
        </div>
      )}
    </div>
  )
}
