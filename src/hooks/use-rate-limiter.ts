import { useState, useCallback, useRef } from 'react'

interface RateLimiterOptions {
  /** Maximum attempts allowed */
  maxAttempts?: number
  /** Window in milliseconds before reset */
  windowMs?: number
}

/**
 * Client-side rate limiter for throttling user actions (e.g. password reset requests).
 * Provides hints to the user; actual enforcement must be server-side.
 */
export function useRateLimiter(options: RateLimiterOptions = {}) {
  const { maxAttempts = 3, windowMs = 60_000 } = options
  const [attempts, setAttempts] = useState(0)
  const [resetAt, setResetAt] = useState<number | null>(null)
  const windowRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const recordAttempt = useCallback(() => {
    setAttempts((prev) => {
      const next = prev + 1
      if (next === 1) {
        const at = Date.now() + windowMs
        setResetAt(at)
        if (windowRef.current) clearTimeout(windowRef.current)
        windowRef.current = setTimeout(() => {
          setAttempts(0)
          setResetAt(null)
          windowRef.current = null
        }, windowMs)
      }
      return next
    })
  }, [windowMs])

  const isLimited = attempts >= maxAttempts
  const remainingAttempts = Math.max(0, maxAttempts - attempts)
  const secondsUntilReset = resetAt ? Math.ceil((resetAt - Date.now()) / 1000) : 0

  return {
    recordAttempt,
    isLimited,
    remainingAttempts,
    secondsUntilReset,
    attempts,
  }
}
