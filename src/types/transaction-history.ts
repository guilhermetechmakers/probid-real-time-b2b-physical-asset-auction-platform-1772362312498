/**
 * Transaction History types.
 * All types support runtime safety with optional fields and array guards.
 */

export type TransactionStatus = 'paid' | 'pending' | 'disputed' | 'refunded'

export type DisputeStatus = 'initiated' | 'under_review' | 'resolved' | 'rejected'

export type LogisticsStatus = 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'failed'

export type SettlementStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface InvoiceRef {
  id: string
  pdfUrl?: string | null
  paymentMethod?: string
  paymentStatus?: string
  dueDate?: string
  billedAmount?: number
}

export interface DisputeRef {
  id: string
  status: DisputeStatus
  reason: string
  description?: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string | null
}

export interface LogisticsRef {
  id: string
  carrier?: string | null
  trackingNumber?: string | null
  status: LogisticsStatus
  shippedAt?: string | null
  estimatedDelivery?: string | null
  milestones?: LogisticsMilestone[]
}

export interface LogisticsMilestone {
  label: string
  timestamp?: string
  completed: boolean
}

export interface SettlementRef {
  id: string
  amount: number
  status: SettlementStatus
  paidAt?: string | null
  method?: string
}

export interface EvidenceRef {
  id: string
  type: 'image' | 'pdf' | 'notes'
  url: string
  uploadedAt: string
}

export interface AuditTrailEvent {
  id: string
  action: string
  actorId: string
  timestamp: string
  notes?: string | null
}

export interface Transaction {
  id: string
  type: 'auction' | 'offer'
  date: string
  amount: number
  currency: string
  status: TransactionStatus
  settlementStatus?: SettlementStatus
  auctionId?: string | null
  assetId: string
  assetName?: string
  thumbnailUrl?: string | null
  buyerId: string
  sellerId: string
  invoice?: InvoiceRef | null
  dispute?: DisputeRef | null
  logistics?: LogisticsRef | null
  settlement?: SettlementRef | null
  createdAt: string
  updatedAt: string
}

export interface TransactionHistoryFilters {
  startDate?: string
  endDate?: string
  status?: TransactionStatus
  auctionId?: string
  transactionId?: string
}

export interface InitiateDisputePayload {
  reason: string
  description?: string
  attachmentUrls?: string[]
}
