/**
 * BidHistoryPanel - Chronological bids with anonymized buyer IDs, amounts, timestamps, status.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'
import type { ListingBid } from '@/types/listing-detail'

export interface BidHistoryPanelProps {
  bids: ListingBid[]
  isLoading?: boolean
  className?: string
}

export function BidHistoryPanel({
  bids = [],
  isLoading = false,
  className,
}: BidHistoryPanelProps) {
  const safeBids = Array.isArray(bids) ? bids : []

  return (
    <Card className={cn('transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader>
        <CardTitle>Bid History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse rounded-lg bg-[rgb(var(--muted))]"
              />
            ))}
          </div>
        ) : safeBids.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No bids yet. Be the first to bid!
          </p>
        ) : (
          <ul className="space-y-6">
            {safeBids.map((bid) => (
              <li
                key={bid.id}
                className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgb(var(--border))] pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">
                    {bid.anonymizedBuyerId}
                  </span>
                  <Badge variant={bid.status === 'accepted' ? 'success' : 'secondary'}>
                    {bid.status}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{formatCurrency(bid.amount)}</p>
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
