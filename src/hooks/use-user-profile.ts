'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { User } from '@/types'

interface UseUserProfileResult {
  user: User | null
  isLoading: boolean
  error: string | null
  /**
   * Call mutate() to re-fetch the user profile from the server.
   * Useful after mutations (e.g. profile update, language change).
   */
  mutate: () => void
}

/**
 * useUserProfile — fetches the authenticated user's profile from GET /api/user/me.
 *
 * - Performs a single fetch on mount (and whenever `mutate()` is called).
 * - Does not require SWR or any external data-fetching library.
 * - Returns null for `user` when unauthenticated or while loading.
 */
export function useUserProfile(): UseUserProfileResult {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  // A counter that increments each time mutate() is called, triggering a re-fetch
  const [tick, setTick] = useState<number>(0)
  const abortRef = useRef<AbortController | null>(null)

  const mutate = useCallback(() => {
    setTick((n) => n + 1)
  }, [])

  useEffect(() => {
    // Cancel any in-flight request from a previous render
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    let cancelled = false

    async function fetchUser() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch('/api/user/me', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        })

        if (cancelled) return

        if (res.status === 401) {
          // Not signed in — not an error condition, just return null
          setUser(null)
          return
        }

        if (!res.ok) {
          const body = await res.text().catch(() => '')
          throw new Error(body || `HTTP ${res.status}`)
        }

        const data = (await res.json()) as User
        if (!cancelled) {
          setUser(data)
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof Error && err.name === 'AbortError') return
        setError(err instanceof Error ? err.message : 'Unknown error')
        setUser(null)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchUser()

    return () => {
      cancelled = true
      controller.abort()
    }
  }, [tick])

  return { user, isLoading, error, mutate }
}
