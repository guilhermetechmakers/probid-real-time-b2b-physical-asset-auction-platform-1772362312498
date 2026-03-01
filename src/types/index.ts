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
