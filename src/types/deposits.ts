/**
 * Cart / Deposits types.
 * Runtime safety: all optional fields; use data ?? [] for arrays.
 */

export type DepositStatus = 'holding' | 'captured' | 'released' | 'expired'

export type HoldType = 'deposit' | 'preauth'

export interface ReleaseRule {
  type?: string
  trigger?: string
  afterDays?: number
  [key: string]: unknown
}

export interface Deposit {
  id: string
  auctionId: string
  amount: number
  currency: string
  status: DepositStatus
  expiresAt: string | null
  createdAt: string
  updatedAt: string
  holdId?: string
  holdType?: HoldType
  releaseRule?: ReleaseRule
  capturedAt?: string | null
  releasedAt?: string | null
  paymentMethodId?: string | null
  stripePaymentIntentId?: string | null
  notes?: string | null
  /** Auction details (joined) */
  auction?: {
    id: string
    listingId?: string
    status?: string
    startsAt?: string
    endsAt?: string
  }
  listing?: {
    id: string
    title?: string
    assetType?: string
  }
}

export interface CreateDepositRequest {
  auctionId: string
  amount: number
  currency?: string
  holdFor?: number
  releaseRule?: ReleaseRule
}

export interface CreateDepositResponse extends Deposit {
  clientSecret?: string | null
}

export interface DepositHold extends Deposit {
  buyerId?: string
  auctionTitle?: string | null
  listingId?: string | null
}

export interface DepositRequirements {
  auctionId: string
  requiredAmount: number
  currency: string
  expiryHours?: number
  releaseConditions?: string
  releaseRule?: ReleaseRule
  hasActiveHold?: boolean
  activeHoldId?: string | null
  auctionTitle?: string
  listingId?: string
}
