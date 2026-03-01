/**
 * React Query hooks for Edit / Manage Listing.
 * All array state initialized with []; guards for null/undefined.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchListingForEdit,
  updateListing,
  addOpsNote,
  scheduleAuction,
  archiveListing,
  resubmitForReview,
  replacePhoto,
  deletePhoto,
  reorderPhotos,
  runQA,
  retryEnrichment,
} from '@/api/listing-edit'
import type { ListingEditFormData } from '@/types/listing-edit'

export const listingEditKeys = {
  all: ['listing-edit'] as const,
  listing: (id: string | null) => [...listingEditKeys.all, 'listing', id ?? ''] as const,
}

export function useListing(listingId: string | null) {
  return useQuery({
    queryKey: listingEditKeys.listing(listingId),
    queryFn: () => (listingId ? fetchListingForEdit(listingId) : Promise.resolve(null)),
    enabled: Boolean(listingId),
  })
}

export function useUpdateListing(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<ListingEditFormData>) =>
      listingId ? updateListing(listingId, payload) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useAddOpsNote(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (note: string) =>
      listingId ? addOpsNote(listingId, note) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useScheduleAuction(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (window: { start: string; end: string }) =>
      listingId ? scheduleAuction(listingId, window) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useArchiveListing(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      listingId ? archiveListing(listingId) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useResubmitForReview(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      listingId ? resubmitForReview(listingId) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useReplacePhoto(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ photoId, file }: { photoId: string; file: File }) =>
      listingId ? replacePhoto(listingId, photoId, file) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useDeletePhoto(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoId: string) =>
      listingId ? deletePhoto(listingId, photoId) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useReorderPhotos(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoIds: string[]) =>
      listingId ? reorderPhotos(listingId, photoIds) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useRunQA(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (photoIds?: string[]) =>
      listingId ? runQA(listingId, photoIds) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}

export function useRetryEnrichment(listingId: string | null) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      listingId ? retryEnrichment(listingId) : Promise.reject(new Error('No listing ID')),
    onSuccess: () => {
      if (listingId) qc.invalidateQueries({ queryKey: listingEditKeys.listing(listingId) })
    },
  })
}
