/**
 * useMarketplace - Data fetching and state for Listing Browse page.
 * Exports: useMarketplaceList, useWatchStatus, useToggleWatch, useSubscriptionActive, useMarketplace
 */

import { useSearchParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { fetchListings, toggleWatch, getWatchStatus } from '@/api/marketplace'
import { fetchBuyerDashboard } from '@/api/buyer'
import type { ListingFilters, ListingSortOption } from '@/types/marketplace'

const MARKETPLACE_KEYS = {
  all: ['marketplace'] as const,
  listings: (filters: ListingFilters, page: number, limit: number, sort: ListingSortOption) =>
    [...MARKETPLACE_KEYS.all, 'listings', filters, page, limit, sort] as const,
  watchStatus: (ids: string[]) => [...MARKETPLACE_KEYS.all, 'watch', ids] as const,
  subscription: () => [...MARKETPLACE_KEYS.all, 'subscription'] as const,
}

export function useMarketplaceList(
  filters: ListingFilters,
  page: number,
  limit: number,
  sort: ListingSortOption
) {
  const query = useQuery({
    queryKey: MARKETPLACE_KEYS.listings(filters, page, limit, sort),
    queryFn: () => fetchListings(filters, page, limit, sort),
    placeholderData: (prev) => prev,
  })
  const data = Array.isArray(query.data?.data) ? query.data.data : []
  const total = typeof query.data?.total === 'number' ? query.data.total : 0
  return { data, total, isLoading: query.isLoading, isError: query.isError, error: query.error }
}

export function useWatchStatus(listingIds: string[]) {
  const query = useQuery({
    queryKey: MARKETPLACE_KEYS.watchStatus(listingIds),
    queryFn: () => getWatchStatus(listingIds),
    enabled: listingIds.length > 0,
  })
  return { data: query.data ?? {} }
}

export function useToggleWatch() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: toggleWatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.all })
      queryClient.invalidateQueries({ queryKey: ['buyer', 'dashboard'] })
    },
    onError: (err: Error) => {
      if (err?.message?.includes('Not authenticated')) {
        toast.error('Sign in to add listings to your watchlist')
      } else {
        toast.error('Failed to update watchlist')
      }
    },
  })
}

export function useSubscriptionActive() {
  const query = useQuery({
    queryKey: ['buyer', 'dashboard'],
    queryFn: fetchBuyerDashboard,
    staleTime: 60_000,
  })
  const sub = query.data?.subscription ?? null
  return { data: sub?.status === 'active' }
}

function parseFiltersFromSearchParams(params: URLSearchParams): ListingFilters {
  return {
    q: params.get('q') ?? undefined,
    category: params.get('category') ?? undefined,
    condition: params.get('condition') ?? undefined,
    location: params.get('location') ?? undefined,
    priceMin: (() => {
      const v = params.get('priceMin')
      if (v == null || v === '') return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : n
    })(),
    priceMax: (() => {
      const v = params.get('priceMax')
      if (v == null || v === '') return undefined
      const n = Number(v)
      return Number.isNaN(n) ? undefined : n
    })(),
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

export function useMarketplace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(96, Math.max(12, Number(searchParams.get('limit')) || 24))
  const sort = (searchParams.get('sort') as ListingSortOption) || 'newest'
  const filters = parseFiltersFromSearchParams(searchParams)

  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(updates)) {
      if (v === undefined || v === '' || v === null) next.delete(k)
      else next.set(k, String(v))
    }
    setSearchParams(next, { replace: true })
  }

  const setFilters = (f: ListingFilters) => {
    const params = filtersToSearchParams(f)
    const next = new URLSearchParams(searchParams)
    next.delete('page')
    for (const [k, v] of Object.entries(params)) {
      if (v) next.set(k, v)
      else next.delete(k)
    }
    setSearchParams(next, { replace: true })
  }

  const setPage = (p: number) => updateParams({ page: p })
  const setLimit = (l: number) => updateParams({ limit: l, page: 1 })
  const setSort = (s: ListingSortOption) => updateParams({ sort: s, page: 1 })

  const listingsQuery = useQuery({
    queryKey: MARKETPLACE_KEYS.listings(filters, page, limit, sort),
    queryFn: () => fetchListings(filters, page, limit, sort),
    placeholderData: (prev) => prev,
  })

  const buyerQuery = useQuery({
    queryKey: ['buyer', 'dashboard'],
    queryFn: fetchBuyerDashboard,
    staleTime: 60_000,
  })

  const listings = Array.isArray(listingsQuery.data?.data) ? listingsQuery.data.data : []
  const total = typeof listingsQuery.data?.total === 'number' ? listingsQuery.data.total : 0
  const subscription = buyerQuery.data?.subscription ?? null
  const isSubscribed = subscription?.status === 'active'
  const savedFilters = Array.isArray(buyerQuery.data?.savedFilters) ? buyerQuery.data.savedFilters : []

  const listingIds = listings.map((l) => l.id).filter(Boolean)
  const watchStatusQuery = useQuery({
    queryKey: MARKETPLACE_KEYS.watchStatus(listingIds),
    queryFn: () => getWatchStatus(listingIds),
    enabled: listingIds.length > 0,
  })
  const watchStatusMap = watchStatusQuery.data ?? {}

  const watchMutation = useMutation({
    mutationFn: toggleWatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MARKETPLACE_KEYS.watchStatus(listingIds) })
      queryClient.invalidateQueries({ queryKey: ['buyer', 'dashboard'] })
    },
    onError: (err: Error) => {
      if (err?.message?.includes('Not authenticated')) {
        toast.error('Sign in to add listings to your watchlist')
      } else {
        toast.error('Failed to update watchlist')
      }
    },
  })

  return {
    filters,
    setFilters,
    page,
    setPage,
    limit,
    setLimit,
    sort,
    setSort,
    listings,
    total,
    isSubscribed,
    savedFilters,
    watchStatusMap,
    isLoading: listingsQuery.isLoading,
    isError: listingsQuery.isError,
    error: listingsQuery.error,
    onWatch: (id: string) => watchMutation.mutate(id),
    isWatching: (id: string) => Boolean(watchStatusMap[id]),
    updateSavedFilters: (f: typeof savedFilters) => {
      queryClient.setQueryData(['buyer', 'dashboard'], (old: unknown) => {
        const prev = old as { savedFilters?: unknown[] } | undefined
        return prev ? { ...prev, savedFilters: f } : old
      })
    },
  }
}
