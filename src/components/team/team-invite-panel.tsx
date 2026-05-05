'use client'

import { useState } from 'react'

interface GeneratedLink {
  url: string
  role: 'team_member' | 'manager'
}

const TYPES = [
  { role: 'team_member' as const, icon: '👤', label: 'Kutsu tiimiliige' },
  { role: 'manager' as const, icon: '🧭', label: 'Kutsu juht' },
]

export function TeamInvitePanel() {
  const [open, setOpen] = useState(false)
  const [links, setLinks] = useState<GeneratedLink[]>([])
  const [generating, setGenerating] = useState<string | null>(null)
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
      setLinks((prev) => [...prev.filter((l) => l.role !== role), { url: data.url, role }])
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

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 18px',
          background: 'var(--pz-grad-primary)',
          color: '#fff',
          border: 'none',
          borderRadius: 'var(--pz-radius-pill)',
          fontSize: '14px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: 'var(--pz-shadow-sm)',
        }}
      >
        + Kutsu liikmeid
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          {/* Panel */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              zIndex: 50,
              background: 'var(--pz-surface)',
              border: '1px solid var(--pz-border)',
              borderRadius: 'var(--pz-radius-md)',
              boxShadow: 'var(--pz-shadow-lg)',
              padding: '16px',
              width: '320px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <p style={{ margin: 0, fontWeight: 600, fontSize: '14px', color: 'var(--pz-fg-1)' }}>
              Genereeri kutselink
            </p>

            {TYPES.map(({ role, icon, label }) => {
              const existing = links.find((l) => l.role === role)
              const isGenerating = generating === role

              return (
                <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{icon}</span>
                    <span style={{ fontSize: '13px', color: 'var(--pz-fg-2)', flex: 1, fontWeight: 500 }}>
                      {label}
                    </span>
                    {!existing && (
                      <button
                        onClick={() => generate(role)}
                        disabled={isGenerating}
                        style={{
                          padding: '5px 12px',
                          borderRadius: 'var(--pz-radius-pill)',
                          border: 'none',
                          background: 'var(--pz-grad-primary)',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: isGenerating ? 'not-allowed' : 'pointer',
                          opacity: isGenerating ? 0.7 : 1,
                        }}
                      >
                        {isGenerating ? '...' : 'Genereeri'}
                      </button>
                    )}
                  </div>

                  {existing && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'rgba(96,48,255,0.05)',
                        border: '1px solid rgba(96,48,255,0.15)',
                        borderRadius: 'var(--pz-radius-sm)',
                        padding: '6px 10px',
                      }}
                    >
                      <span
                        style={{
                          flex: 1,
                          fontSize: '11px',
                          color: 'var(--pz-fg-3)',
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
                          padding: '3px 10px',
                          borderRadius: 'var(--pz-radius-pill)',
                          border: '1px solid rgba(96,48,255,0.2)',
                          background: copied === existing.url ? 'var(--pz-success)' : 'transparent',
                          color: copied === existing.url ? '#fff' : 'var(--pz-violet)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      >
                        {copied === existing.url ? '✓' : 'Kopeeri'}
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
