'use client'

import { useState } from 'react'

interface InviteTeamProps {
  onNext: () => void
}

interface GeneratedInvite {
  url: string
  role: 'team_member' | 'manager'
}

const INVITE_TYPES = [
  {
    role: 'team_member' as const,
    icon: '👤',
    label: 'Kutsu tiimiliige',
    desc: 'Saada kutselink inimesele, kes liitub meeskonnaga.',
  },
  {
    role: 'manager' as const,
    icon: '🧭',
    label: 'Kutsu juht',
    desc: 'Saada kutselink juhile, kes liitub meeskonnaga.',
  },
]

export function InviteTeam({ onNext }: InviteTeamProps) {
  const [generating, setGenerating] = useState<'team_member' | 'manager' | null>(null)
  const [invites, setInvites] = useState<GeneratedInvite[]>([])
  const [copied, setCopied] = useState<string | null>(null)

  async function generate(role: 'team_member' | 'manager') {
    setGenerating(role)
    try {
      const res = await fetch('/api/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitee_role: role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setInvites((prev) => [...prev.filter((i) => i.role !== role), { url: data.url, role }])
    } catch (err) {
      console.error(err)
    } finally {
      setGenerating(null)
    }
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(url)
    setTimeout(() => setCopied(null), 2000)
  }

  const existingRoles = new Set(invites.map((i) => i.role))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--pz-fg-1)', margin: '0 0 8px' }}>
          Kutsu meeskond
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>
          Genereeri kutselingid ja saada need oma tiimile. Saad seda alati hiljem teha.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {INVITE_TYPES.map(({ role, icon, label, desc }) => {
          const existing = invites.find((i) => i.role === role)
          const isGenerating = generating === role

          return (
            <div
              key={role}
              style={{
                background: 'var(--pz-surface)',
                border: '1px solid var(--pz-border)',
                borderRadius: 'var(--pz-radius-md)',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--pz-fg-1)', fontSize: '14px' }}>
                    {label}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--pz-fg-3)' }}>
                    {desc}
                  </p>
                </div>
                {!existingRoles.has(role) && (
                  <button
                    onClick={() => generate(role)}
                    disabled={isGenerating}
                    style={{
                      padding: '7px 16px',
                      borderRadius: 'var(--pz-radius-pill)',
                      border: 'none',
                      background: 'var(--pz-grad-primary)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isGenerating ? 'not-allowed' : 'pointer',
                      opacity: isGenerating ? 0.7 : 1,
                      flexShrink: 0,
                    }}
                  >
                    {isGenerating ? 'Genereerin...' : 'Genereeri link'}
                  </button>
                )}
              </div>

              {existing && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(96,48,255,0.04)',
                    border: '1px solid rgba(96,48,255,0.15)',
                    borderRadius: 'var(--pz-radius-sm)',
                    padding: '8px 12px',
                  }}
                >
                  <span
                    style={{
                      flex: 1,
                      fontSize: '12px',
                      color: 'var(--pz-fg-2)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontFamily: 'monospace',
                    }}
                  >
                    {existing.url}
                  </span>
                  <button
                    onClick={() => copy(existing.url)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: 'var(--pz-radius-pill)',
                      border: '1px solid rgba(96,48,255,0.3)',
                      background: copied === existing.url ? 'var(--pz-success)' : 'var(--pz-surface)',
                      color: copied === existing.url ? '#fff' : 'var(--pz-violet)',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'background var(--pz-dur-base)',
                    }}
                  >
                    {copied === existing.url ? '✓ Kopeeritud' : 'Kopeeri'}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onNext}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--pz-fg-3)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '0',
          }}
        >
          Jäta vahele →
        </button>
        <button
          onClick={onNext}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--pz-radius-pill)',
            border: 'none',
            background: invites.length > 0 ? 'var(--pz-grad-primary)' : 'var(--pz-border)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Edasi →
        </button>
      </div>
    </div>
  )
}
