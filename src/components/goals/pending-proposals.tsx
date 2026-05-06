'use client'

import { useState } from 'react'
import type { GoalProposal, GoalStatus } from '@/types'

const STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Alustamata',
  in_progress: 'Töös',
  on_track:    'Plaanis',
  at_risk:     'Ohus',
  done:        'Valmis',
}

const STATUS_COLORS: Record<GoalStatus, { color: string; bg: string }> = {
  not_started: { color: 'var(--pz-fg-3)',   bg: 'rgba(148,163,184,0.12)' },
  in_progress: { color: '#2563EB',           bg: '#2563EB12' },
  on_track:    { color: 'var(--pz-success)', bg: '#00A63E12' },
  at_risk:     { color: 'var(--pz-danger)',  bg: '#E7000B12' },
  done:        { color: 'var(--pz-success)', bg: '#00A63E20' },
}

interface Props {
  checkinId: string
  proposals: GoalProposal[]
}

export function PendingProposals({ checkinId, proposals: initial }: Props) {
  const [proposals, setProposals] = useState<GoalProposal[]>(initial)
  const [loading, setLoading] = useState<string | null>(null)

  if (proposals.length === 0) return null

  async function confirm(p: GoalProposal) {
    setLoading(p.goal_id)
    try {
      await fetch(`/api/goals/${p.goal_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: p.proposed_status,
          ...(p.proposed_progress !== undefined ? { progress: p.proposed_progress } : {}),
        }),
      })
      await dismiss(p, false)
    } catch {
      setLoading(null)
    }
  }

  async function dismiss(p: GoalProposal, updateState = true) {
    if (updateState) setLoading(p.goal_id)
    try {
      await fetch(`/api/checkins/${checkinId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dismiss_goal_id: p.goal_id }),
      })
      setProposals((prev) => prev.filter((x) => x.goal_id !== p.goal_id))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #6030FF08, #4F46E508)',
        border: '1px solid #6030FF30',
        borderRadius: 'var(--pz-radius-md)',
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '14px' }}>✨</span>
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--pz-violet)' }}>
          AI soovitused eelmisest sisselogimisest
        </p>
        <span
          style={{
            marginLeft: 'auto',
            fontSize: '11px',
            color: 'var(--pz-fg-3)',
            fontWeight: 500,
          }}
        >
          {proposals.length} ootel
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {proposals.map((p) => {
          const sc = STATUS_COLORS[p.proposed_status]
          const isLoading = loading === p.goal_id
          return (
            <div
              key={p.goal_id}
              style={{
                background: 'var(--pz-surface)',
                border: '1px solid var(--pz-border)',
                borderRadius: 'var(--pz-radius-md)',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                opacity: isLoading ? 0.5 : 1,
                transition: 'opacity var(--pz-dur-base)',
              }}
            >
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--pz-fg-1)' }}>
                  {p.goal_title}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: 'var(--pz-fg-3)', fontStyle: 'italic' }}>
                  &ldquo;{p.source_text}&rdquo;
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--pz-fg-3)' }}>→</span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '1px 8px',
                      borderRadius: 'var(--pz-radius-pill)',
                      background: sc.bg,
                      color: sc.color,
                    }}
                  >
                    {STATUS_LABELS[p.proposed_status]}
                  </span>
                  {p.proposed_progress !== undefined && (
                    <span style={{ fontSize: '11px', color: 'var(--pz-fg-3)' }}>
                      {p.proposed_progress}%
                    </span>
                  )}
                  {p.confidence === 'low' && (
                    <span style={{ fontSize: '11px', color: '#F59E0B' }}>· ebakindel</span>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => confirm(p)}
                  disabled={isLoading}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--pz-radius-pill)',
                    background: 'var(--pz-grad-primary)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Kinnita
                </button>
                <button
                  onClick={() => dismiss(p)}
                  disabled={isLoading}
                  style={{
                    padding: '5px 10px',
                    borderRadius: 'var(--pz-radius-pill)',
                    background: 'transparent',
                    border: '1px solid var(--pz-border)',
                    color: 'var(--pz-fg-3)',
                    fontSize: '12px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                  }}
                >
                  Ignoreeri
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
