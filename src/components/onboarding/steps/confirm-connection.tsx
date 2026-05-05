'use client'

import { useState } from 'react'

interface ConfirmConnectionProps {
  inviterName: string
  inviteToken: string
  inviteeRole: 'team_member' | 'manager'
  onNext: () => void
}

const ROLE_LABELS: Record<string, string> = {
  manager: 'juht',
  team_member: 'tiimiliige',
}

export function ConfirmConnection({
  inviterName,
  inviteToken,
  inviteeRole,
  onNext,
}: ConfirmConnectionProps) {
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function markConnection(connected: boolean) {
    setSaving(true)
    try {
      await fetch(`/api/invites/${inviteToken}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connected }),
      })
    } catch {
      // non-critical
    }
    setDone(true)
    setTimeout(onNext, 800)
  }

  const inviterLabel =
    inviteeRole === 'team_member'
      ? `${inviterName} on minu juht`
      : `${inviterName} on minu tiimiliige`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'var(--pz-grad-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 16px',
          }}
        >
          🤝
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '0 0 8px' }}>
          Oled ühendatud
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>
          Sa liitusid {inviterName} kutse kaudu {ROLE_LABELS[inviteeRole] ?? inviteeRole}na.
        </p>
      </div>

      {done ? (
        <div
          style={{
            textAlign: 'center',
            padding: '16px',
            borderRadius: 'var(--pz-radius-md)',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
          }}
        >
          <p style={{ margin: 0, color: '#15803d', fontWeight: 600 }}>✓ Salvestatud</p>
        </div>
      ) : (
        <>
          <div
            style={{
              background: 'rgba(96,48,255,0.05)',
              border: '1px solid rgba(96,48,255,0.15)',
              borderRadius: 'var(--pz-radius-md)',
              padding: '16px 20px',
            }}
          >
            <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)' }}>
              Kinnita seos
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-fg-3)' }}>
              Kas {inviterLabel}?
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={() => markConnection(true)}
              disabled={saving}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: 'var(--pz-radius-pill)',
                border: 'none',
                background: saving ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              ✓ Jah, oleme seotud
            </button>
            <button
              onClick={() => markConnection(false)}
              disabled={saving}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: 'var(--pz-radius-pill)',
                border: '1px solid var(--pz-border)',
                background: 'var(--pz-surface)',
                color: 'var(--pz-fg-3)',
                fontSize: '14px',
                fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              Ei, me ei ole seotud
            </button>
          </div>
        </>
      )}
    </div>
  )
}
