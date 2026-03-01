/**
 * useListingDetail - Data fetching for Listing Detail & Auction page.
 */
import { useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import {
  fetchListingDetail,
  fetchBidHistory,
  placeBid,
  setupProxyBid,
  toggleWatchlist,
  getWatchStatus,
  getWatchlistPrefs,
  updateWatchlistPrefs,
  getMinBidIncrement,
} from '@/api/listing-detail'
import type { WatchlistPrefs } from '@/api/listing-detail'

const LISTING_DETAIL_KEYS = {
  detail: (id: string) => ['listing-detail', id] as const,
  bids: (id: string) => ['listing-detail', id, 'bids'] as const,
  watch: (id: string) => ['listing-detail', id, 'watch'] as const,
  watchPrefs: (id: string) => ['listing-detail', id, 'watch-prefs'] as const,
}

export function useListingDetail(id: string | undefined) {
  const query = useQuery({
    queryKey: LISTING_DETAIL_KEYS.detail(id ?? ''),
    queryFn: () => fetchListingDetail(id!),
    enabled: Boolean(id?.trim()),
  })
  const listing = query.data ?? null
  return {
    listing,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useBidHistory(listingId: string | undefined) {
  const query = useQuery({
    queryKey: LISTING_DETAIL_KEYS.bids(listingId ?? ''),
    queryFn: () => fetchBidHistory(listingId!),
    enabled: Boolean(listingId?.trim()),
  })
  const bids = Array.isArray(query.data) ? query.data : []
  return {
    bids,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

/**
 * useBidsRealtime - Subscribe to real-time bid updates for an auction.
 * Use in Live Auction Room to get instant bid updates.
 */
export function useBidsRealtime(
  listingId: string | undefined,
  auctionId: string | undefined
) {
  const queryClient = useQueryClient()

  const invalidate = useCallback(() => {
    if (!listingId) return
    queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.detail(listingId) })
    queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.bids(listingId) })
  }, [queryClient, listingId])

  useEffect(() => {
    if (!auctionId?.trim()) return

    const channel = supabase
      .channel(`bids-${auctionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `auction_id=eq.${auctionId}`,
        },
        () => {
          invalidate()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [auctionId, invalidate])
}

export function usePlaceBid(listingId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      amount,
      isProxy,
      proxyMax,
    }: {
      amount: number
      isProxy?: boolean
      proxyMax?: number
    }) => placeBid(listingId!, amount, isProxy, proxyMax),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Bid placed successfully')
        queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.detail(listingId ?? '') })
        queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.bids(listingId ?? '') })
      } else {
        toast.error(result.error ?? 'Failed to place bid')
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Failed to place bid')
    },
  })
}

export function useWatchStatus(listingId: string | undefined) {
  const query = useQuery({
    queryKey: LISTING_DETAIL_KEYS.watch(listingId ?? ''),
    queryFn: () => getWatchStatus(listingId!),
    enabled: Boolean(listingId?.trim()),
  })
  return { isWatching: query.data === true, isLoading: query.isLoading, refetch: query.refetch }
}

export function useToggleWatch(listingId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => toggleWatchlist(listingId!),
    onSuccess: (result) => {
      toast.success(result.watching ? 'Added to watchlist' : 'Removed from watchlist')
      queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.watch(listingId ?? '') })
      queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.watchPrefs(listingId ?? '') })
      queryClient.invalidateQueries({ queryKey: ['marketplace'] })
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Failed to update watchlist')
    },
  })
}

export function useWatchlistPrefs(listingId: string | undefined) {
  return useQuery({
    queryKey: LISTING_DETAIL_KEYS.watchPrefs(listingId ?? ''),
    queryFn: () => getWatchlistPrefs(listingId!),
    enabled: Boolean(listingId?.trim()),
  })
}

export function useUpdateWatchlistPrefs(listingId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      prefs,
      alertEnabled,
    }: {
      prefs?: Partial<WatchlistPrefs>
      alertEnabled?: boolean
    }) => updateWatchlistPrefs(listingId!, prefs ?? {}, alertEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.watchPrefs(listingId ?? '') })
      toast.success('Notification preferences updated')
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Failed to update preferences')
    },
  })
}

export function useSetupProxyBid(listingId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (maxAmount: number) => setupProxyBid(listingId!, maxAmount),
    onSuccess: (result) => {
      if (result.success) {
        toast.success('Proxy bid set successfully')
        queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.detail(listingId ?? '') })
        queryClient.invalidateQueries({ queryKey: LISTING_DETAIL_KEYS.bids(listingId ?? '') })
      } else {
        toast.error(result.error ?? 'Failed to set proxy bid')
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Failed to set proxy bid')
    },
  })
}

export { getMinBidIncrement }
