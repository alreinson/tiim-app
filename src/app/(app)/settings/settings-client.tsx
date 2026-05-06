'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

interface Props {
  user: User
}

export function SettingsClient({ user }: Props) {
  const router = useRouter()
  const [language, setLanguage] = useState<'et' | 'en'>(user.language)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      await fetch('/api/user/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '560px' }}>
      <div>
        <h1 style={{ margin: 0 }}>Seaded</h1>
        <p style={{ color: 'var(--pz-fg-3)', fontSize: '14px', marginTop: '6px' }}>
          Konto ja eelistuste haldamine.
        </p>
      </div>

      {/* Profile */}
      <div className="pz-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0 }}>Profiil</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--pz-fg-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Nimi
            </label>
            <div style={{ fontSize: '14px', color: 'var(--pz-fg-1)', fontWeight: 500 }}>{user.name}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--pz-fg-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              E-post
            </label>
            <div style={{ fontSize: '14px', color: 'var(--pz-fg-1)' }}>{user.email}</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--pz-fg-3)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Roll
            </label>
            <div style={{ fontSize: '14px', color: 'var(--pz-fg-1)' }}>
              {user.role === 'manager' ? 'Juht' : user.role === 'admin' ? 'Admin' : 'Tiimiliige'}
            </div>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="pz-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ margin: 0 }}>Keel</h3>
        <div
          style={{
            display: 'inline-flex',
            padding: '4px',
            background: 'var(--pz-surface-2)',
            borderRadius: 'var(--pz-radius-pill)',
            border: '1px solid var(--pz-border)',
            gap: '2px',
          }}
        >
          {(['et', 'en'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setLanguage(l)}
              style={{
                padding: '8px 20px',
                borderRadius: 'var(--pz-radius-pill)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: language === l ? 600 : 400,
                background: language === l ? 'var(--pz-grad-primary)' : 'transparent',
                color: language === l ? '#fff' : 'var(--pz-fg-3)',
                transition: `background var(--pz-dur-base), color var(--pz-dur-base)`,
              }}
            >
              {l === 'et' ? 'Eesti' : 'English'}
            </button>
          ))}
        </div>
        <button
          onClick={handleSave}
          disabled={saving || language === user.language}
          style={{
            alignSelf: 'flex-start',
            padding: '10px 20px',
            borderRadius: 'var(--pz-radius-md)',
            border: 'none',
            cursor: saving || language === user.language ? 'not-allowed' : 'pointer',
            background: saved ? 'var(--pz-success)' : 'var(--pz-grad-primary)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '13px',
            opacity: language === user.language && !saving ? 0.5 : 1,
            transition: `background var(--pz-dur-base)`,
          }}
        >
          {saved ? 'Salvestatud!' : saving ? 'Salvestamine…' : 'Salvesta'}
        </button>
      </div>
    </div>
  )
}
