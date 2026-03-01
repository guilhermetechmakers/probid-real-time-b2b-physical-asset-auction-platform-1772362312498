export type UserRole = 'seller' | 'buyer' | 'ops' | 'admin'

export interface User {
  id: string
  email: string
  role: UserRole
  fullName?: string
  avatarUrl?: string
  kycStatus?: 'pending' | 'approved' | 'rejected'
  subscriptionStatus?: 'active' | 'inactive' | 'cancelled'
}

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'live'
  | 'sold'
  | 'unsold'

export interface Listing {
  id: string
  sellerId: string
  identifier: string
  title: string
  description?: string
  status: ListingStatus
  reservePrice?: number
  startingPrice?: number
  currentBid?: number
  imageUrls: string[]
  specs?: Record<string, unknown>
  qaResults?: QAResult
  createdAt: string
  updatedAt: string
}

export interface QAResult {
  hardFail: string[]
  warnings: string[]
  tags: string[]
  confidence: number
  evidence: string[]
}

export type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

export interface Auction {
  id: string
  batchId: string
  status: AuctionStatus
  startTime: string
  endTime: string
  lots: AuctionLot[]
}

export interface AuctionLot {
  id: string
  listingId: string
  listing: Listing
  currentBid?: number
  winningBidderId?: string
}

export interface Bid {
  id: string
  lotId: string
  bidderId: string
  amount: number
  createdAt: string
}

/** User payload returned after successful email verification */
export interface VerificationUser {
  id: string
  email: string
  name?: string
  emailVerified?: boolean
}

/** Response from verify-email API */
export interface VerificationResponse {
  success: boolean
  message?: string
  data?: VerificationUser
}

/** Response from resend-verification API */
export interface ResendVerificationResponse {
  success: boolean
  message?: string
}

/* Seller Dashboard Types */
export type ListingStatusBadge =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'in_auction'
  | 'sold'

export interface ListingPhoto {
  id: string
  listingId: string
  url: string
  order: number
  width?: number
  height?: number
  storedAt?: string
}

export interface EnrichmentResult {
  provider: string
  dataJson: Record<string, unknown>
  confidence: number
  hardFail: boolean
  warnings: string[]
}

export interface Intake {
  id: string
  listingId: string
  currentStep: number
  status: 'draft' | 'in_progress' | 'completed'
  resultsJson?: Record<string, unknown>
  enrichedAt?: string
}

export type InspectionStatus = 'scheduled' | 'in_progress' | 'completed'

export interface Inspection {
  id: string
  listingId: string
  scheduledAt: string
  inspectorId?: string
  inspectorName?: string
  status: InspectionStatus
  notes?: string
}

export interface Sale {
  id: string
  listingId: string
  listingTitle?: string
  salePrice: number
  soldAt: string
  buyerId?: string
}

export interface Notification {
  id: string
  sellerId: string
  type: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}

export interface ActivityEvent {
  id: string
  type: 'inspection_scheduled' | 'bid_received' | 'win' | 'listing_approved' | 'listing_rejected'
  message: string
  timestamp: string
  actor?: string
  targetId?: string
}

/* Buyer Dashboard Types */
export type BuyerKycStatus = 'pending' | 'submitted' | 'approved' | 'rejected'
export type VerificationState = 'pending' | 'in_review' | 'verified' | 'rejected'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'
export type BidOutcome = 'won' | 'lost' | 'outbid' | 'pending'

export interface Buyer {
  id: string
  kycStatus: BuyerKycStatus
  verificationStatus: VerificationState
  adminApproved: boolean
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  buyerId: string
  planId: string
  planName?: string
  status: SubscriptionStatus
  currentPeriodStart?: string
  currentPeriodEnd?: string
  nextBillingDate?: string
}

export type BuyerAuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

export interface BuyerAuction {
  id: string
  listingId: string
  assetTitle?: string
  assetCategory?: string
  assetLocation?: string
  assetCondition?: string
  imageUrls?: string[]
  scheduledAt: string
  status: BuyerAuctionStatus
  currentBid?: number
  reservePrice?: number
  batchId?: string
  listing?: {
    id: string
    title: string
    category?: string
    location?: string
    condition?: string
    imageUrls?: string[]
  }
}

export interface WatchlistItem {
  id: string
  buyerId: string
  listingId: string
  listing?: { id: string; title?: string; category?: string; imageUrls?: string[]; currentBid?: number; status?: string }
  alertEnabled: boolean
  alertPreferences?: Record<string, unknown>
  createdAt?: string
}

export interface BiddingHistoryItem {
  id: string
  auctionId: string
  listingId?: string
  listingTitle?: string
  assetTitle?: string
  amount: number
  createdAt: string
  status: BidOutcome
}

/** @deprecated Use BiddingHistoryItem */
export type BidHistoryItem = BiddingHistoryItem

export interface SavedFilter {
  id: string
  buyerId?: string
  name: string
  filters: {
    category?: string
    location?: string
    condition?: string
    priceMin?: number
    priceMax?: number
  }
  createdAt: string
  updatedAt?: string
}

export interface KycVerificationStatus {
  status: BuyerKycStatus
  kycStatus?: 'pending' | 'approved' | 'rejected'
  verificationStatus?: 'pending' | 'submitted' | 'approved' | 'rejected'
  adminApproved: boolean
  adminReviewStatus?: string
  requiredActions?: string[]
  submittedAt?: string
}

/** API-compatible verification status (buyer dashboard) */
export interface VerificationStatus {
  kycStatus: 'pending' | 'approved' | 'rejected'
  verificationStatus: 'pending' | 'submitted' | 'approved' | 'rejected'
  adminApproved: boolean
  hasPendingSubmission?: boolean
}

/** API-compatible subscription info */
export type SubscriptionInfo = Subscription

export interface BuyerDashboardData {
  auctions: BuyerAuction[]
  watchlist: WatchlistItem[]
  biddingHistory: BiddingHistoryItem[]
  subscription: Subscription | null
  savedFilters: SavedFilter[]
  verificationStatus: KycVerificationStatus
}

/* Intake Wizard Types */
export type DraftStatus = 'draft' | 'ready' | 'submitted'
export type EnrichmentStatus = 'pending' | 'complete' | 'failed'

export interface DraftPhoto {
  url: string
  angle: string
  size?: number
  mimeType?: string
  order?: number
}

export interface DraftData {
  identifier?: string
  enrichment?: Record<string, unknown>
  enrichmentStatus?: EnrichmentStatus
  specs?: Record<string, unknown>
  photos?: DraftPhoto[]
  qa?: IntakeQAResult
  reservePrice?: number
  estimatedValue?: number
  pickupLocation?: string
  auctionBatch?: string
  paymentTerms?: string
  fees?: number
  title?: string
  description?: string
  make?: string
  model?: string
  year?: string
}

export interface IntakeQAResult {
  hardFails: string[]
  warnings: string[]
  tags: string[]
  confidence: number
  evidenceImages: string[]
  overallScore?: number
  pass?: boolean
}

export interface Draft {
  id: string
  sellerId: string
  data: DraftData
  step: number
  status: DraftStatus
  createdAt: string
  updatedAt: string
}

export interface OpsNote {
  id: string
  listingId: string
  note: string
  createdAt: string
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
  'Serial/ID',
  'Condition',
] as const

export type PhotoAngle = (typeof REQUIRED_PHOTO_ANGLES)[number]
