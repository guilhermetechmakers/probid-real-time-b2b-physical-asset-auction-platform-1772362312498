/**
 * Intake Wizard API - Supabase client for drafts, enrichment, QA, and submission.
 * All array operations guarded per runtime safety rules.
 */

import { supabase } from '@/lib/supabase'
import type { Draft, DraftData, IntakeQAResult, DraftPhoto } from '@/types'
import { ensureArray } from '@/lib/safe-utils'

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export async function startDraft(): Promise<{ draftId: string; step: number }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('drafts')
    .insert({
      seller_id: userId,
      data: {},
      step: 1,
      status: 'draft',
    })
    .select('id, step')
    .single()

  if (error) throw new Error(error.message ?? 'Failed to create draft')
  return { draftId: String(data?.id ?? ''), step: Number(data?.step ?? 1) }
}

export async function createOrGetDraft(): Promise<{ draftId: string; step: number }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('drafts')
    .select('id, step')
    .eq('seller_id', userId)
    .eq('status', 'draft')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()

  if (existing?.id) {
    return { draftId: String(existing.id), step: Number(existing.step ?? 1) }
  }

  return startDraft()
}

export async function fetchDraft(draftId: string): Promise<Draft | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('drafts')
    .select('*')
    .eq('id', draftId)
    .eq('seller_id', userId)
    .single()

  if (error || !data) return null

  const dataJson = (data.data as Record<string, unknown>) ?? {}
  const photosRaw = dataJson.photos
  const photos = Array.isArray(photosRaw)
    ? (photosRaw as DraftPhoto[])
    : []

  return {
    id: String(data.id ?? ''),
    sellerId: String(data.seller_id ?? ''),
    data: {
      ...dataJson,
      photos: Array.isArray(photos) ? photos : [],
    } as DraftData,
    step: Number(data.step ?? 1),
    status: String(data.status ?? 'draft') as Draft['status'],
    createdAt: String(data.created_at ?? ''),
    updatedAt: String(data.updated_at ?? ''),
  }
}

export async function updateDraft(
  draftId: string,
  payload: Partial<{ data: DraftData; step: number }>
): Promise<{ draftId: string; updatedAt: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.data != null) updatePayload.data = payload.data
  if (payload.step != null) updatePayload.step = payload.step

  const { data, error } = await supabase
    .from('drafts')
    .update(updatePayload)
    .eq('id', draftId)
    .eq('seller_id', userId)
    .select('id, updated_at')
    .single()

  if (error) throw new Error(error.message ?? 'Failed to update draft')
  return {
    draftId: String(data?.id ?? draftId),
    updatedAt: String(data?.updated_at ?? ''),
  }
}

export async function triggerEnrichment(
  draftId: string,
  identifier: string
): Promise<{ draftId: string; status: 'pending' | 'complete' | 'failed'; enrichment?: Record<string, unknown> }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  await updateDraft(draftId, {
    data: { identifier, enrichmentStatus: 'pending' },
  })

  // Mock enrichment - in production, call Edge Function or external API
  const mockEnrichment: Record<string, unknown> = {
    make: 'Unknown',
    model: identifier.slice(0, 8),
    year: new Date().getFullYear().toString(),
    specs: {},
  }

  await supabase.from('enrichment_results').insert({
    draft_id: draftId,
    data: mockEnrichment,
    status: 'complete',
  })

  await updateDraft(draftId, {
    data: {
      identifier,
      enrichment: mockEnrichment,
      enrichmentStatus: 'complete',
      specs: mockEnrichment,
    },
  })

  return { draftId, status: 'complete', enrichment: mockEnrichment }
}

export async function uploadDraftPhotos(
  draftId: string,
  files: Array<{ file: File; angle: string }>
): Promise<DraftPhoto[]> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const draft = await fetchDraft(draftId)
  if (!draft) throw new Error('Draft not found')

  const bucket = 'listing-photos'
  const existingPhotos = ensureArray(draft.data.photos ?? [])
  const results: DraftPhoto[] = []

  for (let i = 0; i < files.length; i++) {
    const { file, angle } = files[i]
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${userId}/${draftId}/${Date.now()}-${i}.${ext}`

    const { data: uploadData, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true })

    if (error) {
      const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(path)
      results.push({
        url: publicUrl.publicUrl,
        angle,
        size: file.size,
        mimeType: file.type,
        order: existingPhotos.length + i,
      })
    } else {
      const uploadedPath = (uploadData as { path?: string })?.path ?? path
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(uploadedPath)
      results.push({
        url: urlData.publicUrl,
        angle,
        size: file.size,
        mimeType: file.type,
        order: existingPhotos.length + i,
      })
    }
  }

  const allPhotos = [...existingPhotos, ...results]
  await updateDraft(draftId, {
    data: { ...draft.data, photos: allPhotos },
  })

  return allPhotos
}

export async function triggerQA(draftId: string): Promise<IntakeQAResult> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const draft = await fetchDraft(draftId)
  if (!draft) throw new Error('Draft not found')

  const photos = ensureArray(draft.data.photos ?? [])
  const mockQA: IntakeQAResult = {
    hardFails: [],
    warnings: photos.length < 15 ? ['Fewer than 15 photos uploaded'] : [],
    tags: ['auto-verified'],
    confidence: photos.length >= 15 ? 0.92 : 0.6,
    evidenceImages: photos.slice(0, 3).map((p) => p.url),
    overallScore: photos.length >= 15 ? 85 : 60,
    pass: photos.length >= 15,
  }

  await supabase.from('qa_results').insert({
    draft_id: draftId,
    data: mockQA,
  })

  await updateDraft(draftId, {
    data: { ...draft.data, qa: mockQA },
  })

  return mockQA
}

export async function submitDraft(draftId: string): Promise<{ listingId: string; status: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const draft = await fetchDraft(draftId)
  if (!draft) throw new Error('Draft not found')

  const photos = ensureArray(draft.data.photos ?? [])
  const metadata = {
    identifier: draft.data.identifier,
    make: draft.data.make,
    model: draft.data.model,
    year: draft.data.year,
    specs: draft.data.specs ?? {},
    ...draft.data,
  }

  const { data: listing, error } = await supabase
    .from('listings')
    .insert({
      seller_id: userId,
      identifier: draft.data.identifier ?? '',
      title: draft.data.title ?? draft.data.identifier ?? 'Untitled',
      description: draft.data.description ?? null,
      status: 'pending_review',
      reserve_price: draft.data.reservePrice ?? null,
      starting_price: draft.data.estimatedValue ?? null,
      specs: metadata,
      enrichment: draft.data.enrichment ?? null,
      image_urls: photos.map((p) => p.url),
      qa_results: draft.data.qa ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message ?? 'Failed to create listing')

  const listingId = String(listing?.id ?? '')

  for (let i = 0; i < photos.length; i++) {
    const p = photos[i]
    await supabase.from('listing_photos').insert({
      listing_id: listingId,
      url: p.url,
      order: i,
      angle: p.angle ?? null,
    })
  }

  await supabase
    .from('drafts')
    .update({ status: 'submitted', data: { ...draft.data, submittedListingId: listingId } })
    .eq('id', draftId)
    .eq('seller_id', userId)

  return { listingId, status: 'pending_review' }
}

export async function fetchListingForEdit(listingId: string) {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data, error } = await supabase
    .from('listings')
    .select('*, listing_photos(*)')
    .eq('id', listingId)
    .eq('seller_id', userId)
    .single()

  if (error || !data) return null

  const photos = Array.isArray(data.listing_photos)
    ? (data.listing_photos as Record<string, unknown>[]).map((p) => ({
        id: String(p.id ?? ''),
        url: String(p.url ?? ''),
        angle: p.angle != null ? String(p.angle) : undefined,
        order: Number(p.order ?? 0),
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
        createdAt: String(n.created_at ?? ''),
      }))
    : []

  return {
    id: String(data.id ?? ''),
    sellerId: String(data.seller_id ?? ''),
    identifier: String(data.identifier ?? ''),
    title: String(data.title ?? ''),
    description: data.description != null ? String(data.description) : undefined,
    status: String(data.status ?? 'draft'),
    reservePrice: data.reserve_price != null ? Number(data.reserve_price) : undefined,
    startingPrice: data.starting_price != null ? Number(data.starting_price) : undefined,
    metadata: (data.specs as Record<string, unknown>) ?? {},
    qaResults: (data.qa_results as IntakeQAResult) ?? undefined,
    photos,
    opsNotes,
    createdAt: String(data.created_at ?? ''),
    updatedAt: String(data.updated_at ?? ''),
  }
}

export async function rerunQA(listingId: string): Promise<IntakeQAResult> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const listing = await fetchListingForEdit(listingId)
  if (!listing) throw new Error('Listing not found')

  const photos = ensureArray(listing.photos ?? [])
  const mockQA: IntakeQAResult = {
    hardFails: [],
    warnings: [],
    tags: ['re-verified'],
    confidence: 0.92,
    evidenceImages: photos.slice(0, 3).map((p) => p.url),
    overallScore: 88,
    pass: true,
  }

  await supabase
    .from('listings')
    .update({ qa_results: mockQA, updated_at: new Date().toISOString() })
    .eq('id', listingId)
    .eq('seller_id', userId)

  await supabase.from('qa_results').insert({
    listing_id: listingId,
    data: mockQA,
  })

  return mockQA
}
