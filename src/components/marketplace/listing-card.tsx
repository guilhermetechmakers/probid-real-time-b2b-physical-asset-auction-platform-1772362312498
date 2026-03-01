/**
 * ListingCard - Thumbnail, title, specs, status badge, price, time remaining, Watch/Join CTA.
 */

import { Link } from 'react-router-dom'
import { MapPin, Clock, Gavel, Eye, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatTimeRemaining } from '@/lib/utils'
import type { MarketplaceListing } from '@/types/marketplace'

function formatRemaining(seconds?: number): string {
  if (seconds == null || seconds <= 0) return '—'
  return formatTimeRemaining(seconds)
}

interface ListingCardProps {
  listing: MarketplaceListing
  isSubscribed?: boolean
  isWatching?: boolean
  onWatch?: (listingId: string) => void
  className?: string
}

export function ListingCard({
  listing,
  isSubscribed = false,
  isWatching = false,
  onWatch,
  className,
}: ListingCardProps) {
  const imageUrl = listing.thumbnailUrl ?? listing.imageUrls?.[0]
  const title = listing.title ?? 'Untitled Asset'
  const isLive = listing.status === 'live' || listing.auction?.status === 'active'
  const remainingTime = listing.auction?.remainingTime

  return (
    <Card
      className={cn(
        'group overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/30',
        className
      )}
    >
      <Link to={`/listing/${listing.id}`} className="block">
        <div className="relative aspect-[4/3] bg-[rgb(var(--secondary))]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Gavel className="h-12 w-12" />
            </div>
          )}
          <Badge
            variant={isLive ? 'default' : 'secondary'}
            className="absolute right-2 top-2"
          >
            {isLive ? 'LIVE' : listing.status === 'scheduled' ? 'UPCOMING' : listing.status?.toUpperCase() ?? '—'}
          </Badge>
        </div>
      </Link>
      <CardContent className="flex flex-1 flex-col p-4 text-left">
        <Link to={`/listing/${listing.id}`}>
          <h3 className="font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-primary">
            {title}
          </h3>
        </Link>
        {(listing.category ?? listing.identifier) != null && (
          <p className="mt-1 text-xs text-muted-foreground">
            {[listing.category, listing.identifier].filter(Boolean).join(' • ')}
          </p>
        )}
        {listing.location != null && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            {listing.location}
          </p>
        )}
        {remainingTime != null && remainingTime > 0 && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 shrink-0" />
            {formatRemaining(remainingTime)}
          </p>
        )}
        <div className="mt-4 flex flex-1 items-end justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Current bid</p>
            <p className="text-lg font-bold text-primary">
              {(listing.currentBid ?? listing.price ?? listing.reservePrice ?? listing.startingPrice) != null
                ? formatCurrency(
                    listing.currentBid ?? listing.price ?? listing.reservePrice ?? listing.startingPrice ?? 0
                  )
                : '—'}
            </p>
          </div>
          <div className="flex gap-2">
            {onWatch != null && (
              <Button
                variant="outline"
                size="icon-sm"
                onClick={(e) => {
                  e.preventDefault()
                  onWatch(listing.id)
                }}
                className={cn(
                  'shrink-0 transition-colors',
                  isWatching && 'border-primary bg-primary/10 text-primary'
                )}
                aria-label={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                <Heart
                  className={cn('h-4 w-4', isWatching && 'fill-current')}
                />
              </Button>
            )}
            <Button asChild size="sm" className="shrink-0 hover:shadow-accent-glow">
              <Link to={`/listing/${listing.id}`}>
                {isSubscribed && isLive ? (
                  <>
                    <Gavel className="mr-1 h-3.5 w-3.5" />
                    Join Bid
                  </>
                ) : (
                  <>
                    <Eye className="mr-1 h-3.5 w-3.5" />
                    View
                  </>
                )}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
