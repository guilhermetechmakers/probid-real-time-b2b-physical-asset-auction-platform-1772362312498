/**
 * WatchlistPanel - List of saved assets with alert toggles and quick actions.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Bell, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, formatCurrency } from '@/lib/utils'
import { toggleWatchlistAlert } from '@/api/buyer'
import { toast } from 'sonner'
import type { WatchlistItem } from '@/types'

interface WatchlistPanelProps {
  items: WatchlistItem[]
  isLoading?: boolean
  onAlertToggle?: (id: string, enabled: boolean) => void
  className?: string
}

export function WatchlistPanel({
  items,
  isLoading = false,
  onAlertToggle,
  className,
}: WatchlistPanelProps) {
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const safeItems = Array.isArray(items) ? items : []

  const handleToggle = async (id: string, enabled: boolean) => {
    setTogglingId(id)
    try {
      await toggleWatchlistAlert(id, enabled)
      onAlertToggle?.(id, enabled)
      toast.success(enabled ? 'Alerts enabled' : 'Alerts disabled')
    } catch {
      toast.error('Failed to update alert settings')
    } finally {
      setTogglingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card className={cn('rounded-2xl border border-[rgb(var(--border))] shadow-card', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Heart className="h-5 w-5 text-primary" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
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
          <Heart className="h-5 w-5 text-primary" />
          Watchlist
          <span className="text-sm font-normal text-muted-foreground">({safeItems.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Heart className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-2 font-medium text-muted-foreground">No saved items</p>
            <p className="text-sm text-muted-foreground">
              Add listings from the marketplace to your watchlist
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/marketplace">Browse Marketplace</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {safeItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-3 transition-colors hover:border-primary/20"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-[rgb(var(--muted))]">
                  {item.listing?.imageUrls?.[0] != null ? (
                    <img
                      src={item.listing.imageUrls[0]}
                      alt={item.listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/listing/${item.listingId}`}
                    className="font-medium text-foreground hover:underline line-clamp-1"
                  >
                    {item.listing?.title ?? 'Untitled'}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {item.listing?.currentBid != null
                      ? formatCurrency(item.listing.currentBid)
                      : 'No bids'}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Bell className="h-3 w-3" />
                    Alerts
                  </span>
                  <Switch
                    checked={item.alertEnabled}
                    disabled={togglingId === item.id}
                    onCheckedChange={(checked) => handleToggle(item.id, checked)}
                    aria-label={`Toggle alerts for ${item.listing?.title ?? 'item'}`}
                  />
                </div>
                <Button asChild variant="ghost" size="icon-sm">
                  <Link to={`/listing/${item.listingId}`} aria-label="View listing">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
