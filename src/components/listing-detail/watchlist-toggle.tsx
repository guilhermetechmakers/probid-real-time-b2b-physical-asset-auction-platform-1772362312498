/**
 * WatchlistToggle - Add/remove listing from watchlist with notification preference toggles.
 */
import { Heart, Bell, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useWatchlistPrefs, useUpdateWatchlistPrefs } from '@/hooks/use-listing-detail'

export interface WatchlistToggleProps {
  listingId: string
  isWatching?: boolean
  /** @deprecated Use isWatching */
  watching?: boolean
  onToggle: () => void
  isLoading?: boolean
  isToggling?: boolean
  isAuthenticated?: boolean
  className?: string
}

export function WatchlistToggle({
  listingId,
  isWatching: isWatchingProp,
  watching,
  onToggle,
  isLoading = false,
  isToggling = false,
  isAuthenticated = false,
  className,
}: WatchlistToggleProps) {
  const isWatching = isWatchingProp ?? watching ?? false
  const loading = isLoading || isToggling
  const { data: prefsData } = useWatchlistPrefs(isWatching ? listingId : undefined)
  const updatePrefsMutation = useUpdateWatchlistPrefs(listingId)

  const prefs = prefsData?.prefs ?? {
    outbid: true,
    auctionStarting: true,
    inspectionScheduled: false,
  }

  const handlePrefChange = (
    key: 'outbid' | 'auctionStarting' | 'inspectionScheduled',
    value: boolean
  ) => {
    updatePrefsMutation.mutate({ prefs: { [key]: value } })
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        disabled={loading}
        className={cn(
          'transition-colors hover:shadow-accent-glow',
          isWatching && 'border-primary bg-primary/10 text-primary'
        )}
        aria-label={isWatching ? 'Remove from watchlist' : 'Add to watchlist'}
      >
        <Heart
          className={cn('mr-1.5 h-4 w-4', isWatching && 'fill-current')}
        />
        {isWatching ? 'Watching' : 'Watch'}
      </Button>
      {isWatching && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="hover:shadow-accent-glow"
              aria-label="Notification preferences"
            >
              <Bell className="mr-1.5 h-4 w-4" />
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-4">
            <p className="mb-3 text-sm font-medium">Notification preferences</p>
            <div className="space-y-4">
              <DropdownMenuItem asChild>
                <div className="flex cursor-default items-center justify-between gap-4">
                  <Label htmlFor="pref-outbid" className="cursor-pointer text-sm">
                    When outbid
                  </Label>
                  <Switch
                    id="pref-outbid"
                    checked={prefs.outbid ?? true}
                    onCheckedChange={(v) => handlePrefChange('outbid', v)}
                    disabled={updatePrefsMutation.isPending}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className="flex cursor-default items-center justify-between gap-4">
                  <Label htmlFor="pref-auction" className="cursor-pointer text-sm">
                    Auction starting
                  </Label>
                  <Switch
                    id="pref-auction"
                    checked={prefs.auctionStarting ?? true}
                    onCheckedChange={(v) => handlePrefChange('auctionStarting', v)}
                    disabled={updatePrefsMutation.isPending}
                  />
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <div className="flex cursor-default items-center justify-between gap-4">
                  <Label htmlFor="pref-inspection" className="cursor-pointer text-sm">
                    Inspection scheduled
                  </Label>
                  <Switch
                    id="pref-inspection"
                    checked={prefs.inspectionScheduled ?? false}
                    onCheckedChange={(v) => handlePrefChange('inspectionScheduled', v)}
                    disabled={updatePrefsMutation.isPending}
                  />
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}
