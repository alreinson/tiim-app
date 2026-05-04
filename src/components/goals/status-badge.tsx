import type { GoalStatus, WorkItemStatus } from '@/types'

interface StatusBadgeProps {
  status: GoalStatus | WorkItemStatus
}

const STATUS_CONFIG: Record<GoalStatus, { label: string; color: string }> = {
  not_started: { label: 'Alustamata', color: '#94A3B8' },
  in_progress:  { label: 'Töös',       color: '#3B82F6' },
  on_track:     { label: 'Graafikus',  color: '#10B981' },
  at_risk:      { label: 'Ohus',       color: '#F59E0B' },
  done:         { label: 'Tehtud',     color: '#6B7280' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.not_started
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '2px 10px',
        borderRadius: 'var(--pz-radius-pill)',
        fontSize: '12px',
        fontWeight: 500,
        background: `${cfg.color}18`,
        color: cfg.color,
        border: `1px solid ${cfg.color}40`,
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: cfg.color,
          flexShrink: 0,
        }}
      />
      {cfg.label}
    </span>
  )
}
