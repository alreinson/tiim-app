import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getUserByClerkId } from '@/lib/db/users'
import { getGoalsByCompany } from '@/lib/db/goals'
import { GoalProgressBar } from '@/components/goals/goal-progress-bar'
import { StatusBadge } from '@/components/goals/status-badge'
import { AddGoalButton } from '@/components/goals/add-goal-button'
import type { Goal, GoalLevel, GoalType } from '@/types'

const LEVEL_BADGE: Record<GoalLevel, { label: string; color: string; bg: string }> = {
  yearly:    { label: 'Aastane',     color: '#7C3AED', bg: '#7C3AED18' },
  quarterly: { label: 'Kvartaalne', color: '#2563EB', bg: '#2563EB18' },
}

const TYPE_BADGE: Record<GoalType, { label: string; color: string; bg: string }> = {
  work:        { label: 'Töö',   color: '#2563EB', bg: '#2563EB18' },
  development: { label: 'Areng', color: '#7C3AED', bg: '#7C3AED18' },
}

function InlineBadge({ cfg }: { cfg: { label: string; color: string; bg: string } }) {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 500,
        padding: '2px 8px',
        borderRadius: 'var(--pz-radius-pill)',
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.color}40`,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

function GoalCard({ goal, indent = false }: { goal: Goal; indent?: boolean }) {
  const levelCfg = LEVEL_BADGE[goal.level]
  const typeCfg = TYPE_BADGE[goal.type]
  const ownerLabel = goal.owner_id ? goal.owner_id.slice(0, 8) : 'Määramata'

  return (
    <div
      style={{
        background: 'var(--pz-surface)',
        border: '1px solid var(--pz-border)',
        borderRadius: 'var(--pz-radius-md)',
        boxShadow: indent ? 'none' : 'var(--pz-shadow-sm)',
        padding: indent ? '14px 18px' : '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        marginLeft: indent ? '24px' : 0,
        borderLeft: indent ? '2px solid var(--pz-border)' : '1px solid var(--pz-border)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <p
          style={{
            margin: 0,
            fontWeight: indent ? 500 : 700,
            color: 'var(--pz-fg-1)',
            fontSize: indent ? '14px' : '16px',
            flex: 1,
          }}
        >
          {goal.title}
        </p>
        <StatusBadge status={goal.status} />
      </div>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <InlineBadge cfg={levelCfg} />
        <InlineBadge cfg={typeCfg} />
        <span
          style={{
            fontSize: '11px',
            color: 'var(--pz-fg-3)',
            marginLeft: 'auto',
          }}
        >
          Omanik: {ownerLabel}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <GoalProgressBar progress={goal.progress} height={indent ? 5 : 7} />
        </div>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--pz-fg-3)',
            whiteSpace: 'nowrap',
            minWidth: '36px',
            textAlign: 'right',
          }}
        >
          {goal.progress}%
        </span>
      </div>
    </div>
  )
}

export default async function GoalsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')
  const user = await getUserByClerkId(userId)
  if (!user) redirect('/sign-in')

  const allGoals = await getGoalsByCompany(user.company_id)

  const yearlyGoals = allGoals.filter((g) => g.level === 'yearly')
  const quarterlyGoals = allGoals.filter((g) => g.level === 'quarterly')
  const orphanQuarterly = quarterlyGoals.filter((g) => !g.parent_id)

  function childrenOf(parentId: string): Goal[] {
    return quarterlyGoals.filter((g) => g.parent_id === parentId)
  }

  const isEmpty = allGoals.length === 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-8)' }}>
      {/* Page header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--pz-s-4)',
          flexWrap: 'wrap',
        }}
      >
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
            Eesmärgid
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: 'var(--pz-fg-3)' }}>
            Kõik ettevõtte eesmärgid hierarhias
          </p>
        </div>
        <AddGoalButton />
      </div>

      {/* Filter row — visual only */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--pz-s-2)',
          flexWrap: 'wrap',
        }}
      >
        {(['Kõik', 'Aastane', 'Kvartaalne', 'Töö', 'Areng'] as const).map((label) => (
          <span
            key={label}
            style={{
              padding: '5px 14px',
              borderRadius: 'var(--pz-radius-pill)',
              fontSize: '13px',
              fontWeight: 500,
              background: label === 'Kõik' ? 'var(--pz-grad-primary)' : 'var(--pz-surface)',
              color: label === 'Kõik' ? '#fff' : 'var(--pz-fg-2)',
              border: '1px solid var(--pz-border)',
              cursor: 'default',
            }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div
          style={{
            background: 'var(--pz-surface)',
            border: '1px solid var(--pz-border)',
            borderRadius: 'var(--pz-radius-md)',
            boxShadow: 'var(--pz-shadow-sm)',
            padding: '48px 24px',
            textAlign: 'center',
            color: 'var(--pz-fg-3)',
            fontSize: '15px',
          }}
        >
          Eesmärke ei ole veel lisatud.
        </div>
      )}

      {/* Goals tree */}
      {!isEmpty && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-6)' }}>
          {yearlyGoals.map((yearly) => {
            const children = childrenOf(yearly.id)
            return (
              <div key={yearly.id} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-3)' }}>
                <GoalCard goal={yearly} />
                {children.map((child) => (
                  <GoalCard key={child.id} goal={child} indent />
                ))}
              </div>
            )
          })}

          {/* Quarterly goals with no parent */}
          {orphanQuarterly.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--pz-s-3)' }}>
              <p
                style={{
                  margin: 0,
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--pz-fg-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Seostamata kvartalieesmärgid
              </p>
              {orphanQuarterly.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
