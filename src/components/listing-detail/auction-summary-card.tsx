/**
 * AuctionSummaryCard - Batch schedule, reserve status, current bid, time remaining, deposit indicators.
 */
import { useEffect, useState } from 'react'
import { Clock, Shield, Gavel } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatTimeRemaining } from '@/lib/utils'
import type { AuctionSchedule } from '@/types/listing-detail'

export interface AuctionSummaryCardProps {
  auction?: AuctionSchedule | null
  currentBid?: number
  reservePrice?: number
  startingPrice?: number
  className?: string
}

export function AuctionSummaryCard({
  auction,
  currentBid,
  reservePrice,
  startingPrice,
  className,
}: AuctionSummaryCardProps) {
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
  const isEnded = status === 'ended'

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        isLive && 'border-primary/50 shadow-accent-glow',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2">
          <Gavel className="h-5 w-5" />
          Auction Summary
        </CardTitle>
        <Badge
          variant={isLive ? 'default' : isEnded ? 'secondary' : 'outline'}
          className={cn(isLive && 'animate-pulse')}
        >
          {isLive ? 'LIVE' : isEnded ? 'ENDED' : 'UPCOMING'}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground">Current bid</p>
          <p className="text-2xl font-bold text-primary">
            {bid > 0 ? formatCurrency(bid) : 'No bids yet'}
          </p>
        </div>

        {reserve > 0 && (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Reserve</p>
              <p className={cn(
                'text-sm font-medium',
                meetsReserve ? 'text-success' : 'text-muted-foreground'
              )}>
                {meetsReserve ? 'Met' : formatCurrency(reserve)}
              </p>
            </div>
          </div>
        )}

        {startingPrice != null && startingPrice > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Starting price</p>
            <p className="text-sm font-medium">{formatCurrency(startingPrice)}</p>
          </div>
        )}

        {auction != null && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Time remaining</span>
            </div>
            <p className={cn(
              'text-lg font-bold',
              remaining != null && remaining > 0 ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {remaining != null && remaining > 0
                ? formatTimeRemaining(remaining)
                : isEnded
                  ? 'Ended'
                  : '—'}
            </p>
          </div>
        )}

        {auction?.bidCount != null && auction.bidCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {auction.bidCount} bid{auction.bidCount !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
