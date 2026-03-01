/**
 * Edit / Manage Listing types - provider-agnostic QA, enrichment, ops notes.
 */

export type QAStatus = 'Draft' | 'InProgress' | 'Failed' | 'Passed' | 'NeedsRework'
export type EnrichmentStatus = 'Pending' | 'Complete' | 'Failed' | 'partial'
export type ListingEditStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'live'
  | 'sold'
  | 'unsold'
  | 'archived'

export interface QAOutput {
  hardFail: boolean
  hardFails?: string[]
  warnings: string[]
  tags: string[]
  confidence: number
  evidenceImages: string[]
  resultsByField?: Record<string, unknown>
  pass?: boolean
  overallScore?: number
}

export interface ListingPhotoEdit {
  id: string
  url: string
  angle?: string
  order: number
  width?: number
  height?: number
  qaResults?: QAOutput
}

export interface OpsNoteEdit {
  id: string
  listingId?: string
  note: string
  status?: string
  authorId?: string
  createdAt: string
  relatedAction?: string
}

export interface EnrichmentResultEdit {
  status: EnrichmentStatus
  results?: Record<string, unknown>
  lastUpdated?: string
}

export interface ListingEditFormData {
  title: string
  description?: string
  category?: string
  specs?: Record<string, unknown>
  identifiers?: Record<string, string>
  price?: number
  reservePrice?: number
  startingPrice?: number
  auctionWindow?: { start: string; end: string } | null
  location?: string
  pickupLocation?: string
  make?: string
  model?: string
  year?: string
}

export interface ListingForEdit {
  id: string
  sellerId: string
  identifier?: string
  title: string
  description?: string
  category?: string
  status: ListingEditStatus
  specs?: Record<string, unknown>
  identifiers?: Record<string, string>
  reservePrice?: number
  startingPrice?: number
  metadata?: Record<string, unknown>
  qaStatus?: QAStatus
  qaResults?: QAOutput
  enrichmentStatus?: EnrichmentStatus
  enrichmentResults?: Record<string, unknown>
  photos: ListingPhotoEdit[]
  opsNotes: OpsNoteEdit[]
  createdAt: string
  updatedAt: string
  archived?: boolean
  auctionWindow?: { start: string; end: string }
  location?: string
}

/** Alias for form/API compatibility */
export type ListingEditData = ListingForEdit

/** Form values for ListingEditForm */
export interface ListingEditFormValues extends Partial<ListingEditFormData> {
  title: string
  description: string
  category: string
  specs: Record<string, unknown>
  identifiers: Record<string, string>
  reservePrice?: number
  startingPrice?: number
  auctionWindow: { start: string; end: string } | null
  pickupLocation: string
  make: string
  model: string
  year: string
}

export interface ValidationError {
  field: string
  message: string
}
