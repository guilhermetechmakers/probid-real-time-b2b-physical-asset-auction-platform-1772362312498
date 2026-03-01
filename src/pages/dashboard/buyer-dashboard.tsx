/**
 * BuyerDashboardPage - Role-specific, gated Buyer Dashboard.
 * Combines: Available Auctions, Watchlist, Bidding History, Subscription, Saved Filters, KYC.
 */

import { useState, useMemo } from 'react'
import { Calendar, Heart, Gavel, CreditCard } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useBuyerDashboard } from '@/hooks/use-buyer-dashboard'
import {
  AuctionList,
  WatchlistPanel,
  BiddingHistoryPanel,
  SubscriptionStatusCard,
  SavedFiltersPanel,
  KYCVerificationPanel,
  KYCBadge,
  GatingPanel,
  DataVizBar,
  FiltersPanel,
  type FilterValues,
} from '@/components/buyer-dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function BuyerDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, refetch } = useBuyerDashboard()
  const [filterValues, setFilterValues] = useState<FilterValues>({})

  const hasActiveSubscription = user?.subscriptionStatus === 'active'
  const isKycVerified = user?.kycStatus === 'approved'

  const auctions = data?.auctions ?? []
  const watchlist = data?.watchlist ?? []
  const biddingHistory = data?.biddingHistory ?? []
  const subscription = data?.subscription ?? null
  const savedFilters = data?.savedFilters ?? []
  const verificationStatus = data?.verificationStatus ?? {
    status: 'pending' as const,
    adminApproved: false,
  }

  const filteredAuctions = useMemo(() => {
    if (Object.keys(filterValues).length === 0) return auctions
    return (auctions ?? []).filter((a) => {
      const listing = a.listing
      if (!listing) return true
      if (filterValues.category != null && listing.category !== filterValues.category) return false
      if (filterValues.location != null && listing.location !== filterValues.location) return false
      if (filterValues.condition != null && listing.condition !== filterValues.condition) return false
      const bid = a.currentBid ?? 0
      if (filterValues.priceMin != null && bid < filterValues.priceMin) return false
      if (filterValues.priceMax != null && bid > filterValues.priceMax) return false
      return true
    })
  }, [auctions, filterValues])

  const activeCount = (auctions ?? []).filter((a) => a.status === 'live').length
  const upcomingCount = (auctions ?? []).filter((a) => a.status === 'scheduled').length

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Buyer Dashboard
        </h1>
        <p className="mt-1 text-muted-foreground">
          Discover auctions and manage your bidding activity
        </p>
      </div>

      <GatingPanel
        needsSubscription={!hasActiveSubscription}
        needsKyc={!isKycVerified}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Auctions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCount}</div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlist.length}</div>
            <p className="text-xs text-muted-foreground">Saved items</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground">Live auctions</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all hover:shadow-card-hover">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">
                {subscription != null ? subscription.status : '—'}
              </span>
              <KYCBadge status={verificationStatus} size="sm" />
            </div>
            <p className="text-xs text-muted-foreground">Status</p>
          </CardContent>
        </Card>
      </div>

      <DataVizBar
        value={activeCount}
        max={Math.max(auctions.length, 1)}
        label="Live vs Upcoming"
        showActive={activeCount > 0}
      />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="mb-4 text-lg font-semibold">Upcoming Auctions</h2>
            <AuctionList auctions={filteredAuctions} isLoading={isLoading} />
          </section>
        </div>
        <div className="space-y-8">
          <SubscriptionStatusCard subscription={subscription} />
          <KYCVerificationPanel status={verificationStatus} />
          <FiltersPanel
            values={filterValues}
            onChange={setFilterValues}
          />
          <SavedFiltersPanel
            filters={savedFilters}
            onApply={(f) => setFilterValues(f.filters)}
            onFiltersChange={() => refetch()}
          />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <WatchlistPanel
          items={watchlist}
          isLoading={isLoading}
          onAlertToggle={() => refetch()}
        />
        <BiddingHistoryPanel items={biddingHistory} isLoading={isLoading} />
      </div>
    </div>
  )
}
