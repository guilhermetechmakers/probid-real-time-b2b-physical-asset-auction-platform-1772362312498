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
