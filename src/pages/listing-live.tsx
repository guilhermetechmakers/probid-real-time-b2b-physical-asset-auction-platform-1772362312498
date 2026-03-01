/**
 * LiveAuctionRoom - Real-time room for running auctions with live bids, timer, chat.
 */
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import {
  useListingDetail,
  useBidHistory,
  usePlaceBid,
  useSetupProxyBid,
  useBidsRealtime,
} from '@/hooks/use-listing-detail'
import {
  LiveBidPanel,
  AuctionTimer,
  ChatPanel,
  ProxyBidPanel,
} from '@/components/live-auction'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'

export function ListingLivePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { listing, isLoading } = useListingDetail(id)
  const { bids } = useBidHistory(id)
  const placeBidMutation = usePlaceBid(id)
  const setupProxyBidMutation = useSetupProxyBid(id)

  const auction = listing?.auction ?? null
  const currentBid = listing?.currentBid ?? auction?.currentHighestBid ?? 0

  useBidsRealtime(id, auction?.id)

  const handlePlaceBid = (amount: number) => {
    if (!id) return
    placeBidMutation.mutate({ amount })
  }

  const handleSetProxyBid = (maxAmount: number) => {
    if (!id) return
    setupProxyBidMutation.mutate(maxAmount)
  }

  if (isLoading || !listing) {
    return (
      <div className="container space-y-6 px-4 py-8 md:px-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  return (
    <div className="container space-y-6 px-4 py-8 md:px-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/listing/${id}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to listing
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl border-2 border-primary/50 bg-primary/5 p-6">
            <h1 className="text-2xl font-bold">{listing.title}</h1>
            <p className="mt-1 text-muted-foreground">
              Live Auction • {listing.identifier ?? '—'}
            </p>
          </div>

          <AuctionTimer
            endTime={auction?.endTime}
            remainingSeconds={auction?.remainingTimeSeconds}
            status={
              auction?.status === 'cancelled'
                ? 'ended'
                : (auction?.status ?? 'scheduled')
            }
          />

          <ChatPanel messages={[]} />
        </div>

        <div className="space-y-6">
          <LiveBidPanel
            currentBid={currentBid}
            onPlaceBid={handlePlaceBid}
            isPlacing={placeBidMutation.isPending}
          />

          <ProxyBidPanel
            currentBid={currentBid}
            reservePrice={listing.reservePrice}
            onSetProxyBid={handleSetProxyBid}
            isSetting={setupProxyBidMutation.isPending}
            isAuthenticated={!!user}
          />

          {bids.length > 0 && (
            <div className="rounded-xl border border-[rgb(var(--border))] p-4">
              <h3 className="font-semibold">Recent bids</h3>
              <ul className="mt-2 space-y-2">
                {bids.slice(0, 5).map((b) => (
                  <li key={b.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{b.anonymizedBuyerId}</span>
                    <span className="font-bold text-primary">
                      ${b.amount.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
