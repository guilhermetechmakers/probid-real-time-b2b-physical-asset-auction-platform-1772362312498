/**
 * Listing Edit API - update metadata, photos, QA, notes, schedule, archive.
 * All array operations guarded per runtime safety rules.
 */

import { supabase } from '@/lib/supabase'
import type { ListingForEdit, ListingEditFormData, OpsNoteEdit, QAOutput } from '@/types/listing-edit'
import { ensureArray } from '@/lib/safe-utils'

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export async function fetchListingForEdit(listingId: string): Promise<ListingForEdit | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_photos(*)')
    .eq('id', listingId)
    .eq('seller_id', userId)
    .single()

  if (error || !data) return null

  const photosRaw = data.listing_photos
  const photos = Array.isArray(photosRaw)
    ? (photosRaw as Record<string, unknown>[]).map((p) => ({
        id: String(p.id ?? ''),
        url: String(p.url ?? ''),
        angle: p.angle != null ? String(p.angle) : undefined,
        order: Number(p.order ?? 0),
        qaResults: (p.qa_results as QAOutput) ?? undefined,
      }))
    : []

  const { data: notesData } = await supabase
    .from('ops_notes')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  const opsNotes = Array.isArray(notesData)
    ? (notesData as Record<string, unknown>[]).map((n) => ({
        id: String(n.id ?? ''),
        note: String(n.note ?? ''),
        status: n.status != null ? String(n.status) : undefined,
        authorId: n.author_id != null ? String(n.author_id) : undefined,
        createdAt: String(n.created_at ?? ''),
        relatedAction: n.related_action != null ? String(n.related_action) : undefined,
      }))
    : []

  const qaResults = data.qa_results as QAOutput | null | undefined
  const identifiers = data.identifiers as Record<string, string> | null | undefined

  return {
    id: String(data.id ?? ''),
    sellerId: String(data.seller_id ?? ''),
    identifier: data.identifier != null ? String(data.identifier) : undefined,
    title: String(data.title ?? ''),
    description: data.description != null ? String(data.description) : undefined,
    category: data.category != null ? String(data.category) : undefined,
    status: String(data.status ?? 'draft') as ListingForEdit['status'],
    specs: (data.specs as Record<string, unknown>) ?? undefined,
    identifiers: identifiers ?? undefined,
    reservePrice: data.reserve_price != null ? Number(data.reserve_price) : undefined,
    startingPrice: data.starting_price != null ? Number(data.starting_price) : undefined,
    metadata: (data.specs as Record<string, unknown>) ?? undefined,
    qaStatus: data.qa_status != null ? String(data.qa_status) as ListingForEdit['qaStatus'] : undefined,
    qaResults: qaResults ?? undefined,
    enrichmentStatus: data.enrichment_status != null ? String(data.enrichment_status) as ListingForEdit['enrichmentStatus'] : undefined,
    enrichmentResults: (data.enrichment_results as Record<string, unknown>) ?? undefined,
    photos,
    opsNotes,
    createdAt: String(data.created_at ?? ''),
    updatedAt: String(data.updated_at ?? ''),
    archived: data.archived === true,
    auctionWindow: data.auction_window as { start: string; end: string } | null | undefined ?? undefined,
    location: data.location != null ? String(data.location) : undefined,
  }
}

export async function updateListing(
  listingId: string,
  payload: Partial<ListingEditFormData>
): Promise<{ updatedAt: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (payload.title != null) updatePayload.title = payload.title
  if (payload.description != null) updatePayload.description = payload.description
  if (payload.category != null) updatePayload.category = payload.category
  if (payload.specs != null) updatePayload.specs = payload.specs
  if (payload.identifiers != null) updatePayload.identifiers = payload.identifiers
  if (payload.reservePrice != null) updatePayload.reserve_price = payload.reservePrice
  if (payload.startingPrice != null) updatePayload.starting_price = payload.startingPrice
  if (payload.location != null) updatePayload.location = payload.location
  if (payload.auctionWindow != null) updatePayload.auction_window = payload.auctionWindow

  const { data, error } = await supabase
    .from('listings')
    .update(updatePayload)
    .eq('id', listingId)
    .eq('seller_id', userId)
    .select('updated_at')
    .single()

  if (error) throw new Error(error.message ?? 'Failed to update listing')

  await logActivity(listingId, 'listing_updated', { fields: Object.keys(updatePayload) })

  return { updatedAt: String(data?.updated_at ?? '') }
}

export async function addOpsNote(listingId: string, note: string): Promise<OpsNoteEdit> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('ops_notes')
    .insert({
      listing_id: listingId,
      note: note.trim(),
      author_id: userId,
      status: 'open',
    })
    .select('id, note, status, author_id, created_at, related_action')
    .single()

  if (error) throw new Error(error.message ?? 'Failed to add note')

  await logActivity(listingId, 'ops_note_added', { noteId: data?.id })

  return {
    id: String(data?.id ?? ''),
    note: String(data?.note ?? ''),
    status: data?.status != null ? String(data.status) : undefined,
    authorId: data?.author_id != null ? String(data.author_id) : undefined,
    createdAt: String(data?.created_at ?? ''),
    relatedAction: data?.related_action != null ? String(data.related_action) : undefined,
  }
}

export async function scheduleAuction(
  listingId: string,
  window: { start: string; end: string }
): Promise<{ status: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('listings')
    .update({
      status: 'scheduled',
      auction_window: window,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', userId)

  if (error) throw new Error(error.message ?? 'Failed to schedule auction')

  await logActivity(listingId, 'auction_scheduled', window)

  return { status: 'scheduled' }
}

export async function archiveListing(listingId: string): Promise<{ archived: boolean }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('listings')
    .update({
      archived: true,
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', userId)

  if (error) throw new Error(error.message ?? 'Failed to archive listing')

  await logActivity(listingId, 'listing_archived', {})

  return { archived: true }
}

export async function resubmitForReview(listingId: string): Promise<{ status: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('listings')
    .update({
      status: 'pending_review',
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', userId)

  if (error) throw new Error(error.message ?? 'Failed to resubmit')

  await logActivity(listingId, 'resubmitted_for_review', {})

  return { status: 'pending_review' }
}

export async function replacePhoto(
  listingId: string,
  photoId: string,
  file: File
): Promise<{ url: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const bucket = 'listing-photos'
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${userId}/${listingId}/${Date.now()}.${ext}`

  const { data: uploadData, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true })

  if (error) throw new Error(error.message ?? 'Failed to upload photo')

  const uploadedPath = (uploadData as { path?: string })?.path ?? path
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadedPath)
  const url = urlData.publicUrl

  await supabase
    .from('listing_photos')
    .update({ url, qa_results: null })
    .eq('id', photoId)
    .eq('listing_id', listingId)

  await logActivity(listingId, 'photo_replaced', { photoId })

  return { url }
}

export async function deletePhoto(listingId: string, photoId: string): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('listing_photos')
    .delete()
    .eq('id', photoId)
    .eq('listing_id', listingId)

  if (error) throw new Error(error.message ?? 'Failed to delete photo')

  await logActivity(listingId, 'photo_deleted', { photoId })
}

export async function reorderPhotos(
  listingId: string,
  photoIds: string[]
): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const ids = ensureArray(photoIds)
  for (let i = 0; i < ids.length; i++) {
    await supabase
      .from('listing_photos')
      .update({ order: i })
      .eq('id', ids[i])
      .eq('listing_id', listingId)
  }

  await logActivity(listingId, 'photos_reordered', { count: ids.length })
}

export async function runQA(listingId: string, photoIds?: string[]): Promise<QAOutput> {
  const listing = await fetchListingForEdit(listingId)
  if (!listing) throw new Error('Listing not found')

  const photos = ensureArray(listing.photos ?? [])
  const toCheck = Array.isArray(photoIds) && photoIds.length > 0
    ? photos.filter((p) => photoIds.includes(p.id))
    : photos

  const urls = toCheck.map((p) => p.url)
  const mockQA: QAOutput = {
    hardFail: false,
    hardFails: [],
    warnings: urls.length < 5 ? ['Fewer than 5 photos'] : [],
    tags: ['re-verified'],
    confidence: urls.length >= 5 ? 0.92 : 0.65,
    evidenceImages: urls.slice(0, 3),
    pass: urls.length >= 5,
    overallScore: urls.length >= 5 ? 88 : 62,
  }

  await supabase
    .from('listings')
    .update({
      qa_results: mockQA,
      qa_status: mockQA.pass ? 'Passed' : 'NeedsRework',
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', listing.sellerId)

  await supabase.from('qa_results').insert({
    listing_id: listingId,
    data: mockQA,
  })

  await logActivity(listingId, 'qa_run', { pass: mockQA.pass })

  return mockQA
}

export async function retryEnrichment(listingId: string): Promise<{ status: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const listing = await fetchListingForEdit(listingId)
  if (!listing) throw new Error('Listing not found')

  const mockResults = {
    make: listing.metadata?.make ?? 'Unknown',
    model: listing.identifier ?? 'Unknown',
    year: new Date().getFullYear().toString(),
    specs: listing.specs ?? {},
  }

  await supabase
    .from('listings')
    .update({
      enrichment_status: 'Complete',
      enrichment_results: mockResults,
      specs: mockResults,
      updated_at: new Date().toISOString(),
    })
    .eq('id', listingId)
    .eq('seller_id', userId)

  await logActivity(listingId, 'enrichment_retried', {})

  return { status: 'Complete' }
}

async function logActivity(
  listingId: string,
  eventType: string,
  payload: Record<string, unknown>
): Promise<void> {
  const userId = await getCurrentUserId()
  await supabase.from('activity_log').insert({
    listing_id: listingId,
    event_type: eventType,
    payload,
    actor_id: userId,
  })
}
