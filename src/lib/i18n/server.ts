/**
 * Server-safe i18n helpers — no React imports, no 'use client'.
 * Import these in Server Components, Route Handlers, and Server Actions.
 */
import { et } from './et'
import { en } from './en'
import type { TranslationDict } from './et'
import type { Language } from '@/types'

export const dictionaries: Record<Language, TranslationDict> = { et, en }

/**
 * getDict — returns the full translation dictionary for the given language.
 * Falls back to Estonian if the language is unrecognised.
 */
export function getDict(language: Language): TranslationDict {
  return dictionaries[language] ?? et
}

/**
 * t — look up a single translation by dot-separated key path.
 *
 * @example
 *   const dict = getDict(user.language)
 *   t(dict, 'common.save')  // → 'Salvesta' | 'Save'
 *   t(dict, 'goals.status.done')  // → 'Tehtud' | 'Done'
 */
export function t(dict: TranslationDict, key: string): string {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = dict
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return key
    current = current[part]
  }
  if (typeof current === 'string') return current
  return key
}
