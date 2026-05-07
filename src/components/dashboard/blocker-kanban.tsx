'use client'

import { useState } from 'react'
import { AlertCircle, CircleDashed, Circle, CircleCheck, GripVertical } from 'lucide-react'
import { getAvatarGradient, getInitials } from '@/lib/avatar'
import type { SupportType } from '@/types'

type KanbanStatus = 'open' | 'in_progress' | 'solved'

export interface KanbanBlocker {
  id: string
  user_id: string
  summary: string
  support_type: SupportType
  resolved: boolean
  created_at: string
  memberName: string
}

const STATUS_META: Record<KanbanStatus, { label: string; color: string; Icon: React.ComponentType<{ style?: React.CSSProperties }>; bg: string }> = {
  open:        { label: 'Uued',        color: '#f59e0b', Icon: CircleDashed,  bg: '#fef3e2' },
  in_progress: { label: 'Lahendamisel', color: '#1f4fd8', Icon: Circle,        bg: '#eef4ff' },
  solved:      { label: 'Lahendatud',  color: '#00a63e', Icon: CircleCheck,   bg: '#e6f7ec' },
}

const SUPPORT_LABEL: Record<SupportType, string> = {
  feel_heard:    'Kuulata',
  want_solution: 'Lahendus',
  think_through: 'Mõelda läbi',
}

const SUPPORT_COLOR: Record<SupportType, string> = {
  feel_heard:    '#6030ff',
  want_solution: '#e12afb',
  think_through: '#1f4fd8',
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
}

export function BlockerKanban({ blockers }: { blockers: KanbanBlocker[] }) {
  const [overrides, setOverrides] = useState<Record<string, KanbanStatus>>({})

  const getStatus = (b: KanbanBlocker): KanbanStatus => {
    if (overrides[b.id] !== undefined) return overrides[b.id]
    return b.resolved ? 'solved' : 'open'
  }

  const setStatus = (id: string, s: KanbanStatus) => setOverrides((p) => ({ ...p, [id]: s }))
  const forStatus = (s: KanbanStatus) => blockers.filter((b) => getStatus(b) === s)

  return (
    <div style={{
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
      boxShadow: '0 1px 2px rgba(16,24,40,0.05)', padding: '20px',
    }}>
      <h3 style={{
        margin: '0 0 16px', fontSize: '16px', fontWeight: 600, color: '#101828',
        letterSpacing: '-0.16px', display: 'flex', alignItems: 'center', gap: '8px',
      }}>
        <AlertCircle style={{ width: '16px', height: '16px', color: '#6030ff' }} />
        Tiimi takistused
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {(['open', 'in_progress', 'solved'] as KanbanStatus[]).map((status) => {
          const meta = STATUS_META[status]
          const Icon = meta.Icon
          const items = forStatus(status)
          return (
            <div key={status}>
              {/* Column header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{
                  fontSize: '13px', fontWeight: 500, color: '#101828',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                  <Icon style={{ width: '14px', height: '14px', color: meta.color }} />
                  {meta.label}
                </span>
                <span style={{
                  fontSize: '11px', fontWeight: 500, padding: '1px 8px',
                  borderRadius: '9999px', background: meta.bg, color: meta.color,
                }}>
                  {items.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minHeight: '160px' }}>
                {items.map((b) => (
                  <div key={b.id} style={{
                    background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
                    padding: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginBottom: '8px' }}>
                      <GripVertical style={{ width: '12px', height: '12px', color: '#d0d5dd', flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#101828', lineHeight: 1.4, flex: 1 }}>
                        {b.summary}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <div style={{
                        width: '18px', height: '18px', borderRadius: '50%', flexShrink: 0,
                        background: getAvatarGradient(b.user_id), display: 'grid', placeItems: 'center',
                      }}>
                        <span style={{ fontSize: '7px', fontWeight: 700, color: '#fff' }}>{getInitials(b.memberName)}</span>
                      </div>
                      <span style={{ fontSize: '11px', color: '#667085' }}>{b.memberName}</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>·</span>
                      <span style={{ fontSize: '11px', color: '#9ca3af' }}>{daysSince(b.created_at)}p</span>
                      <span style={{
                        fontSize: '10px', fontWeight: 500, padding: '1px 7px',
                        borderRadius: '9999px', marginLeft: 'auto',
                        background: `${SUPPORT_COLOR[b.support_type]}18`,
                        color: SUPPORT_COLOR[b.support_type],
                      }}>
                        {SUPPORT_LABEL[b.support_type]}
                      </span>
                    </div>

                    {/* Status buttons */}
                    <div style={{ display: 'flex', gap: '4px', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #e5e7eb' }}>
                      {status !== 'open' && (
                        <button onClick={() => setStatus(b.id, 'open')} style={{
                          fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                          border: '1px solid #e5e7eb', color: '#667085', background: 'transparent', cursor: 'pointer',
                        }}>Uus</button>
                      )}
                      {status !== 'in_progress' && (
                        <button onClick={() => setStatus(b.id, 'in_progress')} style={{
                          fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                          border: '1px solid #e5e7eb', color: '#667085', background: 'transparent', cursor: 'pointer',
                        }}>Lahendamisel</button>
                      )}
                      {status !== 'solved' && (
                        <button onClick={() => setStatus(b.id, 'solved')} style={{
                          fontSize: '10px', padding: '3px 8px', borderRadius: '6px',
                          border: '1px solid #e5e7eb', color: '#667085', background: 'transparent', cursor: 'pointer',
                        }}>Valmis</button>
                      )}
                    </div>
                  </div>
                ))}

                {items.length === 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100px', border: '2px dashed #e5e7eb',
                    borderRadius: '10px', fontSize: '12px', color: '#9ca3af',
                  }}>
                    Takistusi pole
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
