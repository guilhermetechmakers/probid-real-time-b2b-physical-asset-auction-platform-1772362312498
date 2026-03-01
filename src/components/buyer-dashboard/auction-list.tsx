/**
 * AuctionList - Renders list of AuctionCard items with real-time bid updates.
 */

import { AuctionCard } from './auction-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { BuyerAuction } from '@/types'

interface AuctionListProps {
  auctions: BuyerAuction[]
  isLoading?: boolean
  className?: string
}

export function AuctionList({ auctions, isLoading = false, className }: AuctionListProps) {
  const safeAuctions = Array.isArray(auctions) ? auctions : []

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (safeAuctions.length === 0) {
    return (
      <div className={className}>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 py-12 text-center">
          <p className="font-medium text-muted-foreground">No upcoming auctions</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Check the marketplace for available listings
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {safeAuctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>
    </div>
  )
}
