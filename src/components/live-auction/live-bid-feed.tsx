/**
 * LiveBidFeed - Streaming list of bids with anonymized bidder tags, timestamps.
 * Auto-scrolls to bottom on new bids unless user has scrolled up.
 */
import { useEffect, useRef, useState } from 'react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ListingBid } from '@/types/listing-detail'

export interface LiveBidFeedProps {
  bids: ListingBid[]
  maxHeight?: number
  className?: string
}

export function LiveBidFeed({
  bids = [],
  maxHeight = 280,
  className,
}: LiveBidFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const prevCountRef = useRef(0)

  const safeBids = Array.isArray(bids) ? bids : []

  useEffect(() => {
    if (safeBids.length > prevCountRef.current && autoScroll) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      })
    }
    prevCountRef.current = safeBids.length
  }, [safeBids.length, autoScroll])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50
    setAutoScroll(atBottom)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold uppercase tracking-wider">Live bid feed</h3>
        {safeBids.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {safeBids.length} bid{safeBids.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-y-auto rounded-xl border border-[rgb(var(--border))] bg-card scroll-smooth"
        style={{ maxHeight }}
        role="region"
        aria-label="Live bid feed"
      >
        <div className="flex flex-col p-4 space-y-4">
          {safeBids.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No bids yet. Be the first to bid!
            </p>
          ) : (
            (safeBids ?? []).map((bid) => (
              <div
                key={bid.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-4 py-3 transition-all duration-200 hover:border-primary/30"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="font-mono text-sm font-medium text-muted-foreground"
                    aria-label={bid.anonymizedBuyerId}
                  >
                    {bid.anonymizedBuyerId}
                  </span>
                  {bid.isProxy && (
                    <span className="rounded bg-primary/20 px-1.5 py-0.5 text-xs font-medium uppercase text-primary-foreground">
                      Proxy
                    </span>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary">
                    {formatCurrency(bid.amount)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(bid.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
