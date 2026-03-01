/**
 * BidHistoryTimeline - Compact history with filtering (time range, anonymization).
 */
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ListingBid } from '@/types/listing-detail'

export interface BidHistoryTimelineProps {
  bids?: ListingBid[]
  maxItems?: number
  className?: string
}

type TimeFilter = 'all' | '1h' | '24h'

export function BidHistoryTimeline({
  bids = [],
  maxItems = 20,
  className,
}: BidHistoryTimelineProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all')
  const safe = Array.isArray(bids) ? bids : []

  const filtered = (() => {
    if (timeFilter === 'all') return safe
    const now = Date.now()
    const cutoff =
      timeFilter === '1h'
        ? now - 60 * 60 * 1000
        : now - 24 * 60 * 60 * 1000
    return safe.filter((b) => new Date(b.createdAt).getTime() >= cutoff)
  })().slice(0, maxItems)

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Bid history</CardTitle>
        <div className="flex gap-1">
          {(['all', '1h', '24h'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setTimeFilter(f)}
              className={cn(
                'rounded-lg px-2 py-1 text-xs font-medium uppercase transition-colors',
                timeFilter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
            >
              {f === '1h' ? '1h' : f === '24h' ? '24h' : 'All'}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bids in this range.
          </p>
        ) : (
          <ul className="space-y-3">
            {(filtered ?? []).map((bid) => (
              <li
                key={bid.id}
                className="flex items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-3 last:border-0 last:pb-0"
              >
                <span className="font-mono text-sm text-muted-foreground">
                  {bid.anonymizedBuyerId}
                </span>
                <div className="text-right">
                  <p className="font-bold text-primary">
                    {formatCurrency(bid.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(bid.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
