'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { Plane } from 'lucide-react'
import type { User } from '@/types'
import { getAvatarGradient, getInitials } from '@/lib/avatar'

interface Props {
  user: User
  companyName: string
}

const ROLE_LABELS: Record<User['role'], string> = {
  team_member: 'Team Member',
  manager: 'Manager',
  admin: 'Admin',
}

export function SettingsClient({ user, companyName }: Props) {
  const router = useRouter()
  const { signOut } = useClerk()

  const [language, setLanguage] = useState<User['language']>(user.language)
  const [supportStyle, setSupportStyle] = useState(user.support_style)
  const [directness, setDirectness] = useState(user.feedback_directness)
  const [vacationMode, setVacationMode] = useState(user.vacation_mode)
  const [saving, setSaving] = useState(false)

  const avatarGradient = getAvatarGradient(user.id)
  const initials = getInitials(user.name)

  async function save(patch: Record<string, unknown>) {
    setSaving(true)
    try {
      await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      })
      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  function handleLanguage(lang: User['language']) {
    setLanguage(lang)
    save({ language: lang })
  }

  function handleSupportStyle(v: number) {
    setSupportStyle(v)
    save({ support_style: v })
  }

  function handleDirectness(v: User['feedback_directness']) {
    setDirectness(v)
    save({ feedback_directness: v })
  }

  function handleVacation(v: boolean) {
    setVacationMode(v)
    save({ vacation_mode: v })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '720px' }}>

      {/* Header */}
      <div>
        <h1 style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#101828', letterSpacing: '-0.28px', lineHeight: 1.2 }}>
          Seaded
        </h1>
        <p style={{ margin: 0, fontSize: '13px', color: '#4a5565' }}>
          Profiil, suhtlus, keel, puhkus.
        </p>
      </div>

      {/* Profile */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '22px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
          Profiil
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Avatar — 60px rounded square */}
          <div style={{
            width: '60px', height: '60px', borderRadius: '15px', flexShrink: 0,
            background: avatarGradient, display: 'grid', placeItems: 'center',
          }}>
            <span style={{ fontSize: '19px', fontWeight: 600, color: '#fff' }}>{initials}</span>
          </div>
          {/* Info */}
          <div>
            <p style={{ margin: '0 0 4px', fontSize: '15px', fontWeight: 500, color: '#101828' }}>
              {user.name}
            </p>
            <p style={{ margin: '0 0 4px', fontSize: '13px', color: '#667085' }}>
              {user.email} · {ROLE_LABELS[user.role]} · {companyName}
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#667085' }}>
              Connected via Google SSO
            </p>
          </div>
        </div>
      </div>

      {/* Language */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '22px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
          Keel
        </h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['et', 'en'] as const).map((lang) => {
            const active = language === lang
            return (
              <button
                key={lang}
                onClick={() => handleLanguage(lang)}
                disabled={saving}
                style={{
                  padding: '10px 22px', borderRadius: '10px',
                  border: `1px solid ${active ? '#6030ff' : '#e5e7eb'}`,
                  background: active ? '#f4f3ff' : 'transparent',
                  color: active ? '#6030ff' : '#101828',
                  fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                {lang === 'et' ? '🇪🇪 Eesti keel' : '🇬🇧 English'}
              </button>
            )
          })}
        </div>
        <p style={{ margin: 0, fontSize: '11px', color: '#667085' }}>
          Kasutajaliides, AI vastused ja e-kirjad järgivad seda eelistust.
        </p>
      </div>

      {/* Communication preferences */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '22px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        display: 'flex', flexDirection: 'column', gap: '20px',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
          Suhtluseelistused
        </h3>

        {/* Support style slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#344054' }}>
            Toe stiil
          </p>
          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={supportStyle}
            onChange={(e) => setSupportStyle(Number(e.target.value))}
            onMouseUp={(e) => handleSupportStyle(Number((e.target as HTMLInputElement).value))}
            onTouchEnd={(e) => handleSupportStyle(Number((e.target as HTMLInputElement).value))}
            style={{ width: '100%', accentColor: '#6030ff', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: '#667085' }}>Tahan lahendusi</span>
            <span style={{ fontSize: '11px', color: '#667085' }}>Tahan olla ära kuulatud</span>
          </div>
        </div>

        {/* Feedback directness */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#344054' }}>
            Tagasiside otsekohesus
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['direct', 'balanced', 'gentle'] as const).map((opt) => {
              const active = directness === opt
              const labels: Record<typeof opt, string> = { direct: 'Otsekohene', balanced: 'Tasakaalustatud', gentle: 'Leebe' }
              return (
                <button
                  key={opt}
                  onClick={() => handleDirectness(opt)}
                  disabled={saving}
                  style={{
                    padding: '8px 20px', borderRadius: '10px',
                    border: `1px solid ${active ? '#6030ff' : '#e5e7eb'}`,
                    background: active ? '#f4f3ff' : 'transparent',
                    color: active ? '#6030ff' : '#101828',
                    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {labels[opt]}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Vacation mode */}
      <div style={{
        background: '#fff', border: '1px solid #e5e7eb', borderRadius: '10px',
        padding: '22px', boxShadow: '0 1px 2px rgba(16,24,40,0.05)',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#101828', letterSpacing: '-0.16px' }}>
          Puhkuserežiim
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Plane style={{ width: '19px', height: '19px', color: '#667085', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: 500, color: '#101828' }}>
              Peata e-kirjad ja streak
            </p>
            <p style={{ margin: 0, fontSize: '11px', color: '#667085' }}>
              Igapäevased e-kirjad peatuvad, streak jätkub automaatselt naasmisel.
            </p>
          </div>
          {/* Toggle switch */}
          <button
            role="switch"
            aria-checked={vacationMode}
            onClick={() => handleVacation(!vacationMode)}
            disabled={saving}
            style={{
              width: '41px', height: '23px', borderRadius: '9999px', border: 'none',
              background: vacationMode ? '#6030ff' : '#d0d5dd',
              cursor: 'pointer', flexShrink: 0, position: 'relative',
              transition: 'background 0.2s',
              padding: 0,
            }}
          >
            <span style={{
              position: 'absolute',
              top: '2px',
              left: vacationMode ? '20px' : '2px',
              width: '19px', height: '19px', borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              transition: 'left 0.2s',
              display: 'block',
            }} />
          </button>
        </div>
      </div>

      {/* Sign out of all devices */}
      <button
        onClick={() => signOut({ redirectUrl: '/sign-in' })}
        style={{
          alignSelf: 'flex-start', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', fontWeight: 500, color: '#e7000b',
        }}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logi kõigist seadmetest välja
      </button>
    </div>
  )
}
