/**
 * React Query hooks for Seller Dashboard data.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchSellerListings,
  createListing,
  updateListing,
  uploadListingPhotos,
  fetchSellerAuctions,
  fetchSellerInspections,
  fetchRecentSales,
  fetchNotifications,
  fetchEnrichmentResults,
  fetchSellerMetrics,
} from '@/api/seller'

export const sellerKeys = {
  all: ['seller'] as const,
  listings: (status?: string) => [...sellerKeys.all, 'listings', status] as const,
  auctions: (listingId?: string) => [...sellerKeys.all, 'auctions', listingId] as const,
  inspections: () => [...sellerKeys.all, 'inspections'] as const,
  sales: () => [...sellerKeys.all, 'sales'] as const,
  notifications: () => [...sellerKeys.all, 'notifications'] as const,
  enrichment: (listingId: string) => [...sellerKeys.all, 'enrichment', listingId] as const,
  metrics: () => [...sellerKeys.all, 'metrics'] as const,
}

export function useSellerListings(status?: string) {
  return useQuery({
    queryKey: sellerKeys.listings(status),
    queryFn: () => fetchSellerListings(status),
  })
}

export function useCreateListing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerKeys.listings() })
      qc.invalidateQueries({ queryKey: sellerKeys.metrics() })
    },
  })
}

export function useUpdateListing() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateListing>[1] }) =>
      updateListing(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerKeys.all })
    },
  })
}

export function useUploadListingPhotos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ listingId, photos }: { listingId: string; photos: Parameters<typeof uploadListingPhotos>[1] }) =>
      uploadListingPhotos(listingId, photos),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: sellerKeys.listings() })
    },
  })
}

export function useSellerAuctions(listingId?: string) {
  return useQuery({
    queryKey: sellerKeys.auctions(listingId),
    queryFn: () => fetchSellerAuctions(listingId ?? undefined),
  })
}

export function useSellerInspections() {
  return useQuery({
    queryKey: sellerKeys.inspections(),
    queryFn: fetchSellerInspections,
  })
}

export function useRecentSales() {
  return useQuery({
    queryKey: sellerKeys.sales(),
    queryFn: fetchRecentSales,
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: sellerKeys.notifications(),
    queryFn: fetchNotifications,
  })
}

export function useEnrichmentResults(listingId: string) {
  return useQuery({
    queryKey: sellerKeys.enrichment(listingId),
    queryFn: () => fetchEnrichmentResults(listingId),
    enabled: Boolean(listingId),
  })
}

export function useSellerMetrics() {
  return useQuery({
    queryKey: sellerKeys.metrics(),
    queryFn: fetchSellerMetrics,
  })
}
