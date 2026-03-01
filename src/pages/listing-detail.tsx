/**
 * ListingDetailPage - Full listing view: media, specs, AI QA, auction, bids, CTAs.
 */
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Gavel } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/contexts/auth-context'
import { useSubscriptionActive } from '@/hooks/use-marketplace'
import {
  useListingDetail,
  useBidHistory,
  useRelatedListings,
  usePlaceBid,
  useWatchStatus,
  useToggleWatch,
  getMinBidIncrement,
} from '@/hooks/use-listing-detail'
import {
  MediaGallery,
  SpecsPanel,
  AiQaReportPanel,
  AuctionSummaryCard,
  AuctionSchedulePanel,
  BidWidget,
  BidHistoryPanel,
  RelatedListingsPanel,
  WatchlistToggle,
  LiveCTAGroup,
} from '@/components/listing-detail'
import { ensureArray } from '@/lib/safe-utils'

export function ListingDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { listing, isLoading, isError } = useListingDetail(id)
  const { bids, isLoading: bidsLoading } = useBidHistory(id)
  const { listings: relatedListings, isLoading: relatedLoading } =
    useRelatedListings(id, listing?.category)
  const placeBidMutation = usePlaceBid(id)
  const { isWatching } = useWatchStatus(id)
  const toggleWatchMutation = useToggleWatch(id)
  const { data: isSubscribed = false } = useSubscriptionActive()

  const isAuthenticated = !!user
  const auction = listing?.auction ?? null
  const isLive = auction?.status === 'live'
  const isEnded = auction?.status === 'ended'
  const currentBid = listing?.currentBid ?? auction?.currentHighestBid ?? 0
  const minIncrement = getMinBidIncrement(currentBid)

  const handlePlaceBid = (amount: number, isProxy?: boolean, proxyMax?: number) => {
    if (!id) return
    placeBidMutation.mutate({ amount, isProxy, proxyMax })
  }

  const handleToggleWatch = () => {
    if (!id) return
    toggleWatchMutation.mutate()
  }

  if (isLoading || !listing) {
    return (
      <div className="container space-y-8 px-4 py-8 md:px-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="container flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
        <Gavel className="h-16 w-16 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-semibold">Listing not found</h2>
        <p className="mt-2 text-muted-foreground">
          This listing may have been removed or you may not have access.
        </p>
        <Button asChild className="mt-6">
          <Link to="/marketplace">Browse marketplace</Link>
        </Button>
      </div>
    )
  }

  const media = ensureArray(listing.media)
  const aiQa = listing.aiQa ?? null

  return (
    <div className="container space-y-8 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/marketplace">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to marketplace
          </Link>
        </Button>
        <WatchlistToggle
          listingId={listing.id}
          isWatching={isWatching}
          onToggle={handleToggleWatch}
          isToggling={toggleWatchMutation.isPending}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <MediaGallery
            media={media}
            imageUrls={listing.imageUrls ?? []}
          />

          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">
              {listing.title}
            </h1>
            {(listing.identifier ?? listing.category) != null && (
              <p className="mt-1 text-muted-foreground">
                {[listing.identifier, listing.category].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>

          <SpecsPanel
            specs={listing.specs}
            identifier={listing.identifier}
            provenance={listing.provenance}
            description={listing.description}
          />

          <AiQaReportPanel
            aiQa={aiQa && typeof aiQa === 'object' && 'confidence' in aiQa ? aiQa : undefined}
          />

          <BidHistoryPanel bids={bids} isLoading={bidsLoading} />
        </div>

        <div className="space-y-6">
          <AuctionSummaryCard
            auction={auction}
            currentBid={currentBid}
            reservePrice={listing.reservePrice}
            startingPrice={listing.startingPrice}
          />

          <AuctionSchedulePanel
            auction={auction}
            reservePrice={listing.reservePrice}
            currentBid={currentBid}
          />

          <div className="rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card">
            <h3 className="mb-4 font-semibold">Place a bid</h3>
            <BidWidget
              listingId={listing.id}
              currentBid={currentBid}
              reservePrice={listing.reservePrice}
              minIncrement={minIncrement}
              isLive={isLive}
              isEnded={isEnded}
              onPlaceBid={handlePlaceBid}
              isPlacing={placeBidMutation.isPending}
              isAuthenticated={isAuthenticated}
            />
          </div>

          <LiveCTAGroup
            listingId={listing.id}
            isLive={isLive}
            isEnded={isEnded}
            isAuthenticated={isAuthenticated}
            isSubscribed={isSubscribed}
          />
        </div>
      </div>

      <div className="mt-12">
        <RelatedListingsPanel
          listings={relatedListings}
          isLoading={relatedLoading}
        />
      </div>
    </div>
  )
}
