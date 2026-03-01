/**
 * Checkout API - post-auction payment flow.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { api } from '@/lib/api'
import type {
  InitializeCheckoutResponse,
  PayCheckoutRequest,
  PayCheckoutResponse,
  Invoice,
  InvoiceSummary,
  ReceiptData,
  PaymentMethod,
  DepositHold,
  WebhookAuditEntry,
} from '@/types/checkout'

function safeArray<T>(v: unknown): T[] {
  if (v == null) return []
  if (!Array.isArray(v)) return []
  return v as T[]
}

export async function initializeCheckout(
  auctionId: string
): Promise<InitializeCheckoutResponse | null> {
  if (!auctionId?.trim()) return null
  try {
    const data = await api.post<InitializeCheckoutResponse>(
      `/api/checkout/${encodeURIComponent(auctionId)}/initialize`,
      {}
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function fetchInvoice(
  auctionId: string
): Promise<Invoice | null> {
  if (!auctionId?.trim()) return null
  try {
    const data = await api.get<{ invoice?: Invoice | null }>(
      `/api/checkout/${encodeURIComponent(auctionId)}/invoice`
    )
    const invoice = data?.invoice ?? null
    return invoice ?? null
  } catch {
    return null
  }
}

export async function payCheckout(
  auctionId: string,
  payload: PayCheckoutRequest,
  idempotencyKey?: string
): Promise<PayCheckoutResponse | null> {
  if (!auctionId?.trim()) return null
  const headers: Record<string, string> = {}
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey
  }
  try {
    const data = await api.postWithHeaders<PayCheckoutResponse>(
      `/api/checkout/${encodeURIComponent(auctionId)}/pay`,
      payload,
      Object.keys(headers).length > 0 ? headers : undefined
    )
    return data ?? null
  } catch {
    return null
  }
}

export async function captureDeposit(
  invoiceId: string
): Promise<{ success: boolean; error?: string }> {
  if (!invoiceId?.trim()) return { success: false, error: 'Invalid invoice' }
  try {
    const data = await api.post<{ success?: boolean; error?: string }>(
      `/api/checkout/${encodeURIComponent(invoiceId)}/capture-deposit`,
      {}
    )
    return {
      success: data?.success ?? false,
      error: data?.error ?? undefined,
    }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to capture deposit' }
  }
}

export async function fetchReceipt(
  invoiceId: string
): Promise<ReceiptData | null> {
  if (!invoiceId?.trim()) return null
  try {
    const data = await api.get<ReceiptData | { receipt?: ReceiptData }>(
      `/api/checkout/${encodeURIComponent(invoiceId)}/receipt`
    )
    if (data && 'receipt' in data) {
      return data.receipt ?? null
    }
    return (data as ReceiptData) ?? null
  } catch {
    return null
  }
}

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  try {
    const data = await api.get<{ methods?: PaymentMethod[] }>(
      '/api/checkout/payment-methods'
    )
    const methods = data?.methods ?? []
    return Array.isArray(methods) ? methods : []
  } catch {
    return []
  }
}

export async function fetchWebhookAudit(): Promise<WebhookAuditEntry[]> {
  try {
    const data = await api.get<{ entries?: WebhookAuditEntry[] }>(
      '/api/admin/webhooks/audit'
    )
    const entries = data?.entries ?? []
    return Array.isArray(entries) ? entries : []
  } catch {
    return []
  }
}

export function buildInvoiceSummary(invoice: Invoice | null): InvoiceSummary | null {
  if (!invoice) return null
  const salePrice = Number(invoice.amount) ?? 0
  const fees = Number(invoice.fees) ?? 0
  const tax = Number(invoice.tax) ?? 0
  const discounts = 0
  const total = salePrice + fees + tax - discounts
  const platformFeePercent = 0.05
  const payoutToSeller = salePrice * (1 - platformFeePercent) - fees
  return {
    salePrice,
    fees,
    tax,
    discounts,
    total,
    currency: invoice.currency ?? 'USD',
    payoutToSeller: Math.max(0, payoutToSeller),
    paymentDueDate: invoice.dueDate ?? '',
    depositRequired: Boolean(invoice.depositRequired),
    depositAmount: Number(invoice.depositAmount) ?? 0,
  }
}
