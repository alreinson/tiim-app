'use client'

import type { Checkin, User } from '@/types'

interface TimelineCheckin extends Checkin {
  member: Pick<User, 'id' | 'name'>
}

interface Props {
  checkins: TimelineCheckin[]
  memberName?: string  // if set, filters to one member
}

const MOOD_LABEL: Record<number, string> = { 1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😄' }

function PillList({ items, color }: { items: string[]; color: string }) {
  if (items.length === 0) return null
  return (
    <ul style={{ margin: 0, paddingLeft: '14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: '12px', color: 'var(--pz-fg-2)', lineHeight: 1.4 }}>
          <span style={{ color }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export function HistoryTimeline({ checkins, memberName }: Props) {
  const filtered = memberName
    ? checkins.filter((c) => c.member.name === memberName)
    : checkins

  if (filtered.length === 0) {
    return (
      <div
        style={{
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          borderRadius: 'var(--pz-radius-md)',
          padding: '40px 24px',
          textAlign: 'center',
          color: 'var(--pz-fg-3)',
          fontSize: '14px',
        }}
      >
        Ajalugu puudub.
      </div>
    )
  }

  // Group by week
  const byWeek = new Map<string, TimelineCheckin[]>()
  for (const c of filtered) {
    const week = c.week
    if (!byWeek.has(week)) byWeek.set(week, [])
    byWeek.get(week)!.push(c)
  }
  const weeks = Array.from(byWeek.keys()).sort((a, b) => b.localeCompare(a))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {weeks.map((week) => {
        const entries = byWeek.get(week)!
        return (
          <div key={week} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Week label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--pz-fg-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  whiteSpace: 'nowrap',
                }}
              >
                {week.replace('-W', ' nädal ')}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--pz-border)' }} />
            </div>

            {/* Entries */}
            {entries.map((c) => {
              const hasPPP = c.progress.length + c.plans.length + c.problems.length > 0
              return (
                <div
                  key={c.id}
                  style={{
                    background: 'var(--pz-surface)',
                    border: '1px solid var(--pz-border)',
                    borderRadius: 'var(--pz-radius-md)',
                    padding: '14px 18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--pz-fg-1)' }}>
                      {c.member.name}
                    </span>
                    {c.mood && (
                      <span title={`Meeleolu ${c.mood}/5`} style={{ fontSize: '14px' }}>
                        {MOOD_LABEL[c.mood]}
                      </span>
                    )}
                    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
                      {c.mood && (
                        <Chip label={`M ${c.mood}`} color="var(--pz-violet)" />
                      )}
                      {c.energy && (
                        <Chip label={`E ${c.energy}`} color="#49BBFF" />
                      )}
                      {c.workload && (
                        <Chip label={`K ${c.workload}`} color="#F59E0B" />
                      )}
                    </div>
                  </div>

                  {/* PPP */}
                  {hasPPP && (
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {c.progress.length > 0 && (
                        <div style={{ flex: '1 1 140px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: '#00B894', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</p>
                          <PillList items={c.progress} color="var(--pz-fg-1)" />
                        </div>
                      )}
                      {c.plans.length > 0 && (
                        <div style={{ flex: '1 1 140px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: 'var(--pz-violet)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Plaanid</p>
                          <PillList items={c.plans} color="var(--pz-fg-1)" />
                        </div>
                      )}
                      {c.problems.length > 0 && (
                        <div style={{ flex: '1 1 140px' }}>
                          <p style={{ margin: '0 0 4px', fontSize: '11px', fontWeight: 700, color: 'var(--pz-danger)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Probleemid</p>
                          <PillList items={c.problems} color="var(--pz-fg-1)" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

function Chip({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 600,
        padding: '1px 7px',
        borderRadius: 'var(--pz-radius-pill)',
        background: `${color}18`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  )
}
