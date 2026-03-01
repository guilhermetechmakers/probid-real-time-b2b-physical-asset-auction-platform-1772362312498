/**
 * AuctionSchedulePanel - Start time, end time, extensions, proxy bidding window.
  */
import { useEffect, useState } from 'react'
import { Clock, Shield, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatDateTime, formatTimeRemaining } from '@/lib/utils'
import type { AuctionSchedule } from '@/types/listing-detail'

export interface AuctionSchedulePanelProps {
  auction?: AuctionSchedule | null
  reservePrice?: number
  currentBid?: number
  className?: string
}

export function AuctionSchedulePanel({
  auction,
  reservePrice = 0,
  currentBid = 0,
  className,
}: AuctionSchedulePanelProps) {
  const [remaining, setRemaining] = useState<number | undefined>(
    auction?.remainingTimeSeconds
  )

  useEffect(() => {
    if (remaining == null || remaining <= 0) return
    const t = setInterval(() => {
      setRemaining((r) => (r != null && r > 0 ? r - 1 : 0))
    }, 1000)
    return () => clearInterval(t)
  }, [remaining])

  const bid = currentBid ?? auction?.currentHighestBid ?? 0
  const reserve = reservePrice ?? auction?.reserve ?? 0
  const meetsReserve = reserve <= 0 || bid >= reserve
  const status = auction?.status ?? 'scheduled'
  const isLive = status === 'live'

  if (!auction) {
    return (
      <Card className={cn('transition-all duration-300', className)}>
        <CardHeader>
          <CardTitle>Auction schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No auction scheduled.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        isLive && 'border-primary/50 shadow-accent-glow',
        className
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Auction schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start</span>
            <span className="font-medium">
              {formatDateTime(auction.startTime)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">End</span>
            <span className="font-medium">
              {formatDateTime(auction.endTime)}
            </span>
          </div>
        </div>

        {remaining != null && remaining > 0 && (
          <div className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">Time remaining</p>
            <p
              className={cn(
                'text-lg font-bold',
                isLive && remaining < 60 && 'text-destructive animate-pulse'
              )}
            >
              {formatTimeRemaining(remaining)}
            </p>
          </div>
        )}

        {reserve > 0 && (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Reserve</p>
              <p
                className={cn(
                  'text-sm font-medium',
                  meetsReserve ? 'text-success' : 'text-muted-foreground'
                )}
              >
                {meetsReserve ? 'Met' : `$${reserve.toLocaleString()}`}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
          <Zap className="h-4 w-4 text-primary" />
          <p className="text-sm">
            Proxy bidding available. Set your max and we'll bid for you.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
