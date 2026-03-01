/**
 * LiveAuctionRoomPage - Real-time room with timer, bids, chat, quick-bid panel.
 */
import { useParams } from 'react-router-dom'
import {
  useListingDetail,
  useBidHistory,
  usePlaceBid,
  useSetupProxyBid,
  useBidsRealtime,
  getMinBidIncrement,
} from '@/hooks/use-listing-detail'
import {
  AuctionHeader,
  LiveBidFeed,
  QuickBidPanel,
  OpsAnnouncementsPanel,
  ChatFeed,
  BidHistoryTimeline,
  StatsMiniCard,
} from '@/components/live-auction'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import type { AuctionStatusPill } from '@/components/ui/status-pill'

export function ListingLivePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { listing, isLoading } = useListingDetail(id)
  const { bids } = useBidHistory(id)
  const placeBidMutation = usePlaceBid(id)
  const setupProxyBidMutation = useSetupProxyBid(id)

  const auction = listing?.auction ?? null
  const currentBid = listing?.currentBid ?? auction?.currentHighestBid ?? 0
  const minIncrement = getMinBidIncrement(currentBid)

  useBidsRealtime(id, auction?.id)

  const status: AuctionStatusPill =
    auction?.status === 'cancelled'
      ? 'ended'
      : auction?.status === 'live'
        ? 'live'
        : auction?.status === 'ended'
          ? 'ended'
          : 'scheduled'

  const handlePlaceBid = (amount: number) => {
    if (!id) return
    placeBidMutation.mutate({ amount })
  }

  const handlePlaceProxyBid = (maxAmount: number) => {
    if (!id) return
    setupProxyBidMutation.mutate(maxAmount)
  }

  const avgBid =
    bids.length > 0
      ? bids.reduce((s, b) => s + b.amount, 0) / bids.length
      : 0
  const uniqueBidders = new Set(
    (bids ?? []).map((b) => b.anonymizedBuyerId)
  ).size

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
      <AuctionHeader
        listingId={listing.id}
        title={listing.title}
        identifier={listing.identifier}
        currentBid={currentBid}
        reservePrice={listing.reservePrice}
        reserveMet={
          (listing.reservePrice ?? 0) <= 0 || currentBid >= (listing.reservePrice ?? 0)
        }
        status={status}
        endTime={auction?.endTime}
        remainingSeconds={auction?.remainingTimeSeconds}
        bidCount={bids.length}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-6 sm:grid-cols-2">
            <LiveBidFeed bids={bids} maxHeight={280} />
            <div className="space-y-6">
              <OpsAnnouncementsPanel announcements={[]} />
              <ChatFeed messages={[]} canPost={false} />
            </div>
          </div>

          <BidHistoryTimeline bids={bids} maxItems={15} />
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card">
            <h3 className="mb-4 font-semibold uppercase tracking-wider">
              Place bid
            </h3>
            <QuickBidPanel
              currentBid={currentBid}
              minIncrement={minIncrement}
              reservePrice={listing.reservePrice}
              onPlaceBid={handlePlaceBid}
              onPlaceProxyBid={handlePlaceProxyBid}
              isPlacing={
                placeBidMutation.isPending || setupProxyBidMutation.isPending
              }
              isAuthenticated={!!user}
            />
          </div>

          <StatsMiniCard
            averageBid={avgBid}
            bidCount={bids.length}
            uniqueBidders={uniqueBidders}
          />
        </div>
      </div>
    </div>
  )
}
