'use client'

import { useState } from 'react'

interface RoleSelectProps {
  initialRole: 'team_member' | 'manager'
  onNext: (role: 'team_member' | 'manager') => void
}

const ROLES = [
  {
    value: 'team_member' as const,
    icon: '👤',
    title: 'Tiimiliige',
    description: 'Osalen meeskonna töös, teen iganädalaseid sisselogimisi ja jälgin oma eesmärke.',
  },
  {
    value: 'manager' as const,
    icon: '🧭',
    title: 'Juht',
    description: 'Juhin meeskonda, vaatan üle sisselogimised ja toetan oma tiimi eesmärkide saavutamisel.',
  },
]

export function RoleSelect({ initialRole, onNext }: RoleSelectProps) {
  const [selected, setSelected] = useState<'team_member' | 'manager'>(initialRole)
  const [isSaving, setIsSaving] = useState(false)

  async function handleNext() {
    setIsSaving(true)
    try {
      await fetch('/api/user/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selected }),
      })
    } catch {
      // non-critical — proceed anyway
    }
    onNext(selected)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '22px',
            fontWeight: 700,
            color: 'var(--pz-fg-1)',
            margin: '0 0 8px',
          }}
        >
          Kes sa oled?
        </h2>
        <p style={{ margin: 0, fontSize: '14px', color: 'var(--pz-fg-3)' }}>
          Vali roll, mis kirjeldab sind kõige paremini.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {ROLES.map((role) => {
          const isActive = selected === role.value
          return (
            <button
              key={role.value}
              onClick={() => setSelected(role.value)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '18px 20px',
                borderRadius: 'var(--pz-radius-md)',
                border: `2px solid ${isActive ? 'var(--pz-violet)' : 'var(--pz-border)'}`,
                background: isActive ? 'rgba(96,48,255,0.05)' : 'var(--pz-surface)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color var(--pz-dur-base), background var(--pz-dur-base)',
              }}
            >
              <span style={{ fontSize: '28px', flexShrink: 0, marginTop: '2px' }}>
                {role.icon}
              </span>
              <div>
                <p
                  style={{
                    margin: '0 0 4px',
                    fontWeight: 700,
                    fontSize: '16px',
                    color: isActive ? 'var(--pz-violet)' : 'var(--pz-fg-1)',
                  }}
                >
                  {role.title}
                </p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--pz-fg-3)', lineHeight: 1.5 }}>
                  {role.description}
                </p>
              </div>
              {isActive && (
                <div
                  style={{
                    marginLeft: 'auto',
                    flexShrink: 0,
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--pz-violet)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                    alignSelf: 'center',
                  }}
                >
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleNext}
          disabled={isSaving}
          style={{
            padding: '10px 24px',
            borderRadius: 'var(--pz-radius-pill)',
            border: 'none',
            background: 'var(--pz-grad-primary)',
            color: '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? 'Salvestan...' : 'Edasi →'}
        </button>
      </div>
    </div>
  )
}
