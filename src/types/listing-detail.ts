/**
 * Listing Detail & Auction Page types.
 * Runtime-safe with optional fields and array guards.
 */

import type { QAOutput } from '@/types/listing-edit'

export type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'
export type BidStatus = 'accepted' | 'outbid' | 'under-review'

export interface ListingMedia {
  id: string
  url: string
  type: 'image' | 'video'
  angleTag?: string
  position: number
  caption?: string
}

export interface AuctionSchedule {
  id: string
  listingId: string
  startTime: string
  endTime: string
  status: AuctionStatus
  reserve?: number
  currentHighestBid?: number
  bidCount?: number
  remainingTimeSeconds?: number
}

export interface ListingBid {
  id: string
  amount: number
  createdAt: string
  isProxy?: boolean
  proxyMax?: number
  status: BidStatus
  anonymizedBuyerId: string
}

export interface AIQAResult {
  hardFail?: boolean
  hardFails?: string[]
  warnings?: string[]
  tags?: string[]
  confidence: number
  evidenceImages?: string[]
  pass?: boolean
  structuredJson?: Record<string, unknown>
}

export interface ListingDetail {
  id: string
  title: string
  description?: string
  identifier?: string
  category?: string
  status: string
  specs?: Record<string, unknown>
  provenance?: string
  location?: string
  reservePrice?: number
  startingPrice?: number
  currentBid?: number
  media: ListingMedia[]
  imageUrls: string[]
  aiQa?: AIQAResult | QAOutput | null
  auction?: AuctionSchedule | null
  createdAt: string
  updatedAt: string
}

export interface NotificationPrefs {
  outbid?: boolean
  auctionStarting?: boolean
  inspectionScheduled?: boolean
  channel?: 'email' | 'sms' | 'in-app'
}
