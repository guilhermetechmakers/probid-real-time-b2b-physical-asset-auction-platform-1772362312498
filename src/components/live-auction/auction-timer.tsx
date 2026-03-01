/**
 * AuctionTimer - Countdown with time zone awareness, UI state (active/scheduled/ended).
 */
import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { cn, formatTimeRemaining } from '@/lib/utils'

export interface AuctionTimerProps {
  endTime?: string
  remainingSeconds?: number
  status?: 'scheduled' | 'live' | 'ended'
  className?: string
}

export function AuctionTimer({
  endTime,
  remainingSeconds: initialRemaining,
  status = 'scheduled',
  className,
}: AuctionTimerProps) {
  const [remaining, setRemaining] = useState<number | undefined>(() => {
    if (initialRemaining != null) return initialRemaining
    if (endTime) {
      const end = new Date(endTime).getTime()
      const now = Date.now()
      return Math.max(0, Math.floor((end - now) / 1000))
    }
    return undefined
  })

  useEffect(() => {
    if (remaining == null || remaining <= 0 || status === 'ended') return
    const t = setInterval(() => {
      setRemaining((r) => (r != null && r > 0 ? r - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [remaining, status])

  const isLive = status === 'live'
  const isEnded = status === 'ended'

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border-2 px-4 py-3',
        isLive && 'border-primary bg-primary/10',
        isEnded && 'border-muted-foreground/30 bg-[rgb(var(--secondary))]',
        !isLive && !isEnded && 'border-[rgb(var(--border))]',
        className
      )}
    >
      <Clock className="h-6 w-6 shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">
          {isEnded ? 'Ended' : isLive ? 'Time remaining' : 'Starts in'}
        </p>
        <p
          className={cn(
            'text-xl font-bold',
            isLive && remaining != null && remaining < 60 && 'text-destructive animate-pulse'
          )}
        >
          {remaining != null && remaining > 0
            ? formatTimeRemaining(remaining)
            : isEnded
              ? '—'
              : '—'}
        </p>
      </div>
    </div>
  )
}
