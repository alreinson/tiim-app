/**
 * i18n barrel — safe to import from both server and client components.
 *
 * Server usage:
 *   import { getDict, t } from '@/lib/i18n'
 *   const dict = getDict(user.language)
 *   t(dict, 'common.save')
 *
 * Client usage (inside a Client Component):
 *   import { useT } from '@/lib/i18n'
 *   const dict = useT()
 *   dict.common.save
 */

export { et } from './et'
export { en } from './en'
export type { TranslationDict } from './et'
export { getDict, t } from './server'
// useT is exported separately from a client-only module to avoid
// marking this entire barrel as 'use client'.
export { useT } from './client'
