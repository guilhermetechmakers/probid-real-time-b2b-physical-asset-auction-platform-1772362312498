/**
 * React Query hooks for Intake Wizard.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createOrGetDraft,
  fetchDraft,
  updateDraft,
  triggerEnrichment,
  uploadDraftPhotos,
  triggerQA,
  submitDraft,
  fetchListingForEdit,
  rerunQA,
} from '@/api/intake'

export const intakeKeys = {
  all: ['intake'] as const,
  draft: (id: string) => [...intakeKeys.all, 'draft', id] as const,
  listing: (id: string) => [...intakeKeys.all, 'listing', id] as const,
}

export function useCreateOrGetDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createOrGetDraft,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: intakeKeys.draft(data.draftId) })
    },
  })
}

export function useDraft(draftId: string | null) {
  return useQuery({
    queryKey: intakeKeys.draft(draftId ?? ''),
    queryFn: () => (draftId ? fetchDraft(draftId) : Promise.resolve(null)),
    enabled: Boolean(draftId),
  })
}

export function useUpdateDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ draftId, payload }: { draftId: string; payload: Parameters<typeof updateDraft>[1] }) =>
      updateDraft(draftId, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: intakeKeys.draft(variables.draftId) })
    },
  })
}

export function useTriggerEnrichment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ draftId, identifier }: { draftId: string; identifier: string }) =>
      triggerEnrichment(draftId, identifier),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: intakeKeys.draft(variables.draftId) })
    },
  })
}

export function useUploadDraftPhotos() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      draftId,
      files,
    }: {
      draftId: string
      files: Array<{ file: File; angle: string }>
    }) => uploadDraftPhotos(draftId, files),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: intakeKeys.draft(variables.draftId) })
    },
  })
}

export function useTriggerQA() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draftId: string) => triggerQA(draftId),
    onSuccess: (_, draftId) => {
      qc.invalidateQueries({ queryKey: intakeKeys.draft(draftId) })
    },
  })
}

export function useSubmitDraft() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (draftId: string) => submitDraft(draftId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: intakeKeys.all })
    },
  })
}

export function useListingForEdit(listingId: string | null) {
  return useQuery({
    queryKey: intakeKeys.listing(listingId ?? ''),
    queryFn: () => (listingId ? fetchListingForEdit(listingId) : Promise.resolve(null)),
    enabled: Boolean(listingId),
  })
}

export function useRerunQA() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (listingId: string) => rerunQA(listingId),
    onSuccess: (_, listingId) => {
      qc.invalidateQueries({ queryKey: intakeKeys.listing(listingId) })
    },
  })
}
