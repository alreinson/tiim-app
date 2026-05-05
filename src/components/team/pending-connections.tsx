'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ConnectionItem {
  token: string
  otherName: string
  otherRole: 'team_member' | 'manager'
}

const ROLE_LABELS: Record<string, string> = {
  manager: 'juht',
  team_member: 'tiimiliige',
}

interface Props {
  mode: 'inviter' | 'invitee'
  items: ConnectionItem[]
}

export function PendingConnections({ mode, items: initialItems }: Props) {
  const router = useRouter()
  const [items, setItems] = useState(initialItems)
  const [saving, setSaving] = useState<string | null>(null)

  async function respond(token: string, connected: boolean) {
    setSaving(token)
    try {
      await fetch(`/api/invites/${token}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connected }),
      })
      setItems((prev) => prev.filter((i) => i.token !== token))
      router.refresh()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(null)
    }
  }

  if (items.length === 0) return null

  const title = mode === 'inviter' ? 'Ootel ühendused (sina kutsusid)' : 'Ootel ühendused (sind kutsuti)'

  return (
    <div
      style={{
        background: 'var(--pz-surface)',
        border: '1px solid var(--pz-border)',
        borderRadius: 'var(--pz-radius-md)',
        boxShadow: 'var(--pz-shadow-sm)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--pz-border)',
          background: 'rgba(96,48,255,0.04)',
        }}
      >
        <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: 'var(--pz-fg-2)' }}>
          🤝 {title}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {items.map((item) => {
          const isSaving = saving === item.token
          return (
            <div
              key={item.token}
              style={{
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                borderBottom: '1px solid var(--pz-border)',
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)' }}>
                  {item.otherName}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--pz-fg-3)' }}>
                  {ROLE_LABELS[item.otherRole] ?? item.otherRole}
                  {mode === 'inviter' ? ' — võttis kutse vastu' : ' — kutsus sind'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                <button
                  onClick={() => respond(item.token, true)}
                  disabled={isSaving}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--pz-radius-pill)',
                    border: 'none',
                    background: isSaving ? 'var(--pz-border)' : 'var(--pz-grad-primary)',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Jah, seotud
                </button>
                <button
                  onClick={() => respond(item.token, false)}
                  disabled={isSaving}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--pz-radius-pill)',
                    border: '1px solid var(--pz-border)',
                    background: 'var(--pz-surface)',
                    color: 'var(--pz-fg-3)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  Ei
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
