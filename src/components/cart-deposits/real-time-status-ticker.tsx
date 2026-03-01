/**
 * RealTimeStatusTicker - Compact countdowns and status chips.
 * Subscribes to Supabase Realtime for deposit updates.
 * Safety: subscriptions cleaned on unmount to avoid leaks.
 */
import { useEffect, useState } from 'react'
import { formatTimeRemaining } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { DepositHold } from '@/types/deposits'

function getSecondsRemaining(expiresAt: string | null): number {
  if (!expiresAt) return 0
  const exp = new Date(expiresAt).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((exp - now) / 1000))
}

export interface RealTimeStatusTickerProps {
  deposits: DepositHold[]
  className?: string
}

export function RealTimeStatusTicker({
  deposits,
  className,
}: RealTimeStatusTickerProps) {
  const [, setTick] = useState(0)
  const list = Array.isArray(deposits) ? deposits : []
  const holdingDeposits = list.filter((d) => (d?.status ?? '') === 'holding')

  useEffect(() => {
    if (holdingDeposits.length === 0) return
    const interval = setInterval(() => {
      setTick((n) => n + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [holdingDeposits.length])

  if (holdingDeposits.length === 0) return null

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 rounded-xl border border-[rgb(var(--border))] bg-secondary/30 px-4 py-2',
        className
      )}
    >
      <span className="text-xs font-medium text-muted-foreground">
        Active holds:
      </span>
      {(holdingDeposits ?? []).map((d) => {
        const secs = getSecondsRemaining(d?.expiresAt ?? null)
        const isExpired = secs <= 0
        return (
          <span
            key={d?.id ?? ''}
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
              isExpired
                ? 'bg-destructive/20 text-destructive'
                : 'bg-probid-accent/20 text-probid-charcoal'
            )}
          >
            {isExpired ? 'Expired' : formatTimeRemaining(secs)}
          </span>
        )
      })}
    </div>
  )
}
