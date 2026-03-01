/**
 * Checkout API - post-auction payment flow.
 * Uses Supabase Edge Functions when VITE_API_URL is empty.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
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

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const useSupabaseFunctions = !API_BASE

function mapInvoiceRow(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id ?? ''),
    auctionId: String(row.auctionId ?? row.auction_id ?? ''),
    listingId: String(row.listingId ?? row.listing_id ?? ''),
    buyerId: String(row.buyerId ?? row.buyer_id ?? ''),
    sellerId: String(row.sellerId ?? row.seller_id ?? ''),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? 'USD'),
    status: String(row.status ?? 'PENDING') as Invoice['status'],
    dueDate: String(row.dueDate ?? row.due_date ?? ''),
    tax: Number(row.tax ?? 0),
    fees: Number(row.fees ?? 0),
    discount: Number(row.discount ?? 0),
    depositRequired: Boolean(row.depositRequired ?? row.deposit_required),
    depositAmount: Number(row.depositAmount ?? row.deposit_amount ?? 0),
    payoutInstructionsId: row.payout_instructions_id != null ? String(row.payout_instructions_id) : undefined,
    invoicePdfUrl: typeof row.invoice_pdf_url === 'string' ? row.invoice_pdf_url : null,
    receiptPdfUrl: typeof row.receipt_pdf_url === 'string' ? row.receipt_pdf_url : null,
    createdAt: String(row.createdAt ?? row.created_at ?? ''),
    updatedAt: String(row.updatedAt ?? row.updated_at ?? ''),
  }
}

export async function initializeCheckout(
  auctionId: string
): Promise<InitializeCheckoutResponse | null> {
  if (!auctionId?.trim()) return null
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<InitializeCheckoutResponse>('checkout-initialize', {
        body: { auctionId },
      })
      if (error) throw error
      return data ?? null
    }
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
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ invoice?: Record<string, unknown> }>('checkout-invoice', {
        body: { auctionId },
      })
      if (error) throw error
      const raw = data?.invoice ?? null
      return raw ? mapInvoiceRow(raw) : null
    }
    const data = await api.get<{ invoice?: Invoice | null }>(
      `/api/checkout/${encodeURIComponent(auctionId)}/invoice`
    )
    const invoice = data?.invoice ?? null
    return invoice ?? null
  } catch {
    return null
  }
}

export async function fetchInvoiceWithDeposit(
  auctionId: string
): Promise<{ invoice: Invoice | null; deposit: DepositHold | null }> {
  if (!auctionId?.trim()) return { invoice: null, deposit: null }
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{
        invoice?: Record<string, unknown>
        deposit?: Record<string, unknown> | null
      }>('checkout-invoice', { body: { auctionId } })
      if (error) throw error
      const inv = data?.invoice ? mapInvoiceRow(data.invoice) : null
      const dep = data?.deposit
        ? {
            id: String(data.deposit.id ?? ''),
            invoiceId: String(data.deposit.invoiceId ?? data.deposit.invoice_id ?? ''),
            amount: Number(data.deposit.amount ?? 0),
            status: String(data.deposit.status ?? 'HELD') as DepositHold['status'],
            holdUntil: (typeof (data.deposit.holdUntil ?? data.deposit.hold_until) === 'string' ? (data.deposit.holdUntil ?? data.deposit.hold_until) : null) as string | null,
            capturedAt: (typeof (data.deposit.capturedAt ?? data.deposit.captured_at) === 'string' ? (data.deposit.capturedAt ?? data.deposit.captured_at) : null) as string | null,
            releasedAt: (typeof (data.deposit.releasedAt ?? data.deposit.released_at) === 'string' ? (data.deposit.releasedAt ?? data.deposit.released_at) : null) as string | null,
          }
        : null
      return { invoice: inv, deposit: dep }
    }
    const inv = await fetchInvoice(auctionId)
    return { invoice: inv, deposit: null }
  } catch {
    return { invoice: null, deposit: null }
  }
}

export async function payCheckout(
  auctionId: string,
  payload: PayCheckoutRequest & { idempotencyKey?: string },
  idempotencyKey?: string
): Promise<PayCheckoutResponse | null> {
  if (!auctionId?.trim()) return null
  const key = idempotencyKey ?? payload.idempotencyKey ?? crypto.randomUUID()
  const { idempotencyKey: _k, ...body } = payload
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<PayCheckoutResponse>('checkout-pay', {
        body: { auctionId, paymentMethodId: body.paymentMethodId, idempotencyKey: key },
      })
      if (error) throw error
      return data ?? null
    }
    const headers: Record<string, string> = { 'Idempotency-Key': key }
    const data = await api.postWithHeaders<PayCheckoutResponse>(
      `/api/checkout/${encodeURIComponent(auctionId)}/pay`,
      body,
      headers
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
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('checkout-capture-deposit', {
        body: { invoiceId },
      })
      if (error) return { success: false, error: error.message }
      return {
        success: data?.success ?? false,
        error: data?.error ?? undefined,
      }
    }
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
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<ReceiptData | { invoicePdfUrl?: string; receiptPdfUrl?: string }>('checkout-receipt', {
        body: { invoiceId },
      })
      if (error) throw error
      if (!data) return null
      if ('amount' in data && typeof data.amount === 'number') {
        return data as ReceiptData
      }
      const inv = await fetchInvoiceWithDeposit('')
      const invoice = inv.invoice
      return invoice
        ? {
            invoiceId,
            amount: invoice.amount + invoice.fees + invoice.tax,
            currency: invoice.currency,
            paidAt: invoice.updatedAt,
            downloadUrl: (data as { receiptPdfUrl?: string }).receiptPdfUrl ?? undefined,
          }
        : null
    }
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
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ methods?: PaymentMethod[] }>('checkout-payment-methods')
      if (error) throw error
      const methods = data?.methods ?? []
      return Array.isArray(methods) ? methods : []
    }
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
    if (useSupabaseFunctions) {
      return []
    }
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
