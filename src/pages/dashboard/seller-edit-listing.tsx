/**
 * Edit / Manage Listing - Full management interface with all sections.
 */

import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ListingEditForm,
  PhotosPanel,
  QAResultsPanel,
  OpsNotesPanel,
  EnrichmentOverview,
  ActionsBar,
  ValidationSummary,
  IdentifierEnrichmentStatus,
} from '@/components/listing-edit'
import {
  useListing,
  useUpdateListing,
  useAddOpsNote,
  useScheduleAuction,
  useArchiveListing,
  useResubmitForReview,
  useReplacePhoto,
  useDeletePhoto,
  useReorderPhotos,
  useRunQA,
  useRetryEnrichment,
} from '@/hooks/use-listing-edit'
import { ensureArray } from '@/lib/safe-utils'
import { toast } from 'sonner'
import type { ListingEditFormData, ValidationError } from '@/types/listing-edit'

function validateForResubmit(listing: NonNullable<ReturnType<typeof useListing>['data']>): ValidationError[] {
  const errors: ValidationError[] = []
  if (!listing.title?.trim()) errors.push({ field: 'title', message: 'Title is required' })
  const photos = ensureArray(listing.photos ?? [])
  if (photos.length === 0) errors.push({ field: 'photos', message: 'At least one photo is required' })
  const qa = listing.qaResults
  const hasHardFail = qa?.hardFail ?? (ensureArray(qa?.hardFails ?? []).length > 0)
  if (hasHardFail) errors.push({ field: 'qa', message: 'Resolve QA hard-fail issues before resubmitting' })
  return errors
}

export function SellerEditListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const listingId = id ?? null

  const { data: listing, isLoading, error } = useListing(listingId)
  const updateListing = useUpdateListing(listingId)
  const addNote = useAddOpsNote(listingId)
  const scheduleAuction = useScheduleAuction(listingId)
  const archiveListing = useArchiveListing(listingId)
  const resubmit = useResubmitForReview(listingId)
  const replacePhoto = useReplacePhoto(listingId)
  const deletePhoto = useDeletePhoto(listingId)
  const reorderPhotos = useReorderPhotos(listingId)
  const runQA = useRunQA(listingId)
  const retryEnrichment = useRetryEnrichment(listingId)

  const [replacingIdx, setReplacingIdx] = useState<number | null>(null)

  if (isLoading || !listingId) {
    return (
      <div className="space-y-6 animate-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Listing not found.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/seller/listings')}>
          Back to Listings
        </Button>
      </div>
    )
  }

  const photos = ensureArray(listing.photos ?? [])
  const validationErrors = validateForResubmit(listing)
  const isBusy =
    updateListing.isPending ||
    addNote.isPending ||
    scheduleAuction.isPending ||
    archiveListing.isPending ||
    resubmit.isPending ||
    replacePhoto.isPending ||
    deletePhoto.isPending ||
    reorderPhotos.isPending ||
    runQA.isPending ||
    retryEnrichment.isPending

  const handleSave = (data: Partial<ListingEditFormData>) => {
    const payload: Partial<ListingEditFormData> = {
      title: data?.title,
      description: data?.description,
      category: data?.category,
      specs: data?.specs,
      identifiers: data?.identifiers,
      reservePrice: data?.reservePrice,
      startingPrice: data?.startingPrice,
      auctionWindow: data?.auctionWindow,
      location: data?.pickupLocation ?? data?.location,
    }
    updateListing.mutate(payload, {
      onSuccess: () => toast.success('Listing updated'),
      onError: (e) => toast.error(e?.message ?? 'Failed to update'),
    })
  }

  const handleReplacePhoto = (idx: number, file?: File) => {
    if (!file) return
    const photo = photos[idx]
    if (!photo?.id) return
    setReplacingIdx(idx)
    replacePhoto.mutate(
      { photoId: photo.id, file },
      {
        onSuccess: () => toast.success('Photo replaced'),
        onError: (e) => toast.error(e?.message ?? 'Failed to replace'),
        onSettled: () => setReplacingIdx(null),
      }
    )
  }

  const handleDeletePhoto = (idx: number) => {
    const photo = photos[idx]
    if (!photo?.id) return
    deletePhoto.mutate(photo.id, {
      onSuccess: () => toast.success('Photo deleted'),
      onError: (e) => toast.error(e?.message ?? 'Failed to delete'),
    })
  }

  const handleReorder = (fromIdx: number, toIdx: number) => {
    const arr = [...photos]
    const [removed] = arr.splice(fromIdx, 1)
    arr.splice(toIdx, 0, removed)
    const newOrder = arr.map((p) => p.id).filter(Boolean)
    reorderPhotos.mutate(newOrder, {
      onSuccess: () => toast.success('Order updated'),
      onError: (e) => toast.error(e?.message ?? 'Failed to reorder'),
    })
  }

  const handleQAUpdate = (photoIds?: string[]) => {
    runQA.mutate(photoIds, {
      onSuccess: () => toast.success('QA complete'),
      onError: (e) => toast.error(e?.message ?? 'QA failed'),
    })
  }

  const handleAddNote = (note: string) => {
    addNote.mutateAsync(note).then(() => toast.success('Note added')).catch((e) => toast.error(e?.message ?? 'Failed to add note'))
  }

  const handleResubmit = () => {
    if (validationErrors.length > 0) {
      toast.error('Fix validation issues before resubmitting')
      return
    }
    resubmit.mutate(undefined, {
      onSuccess: () => toast.success('Resubmitted for review'),
      onError: (e) => toast.error(e?.message ?? 'Failed to resubmit'),
    })
  }

  const handleSchedule = (window: { start: string; end: string }) => {
    scheduleAuction.mutate(window, {
      onSuccess: () => toast.success('Auction scheduled'),
      onError: (e) => toast.error(e?.message ?? 'Failed to schedule'),
    })
  }

  const handleArchive = () => {
    archiveListing.mutate(undefined, {
      onSuccess: () => {
        toast.success('Listing archived')
        navigate('/dashboard/seller/listings')
      },
      onError: (e) => toast.error(e?.message ?? 'Failed to archive'),
    })
  }

  const canResubmit = ['draft', 'pending_review', 'rejected'].includes(listing.status) && validationErrors.length === 0
  const canSchedule = ['approved'].includes(listing.status)
  const canArchive = !listing.archived

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/seller/listings')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-muted-foreground">{listing.title}</p>
      </div>

      <IdentifierEnrichmentStatus
        enrichmentStatus={listing.enrichmentStatus}
        lastUpdated={listing.updatedAt}
        identifier={listing.identifier}
        onViewEnrichment={() => document.getElementById('enrichment-section')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {validationErrors.length > 0 && (
        <ValidationSummary
          validationErrors={validationErrors}
          onNavigateToField={(field) => {
            const el = document.getElementById(field)
            el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            el?.focus()
          }}
        />
      )}

      <ListingEditForm
        listing={listing}
        onChange={() => {}}
        onSave={handleSave}
        validationErrors={validationErrors}
        isSaving={updateListing.isPending}
        onFieldFocus={() => {}}
      />

      <div id="photos" tabIndex={-1}>
        <PhotosPanel
          photos={photos}
          onReplace={handleReplacePhoto}
          onDelete={handleDeletePhoto}
          onReorder={handleReorder}
          onQAUpdate={handleQAUpdate}
          isQARunning={runQA.isPending}
          isReplacing={replacingIdx}
        />
      </div>

      <div id="qa" tabIndex={-1}>
        <QAResultsPanel qaOutput={listing.qaResults} />
      </div>

      <OpsNotesPanel notes={listing.opsNotes} onAddNote={handleAddNote} canAddNote />

      <div id="enrichment-section" tabIndex={-1}>
        <EnrichmentOverview
          enrichmentResults={{
            status: listing.enrichmentStatus ?? 'Pending',
            results: listing.enrichmentResults ?? listing.metadata,
            lastUpdated: listing.updatedAt,
          }}
          onRetry={() =>
            retryEnrichment.mutate(undefined, {
              onSuccess: () => toast.success('Enrichment retried'),
              onError: (e) => toast.error(e?.message ?? 'Enrichment failed'),
            })
          }
          isRetrying={retryEnrichment.isPending}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-6 shadow-card transition-all duration-300 hover:shadow-card-hover">
        <h3 className="w-full text-sm font-semibold text-muted-foreground uppercase tracking-wide">Actions</h3>
        <ActionsBar
          onResubmit={handleResubmit}
          onScheduleAuction={handleSchedule}
          onArchive={handleArchive}
          isBusy={isBusy}
          canResubmit={canResubmit}
          canSchedule={canSchedule}
          canArchive={canArchive}
        />
      </div>
    </div>
  )
}
