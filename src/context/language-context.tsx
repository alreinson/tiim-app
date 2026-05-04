'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { Language } from '@/types'

// ─── Context shape ────────────────────────────────────────────────────────────

interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
}

/**
 * Exported so that src/lib/i18n/index.ts can import it directly
 * (avoids a circular reference through the useLanguage hook).
 */
export const LanguageContext = createContext<LanguageContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

interface LanguageProviderProps {
  initialLanguage: Language
  children: React.ReactNode
}

export function LanguageProvider({ initialLanguage, children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)

  const setLanguage = useCallback(async (lang: Language) => {
    // Optimistically update local state first so the UI responds immediately
    setLanguageState(lang)

    // Persist to the server so the preference survives reloads
    try {
      const res = await fetch('/api/user/language', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      })
      if (!res.ok) {
        console.error('[LanguageProvider] Failed to persist language preference:', res.status)
        // Intentionally not rolling back the optimistic update —
        // the UI should keep the user's chosen language even on a transient error.
      }
    } catch (err) {
      console.error('[LanguageProvider] Network error persisting language:', err)
    }
  }, [])

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useLanguage — returns the current UI language and a setter that persists
 * the preference to the server via PATCH /api/user/language.
 *
 * Must be used inside <LanguageProvider>.
 */
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used inside <LanguageProvider>')
  }
  return ctx
}
