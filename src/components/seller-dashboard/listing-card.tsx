import { Link } from 'react-router-dom'
import { Edit, Eye, X, MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import type { Listing } from '@/types'

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
  draft: 'secondary',
  pending_review: 'warning',
  approved: 'default',
  scheduled: 'default',
  live: 'success',
  in_auction: 'success',
  sold: 'success',
  unsold: 'destructive',
  rejected: 'destructive',
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    pending_review: 'Pending Review',
    approved: 'Approved',
    scheduled: 'Scheduled',
    live: 'In Auction',
    in_auction: 'In Auction',
    sold: 'Sold',
    unsold: 'Unsold',
    rejected: 'Rejected',
  }
  return labels[status] ?? status
}

interface ListingCardProps {
  listing: Listing
  onCancel?: (id: string) => void
}

export function ListingCard({ listing, onCancel }: ListingCardProps) {
  const photos = listing.imageUrls ?? []
  const thumbnails = photos.slice(0, 4)
  const statusVariant = STATUS_VARIANTS[listing.status] ?? 'secondary'

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="grid gap-4 md:grid-cols-[140px_1fr]">
        <div className="relative aspect-square bg-[rgb(var(--muted))] md:aspect-auto md:h-full md:min-h-[120px]">
          <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-full">
            {(thumbnails.length > 0 ? thumbnails : [null, null, null, null]).map((url, i) => (
              <div
                key={url ?? i}
                className="bg-[rgb(var(--muted))] flex items-center justify-center overflow-hidden"
              >
                {url ? (
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-[rgb(var(--border))]/50" />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col p-4">
          <CardHeader className="flex flex-row items-start justify-between gap-2 p-0">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-foreground">{listing.title}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{listing.identifier || '—'}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant={statusVariant}>{getStatusLabel(listing.status)}</Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="Actions">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to={`/listing/${listing.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/dashboard/seller/create?edit=${listing.id}`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  {['draft', 'pending_review'].includes(listing.status) && onCancel && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onCancel(listing.id)}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col justify-end gap-2 p-0 pt-2">
            <div className="flex flex-wrap gap-4 text-sm">
              {listing.reservePrice != null && (
                <span className="text-muted-foreground">
                  Reserve: <strong className="text-foreground">{formatCurrency(listing.reservePrice)}</strong>
                </span>
              )}
              {listing.currentBid != null && (
                <span className="text-muted-foreground">
                  High bid: <strong className="text-probid-accent">{formatCurrency(listing.currentBid)}</strong>
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to={`/listing/${listing.id}`}>
                  <Eye className="mr-1.5 h-4 w-4" />
                  View
                </Link>
              </Button>
              {['draft', 'pending_review'].includes(listing.status) && (
                <Button size="sm" asChild>
                  <Link to={`/dashboard/seller/create?edit=${listing.id}`}>
                    <Edit className="mr-1.5 h-4 w-4" />
                    Edit
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </div>
    </Card>
  )
}
