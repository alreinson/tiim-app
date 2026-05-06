import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth/session'
import { getGoalsByCompany } from '@/lib/db/goals'
import { getLatestCheckinByUser } from '@/lib/db/checkins'
import { getUsersByCompany } from '@/lib/db/users'
import { GoalProgressBar } from '@/components/goals/goal-progress-bar'
import { AddGoalButton } from '@/components/goals/add-goal-button'
import { PendingProposals } from '@/components/goals/pending-proposals'
import { Plus } from 'lucide-react'
import type { Goal, GoalLevel, GoalType, GoalStatus } from '@/types'

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<GoalStatus, { label: string; bg: string; color: string }> = {
  on_track:    { label: 'On track',    bg: '#e6f7ec', color: '#00a63e' },
  in_progress: { label: 'In progress', bg: '#eef4ff', color: '#1f4fd8' },
  at_risk:     { label: 'At risk',     bg: '#fef3e2', color: '#f59e0b' },
  done:        { label: 'Done',        bg: '#e6f7ec', color: '#00a63e' },
  not_started: { label: 'To-do',       bg: '#f2f4f7', color: '#667085' },
}

const LEVEL_LABEL: Record<GoalLevel, string> = {
  yearly:    'yearly',
  quarterly: 'quarterly',
}

const TYPE_CFG: Record<GoalType, { label: string; color: string }> = {
  work:        { label: 'Work',            color: '#6030ff' },
  development: { label: 'Professional dev', color: '#f59e0b' },
}

const TYPE_DOT: Record<GoalType, string> = {
  work:        '#6030ff',
  development: '#f59e0b',
}

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ status, size = 'md' }: { status: GoalStatus; size?: 'sm' | 'md' }) {
  const cfg = STATUS_CFG[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 8px' : '4px 10px',
        borderRadius: '9999px',
        background: cfg.bg,
        color: cfg.color,
        fontSize: size === 'sm' ? '10px' : '11px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
      }}
    >
      {cfg.label}
    </span>
  )
}

// ─── Goal card ────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  parentTitle,
  children,
  userMap,
}: {
  goal: Goal
  parentTitle?: string
  children?: Goal[]
  userMap: Record<string, string>
}) {
  const typeCfg = TYPE_CFG[goal.type]
  const ownerName = goal.owner_id ? (userMap[goal.owner_id] ?? null) : null

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid var(--pz-border)',
        borderRadius: '10px',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        overflow: 'hidden',
      }}
    >
      {/* Goal row */}
      <div style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          {/* Type dot */}
          <div
            style={{
              width: '4px',
              height: '4px',
              borderRadius: '50%',
              background: TYPE_DOT[goal.type],
              marginTop: '10px',
              flexShrink: 0,
            }}
          />

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges row */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
              <span
                style={{
                  padding: '1px 8px',
                  borderRadius: '9999px',
                  background: '#f4f3ff',
                  color: '#6030ff',
                  fontSize: '11px',
                  textTransform: 'capitalize',
                }}
              >
                {LEVEL_LABEL[goal.level]}
              </span>
              <span
                style={{
                  padding: '1px 8px',
                  borderRadius: '9999px',
                  background: '#f4f3ff',
                  color: typeCfg.color,
                  fontSize: '11px',
                }}
              >
                {typeCfg.label}
              </span>
              {parentTitle && (
                <span style={{ fontSize: '11px', color: '#667085' }}>
                  ↗ {parentTitle}
                </span>
              )}
              {ownerName && (
                <span style={{ fontSize: '11px', color: '#667085', marginLeft: 'auto' }}>
                  {ownerName}
                </span>
              )}
            </div>

            {/* Title */}
            <p
              style={{
                margin: '0 0 10px',
                fontFamily: 'var(--font-poppins, Poppins), sans-serif',
                fontWeight: 600,
                fontSize: '16px',
                color: 'var(--pz-fg-1)',
                lineHeight: 1.4,
                letterSpacing: '-0.16px',
              }}
            >
              {goal.title}
            </p>

            {/* Progress row */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <GoalProgressBar progress={goal.progress} height={7} />
              </div>
              <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--pz-fg-1)', whiteSpace: 'nowrap' }}>
                {goal.progress}%
              </span>
              <StatusPill status={goal.status} />
            </div>
          </div>
        </div>
      </div>

      {/* Children / sub-goals */}
      {children && children.length > 0 && (
        <div
          style={{
            background: 'rgba(249,250,251,0.5)',
            borderTop: '1px solid var(--pz-border)',
            padding: '10px 20px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          {children.map((child) => (
            <div
              key={child.id}
              style={{
                background: '#fff',
                border: '1px solid var(--pz-border)',
                borderRadius: '10px',
                padding: '10px 14px',
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#667085' }}>quarterly</span>
                  {child.owner_id && userMap[child.owner_id] && (
                    <span style={{ fontSize: '10px', color: '#667085', marginLeft: 'auto' }}>
                      {userMap[child.owner_id]}
                    </span>
                  )}
                </div>
                <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 500, color: 'var(--pz-fg-1)' }}>
                  {child.title}
                </p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <GoalProgressBar progress={child.progress} height={4} />
                  </div>
                  <span style={{ fontSize: '10px', color: '#667085' }}>{child.progress}%</span>
                  <StatusPill status={child.status} size="sm" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Filter pill ──────────────────────────────────────────────────────────────

function FilterPill({ label, active }: { label: string; active?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 14px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 500,
        background: active ? '#f4f3ff' : '#fff',
        color: active ? '#6030ff' : '#4a5565',
        border: active ? '1px solid #6030ff' : '1px solid var(--pz-border)',
        cursor: 'default',
        textTransform: 'capitalize',
      }}
    >
      {label}
    </span>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function GoalsPage() {
  const user = await getUser()
  if (!user) redirect('/sign-in')

  const [allGoals, latestCheckin, companyUsers] = await Promise.all([
    getGoalsByCompany(user.company_id),
    getLatestCheckinByUser(user.id),
    getUsersByCompany(user.company_id),
  ])

  const userMap: Record<string, string> = {}
  for (const u of companyUsers) {
    userMap[u.id] = u.name
  }

  const proposals = latestCheckin?.pending_ai_actions ?? []

  const yearlyGoals = allGoals.filter((g) => g.level === 'yearly')
  const quarterlyGoals = allGoals.filter((g) => g.level === 'quarterly')

  function childrenOf(parentId: string): Goal[] {
    return quarterlyGoals.filter((g) => g.parent_id === parentId)
  }

  const orphanQuarterly = quarterlyGoals.filter((g) => !g.parent_id)
  const isEmpty = allGoals.length === 0

  const onTrack = allGoals.filter((g) => g.status === 'on_track' || g.status === 'done').length
  const atRisk  = allGoals.filter((g) => g.status === 'at_risk').length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* AI pending proposals */}
      {proposals.length > 0 && latestCheckin && (
        <PendingProposals checkinId={latestCheckin.id} proposals={proposals} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: 'var(--pz-fg-1)', lineHeight: 1.2, letterSpacing: '-0.28px' }}>
            Eesmärgid
          </h1>
          <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
            Eesmärgid → projektid → ülesanded. Klõpsa staatuse muutmiseks.
          </p>
        </div>
        <AddGoalButton />
      </div>

      {/* Summary chips */}
      {!isEmpty && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="pz-card" style={{ padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#667085', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Kokku</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pz-fg-1)' }}>{allGoals.length}</span>
          </div>
          <div className="pz-card" style={{ padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#00a63e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Graafikus</span>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pz-fg-1)' }}>{onTrack}</span>
          </div>
          {atRisk > 0 && (
            <div className="pz-card" style={{ padding: '10px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Ohus</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pz-fg-1)' }}>{atRisk}</span>
            </div>
          )}
        </div>
      )}

      {/* Filter row */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
        <FilterPill label="kõik" active />
        <FilterPill label="minu" />
        <FilterPill label="aastane" />
        <FilterPill label="kvartaalne" />
        <FilterPill label="ohus" />
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--pz-border)',
            borderRadius: '10px',
            padding: '56px 24px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: 500, color: 'var(--pz-fg-1)' }}>Eesmärke pole veel lisatud</p>
          <p style={{ margin: 0, fontSize: '13px', color: '#667085' }}>Loo esimene eesmärk, et tiim näeks suunda.</p>
        </div>
      )}

      {/* Goals list */}
      {!isEmpty && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Yearly goals with their quarterly children */}
          {yearlyGoals.map((yearly) => (
            <GoalCard
              key={yearly.id}
              goal={yearly}
              children={childrenOf(yearly.id)}
              userMap={userMap}
            />
          ))}

          {/* Orphan quarterly goals */}
          {orphanQuarterly.length > 0 && (
            <>
              {yearlyGoals.length > 0 && (
                <p style={{ margin: '8px 0 4px', fontSize: '11px', fontWeight: 600, color: '#667085', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Seostamata kvartalieesmärgid
                </p>
              )}
              {orphanQuarterly.map((goal) => (
                <GoalCard key={goal.id} goal={goal} userMap={userMap} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
