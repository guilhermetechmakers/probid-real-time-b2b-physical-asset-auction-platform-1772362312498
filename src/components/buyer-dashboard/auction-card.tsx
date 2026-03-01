/**
 * AuctionCard - Displays asset thumbnail, title, category, location, scheduled time, current bid, status tag.
 */

import { Link } from 'react-router-dom'
import { MapPin, Calendar, Gavel } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency, formatDateTime } from '@/lib/utils'
import type { BuyerAuction } from '@/types'

interface AuctionCardProps {
  auction: BuyerAuction
  className?: string
}

export function AuctionCard({ auction, className }: AuctionCardProps) {
  const imageUrl = auction.listing?.imageUrls?.[0]
  const title = auction.listing?.title ?? 'Untitled Asset'
  const category = auction.listing?.category
  const location = auction.listing?.location
  const isLive = auction.status === 'live'

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/30',
        className
      )}
    >
      <div className="flex flex-col sm:flex-row overflow-hidden">
        <div className="relative h-32 w-full sm:w-40 shrink-0 bg-[rgb(var(--secondary))]">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Gavel className="h-4 w-4" />
            </div>
          )}
          <Badge
            variant={isLive ? 'success' : 'secondary'}
            className="absolute right-2 top-2"
          >
            {isLive ? 'LIVE' : 'UPCOMING'}
          </Badge>
        </div>
        <CardContent className="flex flex-1 flex-col justify-between p-4 text-left">
          <div>
            <h3 className="font-semibold text-foreground line-clamp-2">{title}</h3>
            {category != null && (
              <p className="mt-1 text-xs text-muted-foreground">{category}</p>
            )}
            {location != null && (
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {location}
              </p>
            )}
            <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formatDateTime(auction.scheduledAt)}
            </p>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Current bid</p>
              <p className="text-lg font-bold text-primary">
                {auction.currentBid != null ? formatCurrency(auction.currentBid) : '—'}
              </p>
            </div>
            <Button asChild size="sm" className="shrink-0 hover:shadow-accent-glow">
              <Link to={`/listing/${auction.listingId}`}>
                {isLive ? 'Join' : 'View'}
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
