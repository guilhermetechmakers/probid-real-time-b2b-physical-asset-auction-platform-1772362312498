/**
 * BiddingHistoryPanel - History rows with asset link, bid amount, timestamp, result.
 */

import { Link } from 'react-router-dom'
import { Gavel, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'
import type { BidHistoryItem } from '@/types'

interface BiddingHistoryPanelProps {
  items: BidHistoryItem[]
  isLoading?: boolean
  className?: string
}

export function BiddingHistoryPanel({ items, isLoading = false, className }: BiddingHistoryPanelProps) {
  const safeItems = Array.isArray(items) ? items : []

  if (isLoading) {
    return (
      <Card className={cn('rounded-2xl border border-[rgb(var(--border))] shadow-card', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gavel className="h-5 w-5 text-primary" />
            Bidding History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('rounded-2xl border border-[rgb(var(--border))] shadow-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gavel className="h-5 w-5 text-primary" />
          Bidding History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gavel className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 font-medium text-muted-foreground">No bids yet</p>
            <p className="text-sm text-muted-foreground">
              Your bidding activity will appear here
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/marketplace">Browse Auctions</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {safeItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-4 py-3 transition-colors hover:border-primary/20"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={item.listingId != null ? `/listing/${item.listingId}` : '#'}
                    className="font-medium text-foreground hover:underline line-clamp-1"
                  >
                    {item.listingTitle ?? 'Auction'}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-primary">
                    {formatCurrency(item.amount)}
                  </span>
                  <Badge
                    variant={
                      item.status === 'won'
                        ? 'success'
                        : item.status === 'outbid'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="text-xs"
                  >
                    {item.status === 'won' && <TrendingUp className="mr-1 h-3 w-3" />}
                    {item.status === 'outbid' && <TrendingDown className="mr-1 h-3 w-3" />}
                    {item.status === 'won' ? 'Won' : item.status === 'outbid' ? 'Outbid' : 'Pending'}
                  </Badge>
                </div>
                {item.listingId != null && (
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/listing/${item.listingId}`}>View</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
