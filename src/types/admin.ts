/**
 * Admin Dashboard types - Ops Queue, Buyers, Auctions, Disputes, Finance, RBAC, Audit Logs.
 * All array types guarded per runtime safety rules.
 */

export type ListingStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'scheduled'
  | 'live'
  | 'sold'
  | 'unsold'

export interface AdminListing {
  id: string
  sellerId: string
  sellerName?: string
  identifier?: string
  title: string
  description?: string
  status: ListingStatus
  reservePrice?: number
  startingPrice?: number
  currentBid?: number
  imageUrls: string[]
  createdAt: string
  updatedAt: string
  dueDate?: string
  inspectorId?: string
}

export interface AdminListingTask {
  listing: AdminListing
  checklist: ChecklistItem[]
  attachments: string[]
  progress: number
  dueDate?: string
  inspectorId?: string
}

export interface ChecklistItem {
  id: string
  label: string
  completed: boolean
}

export type KycStatus = 'pending' | 'submitted' | 'approved' | 'rejected'

export interface AdminBuyer {
  id: string
  userId: string
  email?: string
  name?: string
  kycStatus: KycStatus
  verificationStatus: string
  adminApproved: boolean
  createdAt: string
  updatedAt: string
  submittedAt?: string
  documents?: { type: string; url: string }[]
}

export type AuctionStatus = 'scheduled' | 'live' | 'ended' | 'cancelled'

export interface AdminAuction {
  id: string
  listingId: string
  listingTitle?: string
  status: AuctionStatus
  startTime: string
  endTime: string
  reservePrice?: number
  currentBid?: number
  bidCount?: number
  paused?: boolean
  extendedMinutes?: number
  createdAt: string
}

export interface AdminBid {
  id: string
  auctionId: string
  bidderId: string
  amount: number
  placedAt: string
}

export type DisputeStatus = 'initiated' | 'under_review' | 'resolved' | 'rejected'

export interface AdminDispute {
  id: string
  transactionId: string
  initiatorId: string
  initiatorEmail?: string
  status: DisputeStatus
  reason: string
  description?: string
  caseNotes?: string
  evidenceLinks?: string[]
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

export interface FinanceMetrics {
  totalRevenue: number
  subscriptionRevenue: number
  transactionalFees: number
  openDisputes: number
  pendingPayouts: number
}

export interface FinanceLedgerEntry {
  id: string
  type: 'subscription' | 'fee' | 'deposit' | 'payout'
  amount: number
  currency: string
  status: string
  createdAt: string
  description?: string
}

export interface Role {
  id: string
  name: string
  permissions: string[]
  createdAt?: string
}

export interface UserRole {
  userId: string
  roleId: string
  roleName?: string
  assignedAt: string
  assignedBy?: string
}

export interface AuditLogEntry {
  id: string
  action: string
  entityType?: string
  entityId?: string
  actorId: string
  actorEmail?: string
  metadata?: Record<string, unknown>
  timestamp: string
  immutable?: boolean
}

export interface AdminDashboardMetrics {
  pendingListings: number
  pendingBuyerApprovals: number
  liveAuctions: number
  openDisputes: number
  totalRevenue: number
}
