/**
 * MarketplacePage - Listing Browse / Marketplace.
 * Public and gated listing index with search, filters, sort, grid, watch/join CTAs.
 */

import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Gavel } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useMarketplaceList, useWatchStatus, useToggleWatch, useSubscriptionActive } from '@/hooks/use-marketplace'
import {
  SearchBar,
  FilterPanel,
  ListingCard,
  ViewToggle,
  Pagination,
  SavedSearchesBar,
  SubscriptionGatePrompt,
  type ViewMode,
} from '@/components/marketplace'
import type { ListingFilters, ListingSortOption } from '@/types/marketplace'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'

const SORT_OPTIONS: { value: ListingSortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
]

const LIMIT = 24

function parseFiltersFromSearchParams(params: URLSearchParams): ListingFilters {
  return {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    condition: params.get('condition') ?? undefined,
    location: params.get('location') ?? undefined,
    priceMin: params.get('priceMin') ? Number(params.get('priceMin')) : undefined,
    priceMax: params.get('priceMax') ? Number(params.get('priceMax')) : undefined,
  }
}

function filtersToSearchParams(f: ListingFilters): Record<string, string> {
  const out: Record<string, string> = {}
  if (f.q) out.q = f.q
  if (f.category) out.category = f.category
  if (f.condition) out.condition = f.condition
  if (f.location) out.location = f.location
  if (f.priceMin != null) out.priceMin = String(f.priceMin)
  if (f.priceMax != null) out.priceMax = String(f.priceMax)
  return out
}

export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const filters = useMemo(
    () => parseFiltersFromSearchParams(searchParams),
    [searchParams]
  )
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const sort = (searchParams.get('sort') as ListingSortOption) || 'newest'
  const viewMode = (searchParams.get('view') as ViewMode) || 'grid'

  const setFilters = useCallback(
    (next: ListingFilters) => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev)
        p.set('page', '1')
        Object.entries(filtersToSearchParams(next)).forEach(([k, v]) =>
          p.set(k, v)
        )
        Object.keys(parseFiltersFromSearchParams(prev)).forEach((k) => {
          if (!(k in next) || (next as Record<string, unknown>)[k] == null) {
            p.delete(k)
          }
        })
        return p
      })
    },
    [setSearchParams]
  )

  const setPage = useCallback(
    (p: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(Math.max(1, p)))
        return next
      })
    },
    [setSearchParams]
  )

  const setSort = useCallback(
    (s: ListingSortOption) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('sort', s)
        next.set('page', '1')
        return next
      })
    },
    [setSearchParams]
  )

  const setViewMode = useCallback(
    (v: ViewMode) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev)
        next.set('view', v)
        return next
      })
    },
    [setSearchParams]
  )

  const { data: listings, total, isLoading } = useMarketplaceList(
    filters,
    page,
    LIMIT,
    sort
  )
  const { data: isSubscribed = false } = useSubscriptionActive()
  const listingIds = useMemo(
    () => (listings ?? []).map((l) => l.id).filter(Boolean),
    [listings]
  )
  const { data: watchStatus = {} } = useWatchStatus(listingIds)
  const toggleWatchMutation = useToggleWatch()

  const handleWatch = useCallback(
    (listingId: string) => {
      if (!user) {
        toast.error('Sign in to add to watchlist')
        return
      }
      if (!isSubscribed) {
        toast.error('Subscribe to add items to your watchlist')
        return
      }
      toggleWatchMutation.mutate(listingId, {
        onSuccess: (res) => {
          toast.success(res.watching ? 'Added to watchlist' : 'Removed from watchlist')
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed'),
      })
    },
    [user, isSubscribed, toggleWatchMutation]
  )

  const safeListings = Array.isArray(listings) ? listings : []

  return (
    <div className="container space-y-6 px-4 py-8 md:px-6 lg:space-y-8">
      <div className="animate-in-up">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Marketplace
        </h1>
        <p className="mt-1 text-muted-foreground">
          Discover physical assets available for auction. Subscribe to join bids and watch items.
        </p>
      </div>

      {user && !isSubscribed && (
        <SubscriptionGatePrompt variant="card" className="animate-in-up" />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <SearchBar
            value={filters.q ?? ''}
            onChange={(v) => setFilters({ ...filters, q: v || undefined })}
            onSelect={(item) => {
              if (item.listingId) {
                setFilters({ ...filters, q: item.text })
              }
            }}
            placeholder="Search by keyword, identifier, location..."
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SavedSearchesBar
            currentFilters={filters}
            onApplyFilters={setFilters}
            isAuthenticated={!!user}
          />
          <ViewToggle value={viewMode} onChange={setViewMode} showMap={false} />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as ListingSortOption)}
            className="h-10 rounded-xl border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Sort by"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FilterPanel filters={filters} onChange={setFilters} />
        </aside>

        <div className="min-w-0 space-y-6">
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-2xl" />
              ))}
            </div>
          ) : safeListings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 py-16 text-center">
              <Gavel className="h-16 w-16 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No listings yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Check back soon or create an account to list your assets.
              </p>
              <Button asChild className="mt-6">
                <Link to="/auth?mode=signup">Get Started</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {safeListings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isSubscribed={isSubscribed}
                    isWatching={watchStatus[listing.id] === true}
                    onWatch={user ? handleWatch : undefined}
                  />
                ))}
              </div>
              <Pagination
                page={page}
                total={total}
                limit={LIMIT}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>

      <div className="lg:hidden">
        <FilterPanel filters={filters} onChange={setFilters} />
      </div>
    </div>
  )
}
