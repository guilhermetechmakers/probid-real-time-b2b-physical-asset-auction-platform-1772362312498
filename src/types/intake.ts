/**
 * Intake Wizard types - Create Listing flow
 */

export type DraftStatus = 'draft' | 'ready' | 'submitted'
export type EnrichmentStatus = 'pending' | 'complete' | 'failed'

export interface DraftData {
  identifier?: string
  enrichment?: EnrichmentData
  specs?: Record<string, unknown>
  photos?: PhotoMetadata[]
  qa?: QAResultData
  additionalDetails?: AdditionalDetailsData
}

export interface EnrichmentData {
  make?: string
  model?: string
  year?: string
  specs?: Record<string, unknown>
  status: EnrichmentStatus
}

export interface PhotoMetadata {
  url: string
  angle: string
  size?: number
  mimeType?: string
}

export interface QAResultData {
  hardFails: string[]
  warnings: string[]
  tags: string[]
  confidence: number
  evidenceImages: string[]
}

export interface AdditionalDetailsData {
  reservePrice?: number
  estimatedMarketValue?: number
  pickupLocation?: string
  preferredAuctionBatch?: string
  paymentTerms?: string
  fees?: number
}

export interface IntakeDraft {
  id: string
  sellerId: string
  data: DraftData
  step: number
  status: DraftStatus
  createdAt: string
  updatedAt: string
}

export const REQUIRED_PHOTO_ANGLES = [
  'Front',
  'Side',
  'Back',
  'Top',
  'Angle A',
  'Angle B',
  'Angle C',
  'Angle D',
  'Angle E',
  'Interior',
  'Detail 1',
  'Detail 2',
  'Detail 3',
  'Detail 4',
  'Detail 5',
] as const

export type PhotoAngle = (typeof REQUIRED_PHOTO_ANGLES)[number]
