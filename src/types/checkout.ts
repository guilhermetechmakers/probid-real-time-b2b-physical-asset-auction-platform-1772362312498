/**
 * Checkout / Payment types.
 * All types support runtime safety with optional fields and array guards.
 */

export type InvoiceStatus =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'CANCELLED'
  | 'COMPLETE'

export type PaymentStatus =
  | 'succeeded'
  | 'requires_payment_method'
  | 'requires_action'
  | 'failed'

export type DepositStatus = 'HELD' | 'RELEASED' | 'CAPTURED'

export type PayoutStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export interface PayoutInstructions {
  id: string
  sellerId: string
  bankAccountId?: string
  routingNumber?: string
  instructionsJson?: Record<string, unknown>
}

export interface Invoice {
  id: string
  auctionId: string
  listingId: string
  buyerId: string
  sellerId: string
  amount: number
  currency: string
  status: InvoiceStatus
  dueDate: string
  tax: number
  fees: number
  discount: number
  depositRequired: boolean
  depositAmount: number
  payoutInstructionsId?: string
  invoicePdfUrl?: string | null
  receiptPdfUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface PaymentMethod {
  id: string
  brand?: string
  last4?: string
  expMonth?: number
  expYear?: number
  isDefault?: boolean
}

export interface DepositHold {
  id: string
  invoiceId: string
  amount: number
  status: DepositStatus
  holdUntil?: string | null
  capturedAt?: string | null
  releasedAt?: string | null
}

export interface InitializeCheckoutResponse {
  invoiceId: string
  dueAmount: number
  currency: string
  clientSecret?: string
  depositInfo?: {
    required: boolean
    amount: number
    holdUntil?: string
  }
  payoutInstructions?: PayoutInstructions
}

export interface PayCheckoutRequest {
  paymentMethodId: string
  idempotencyKey?: string
}

export interface PayCheckoutResponse {
  paymentStatus: PaymentStatus
  invoiceId: string
  invoiceStatus?: InvoiceStatus
}

export interface FeesConfig {
  platformFeePercent?: number
  platformFeeFixed?: number
  taxRate?: number
}

export interface InvoiceSummary {
  salePrice: number
  fees: number
  tax: number
  discounts: number
  total: number
  currency: string
  payoutToSeller: number
  paymentDueDate: string
  depositRequired: boolean
  depositAmount: number
}

export interface ReceiptData {
  invoiceId: string
  amount: number
  currency: string
  paidAt?: string
  downloadUrl?: string
  invoicePdfUrl?: string | null
  receiptPdfUrl?: string | null
}

export interface WebhookAuditEntry {
  id: string
  eventId: string
  type: string
  processedAt: string
  status: 'PROCESSED' | 'ERROR'
}
