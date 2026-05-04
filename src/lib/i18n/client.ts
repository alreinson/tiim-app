'use client'

/**
 * Client-only i18n hook.
 * Only import this from Client Components (files with 'use client').
 */
import { useContext } from 'react'
import { LanguageContext } from '@/context/language-context'
import { getDict } from './server'
import { et } from './et'
import type { TranslationDict } from './et'

/**
 * useT — returns the full translation dictionary for the active language.
 * Reads the language from LanguageContext; falls back to Estonian if the
 * component is rendered outside a LanguageProvider.
 *
 * @example
 *   const t = useT()
 *   <button>{t.common.save}</button>
 */
export function useT(): TranslationDict {
  const ctx = useContext(LanguageContext)
  if (!ctx) return et
  return getDict(ctx.language)
}
