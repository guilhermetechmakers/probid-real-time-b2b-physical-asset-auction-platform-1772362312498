/**
 * ServerTimeSync - Provides synchronized time and offset for auction countdown.
 * Uses client time with optional server offset for accuracy.
 */
import { useEffect, useState } from 'react'

export interface ServerTimeSyncResult {
  /** Current server-synced time (ms since epoch) */
  serverTime: number
  /** Offset in ms: serverTime - clientTime */
  offsetMs: number
  /** Whether sync has been established */
  isSynced: boolean
}

/**
 * Hook to sync client time with server.
 * For now uses client time; can be extended to fetch server time via API.
 */
export function useServerTimeSync(serverUrl?: string): ServerTimeSyncResult {
  const [offsetMs, setOffsetMs] = useState(0)
  const [isSynced, setIsSynced] = useState(false)

  useEffect(() => {
    if (!serverUrl) {
      setIsSynced(true)
      return
    }

    let cancelled = false

    async function fetchOffset() {
      try {
        const clientBefore = Date.now()
        const res = await fetch(`${serverUrl}/api/time`)
        const clientAfter = Date.now()
        if (cancelled) return

        const data = (await res.json()) as { serverTime?: number }
        const serverTime = typeof data?.serverTime === 'number' ? data.serverTime : 0
        const rtt = clientAfter - clientBefore
        const estimatedServerNow = serverTime + rtt / 2
        const offset = estimatedServerNow - clientAfter
        setOffsetMs(offset)
        setIsSynced(true)
      } catch {
        if (!cancelled) setIsSynced(true)
      }
    }

    fetchOffset()
    return () => {
      cancelled = true
    }
  }, [serverUrl])

  const clientTime = Date.now()
  const serverTime = clientTime + offsetMs

  return { serverTime, offsetMs, isSynced }
}
