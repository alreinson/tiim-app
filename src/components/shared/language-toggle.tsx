'use client'

import { useLanguage } from '@/context/language-context'
import type { Language } from '@/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'et', label: 'ET' },
  { value: 'en', label: 'EN' },
]

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * LanguageToggle — a pill-shaped ET | EN switcher.
 *
 * Must be rendered inside <LanguageProvider>.
 * TopNav already wraps everything in LanguageProvider via the (app) layout.
 */
export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        background: 'var(--pz-border)',
        borderRadius: 'var(--pz-radius-pill)',
        padding: '2px',
      }}
      role="group"
      aria-label="Keelevalik"
    >
      {LANGUAGES.map(({ value, label }) => {
        const isActive = language === value
        return (
          <button
            key={value}
            onClick={() => setLanguage(value)}
            aria-pressed={isActive}
            style={{
              padding: '3px 10px',
              borderRadius: 'var(--pz-radius-pill)',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '18px',
              border: 'none',
              cursor: 'pointer',
              transition: `background var(--pz-dur-base), color var(--pz-dur-base)`,
              background: isActive ? 'var(--pz-grad-primary)' : 'transparent',
              color: isActive ? '#fff' : 'var(--pz-fg-3)',
              fontFamily: 'inherit',
            }}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
