/**
 * Transaction History API - Order/Transaction history, disputes, export.
 * Uses Supabase Edge Functions. All responses guarded per runtime safety rules.
 */
import { supabase } from '@/lib/supabase'
import type {
  Transaction,
  TransactionHistoryFilters,
  InitiateDisputePayload,
  AuditTrailEvent,
  EvidenceRef,
} from '@/types/transaction-history'

function buildHistoryParams(role: 'buyer' | 'seller', filters?: TransactionHistoryFilters): string {
  const params = new URLSearchParams()
  params.set('role', role)
  if (filters?.startDate) params.set('startDate', filters.startDate)
  if (filters?.endDate) params.set('endDate', filters.endDate)
  if (filters?.status) params.set('status', filters.status)
  if (filters?.auctionId) params.set('auctionId', filters.auctionId)
  if (filters?.transactionId) params.set('transactionId', filters.transactionId)
  return params.toString()
}

export async function fetchTransactionHistory(
  role: 'buyer' | 'seller',
  filters?: TransactionHistoryFilters
): Promise<Transaction[]> {
  return fetchTransactionHistoryWithFetch(role, filters)
}

export async function fetchTransactionHistoryWithFetch(
  role: 'buyer' | 'seller',
  filters?: TransactionHistoryFilters
): Promise<Transaction[]> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return []

  const qs = buildHistoryParams(role, filters)
  const url = `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/transaction-history?${qs}`
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
    if (!res.ok) return []
    const json = await res.json()
    const list = json?.transactions ?? []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export async function initiateDispute(
  transactionId: string,
  payload: InitiateDisputePayload
): Promise<{ disputeId?: string; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke<{ dispute?: { id: string } }>(
      'dispute-initiate',
      {
        body: {
          transactionId,
          reason: payload.reason,
          description: payload.description ?? '',
          attachmentUrls: payload.attachmentUrls ?? [],
        },
      }
    )
    if (error) return { error: error.message }
    const id = data?.dispute?.id
    return id ? { disputeId: id } : { error: 'Failed to create dispute' }
  } catch (e) {
    const err = e as { message?: string }
    return { error: err?.message ?? 'Failed to initiate dispute' }
  }
}

export async function addDisputeEvidence(
  disputeId: string,
  url: string,
  type: 'image' | 'pdf' | 'notes' = 'image'
): Promise<{ evidence?: EvidenceRef; error?: string }> {
  try {
    const { data, error } = await supabase.functions.invoke<{ evidence?: EvidenceRef }>(
      'dispute-evidence',
      {
        body: { disputeId, url, type },
      }
    )
    if (error) return { error: error.message }
    return { evidence: data?.evidence ?? undefined }
  } catch (e) {
    const err = e as { message?: string }
    return { error: err?.message ?? 'Failed to add evidence' }
  }
}

export async function fetchDisputeAudit(disputeId: string): Promise<AuditTrailEvent[]> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const token = session?.access_token
    if (!token) return []

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/dispute-audit?disputeId=${encodeURIComponent(disputeId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    )
    if (!res.ok) return []
    const json = await res.json()
    const list = json?.events ?? []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

function getComputedValue(t: Transaction, key: string): string | number | boolean | undefined {
  switch (key) {
    case 'dispute_status':
      return t?.dispute?.status ?? ''
    case 'invoice_present':
      return Boolean(t?.invoice?.id ?? t?.invoice?.pdfUrl) ? 'Yes' : 'No'
    case 'logistics_status':
      return t?.logistics?.status ?? ''
    default:
      return undefined
  }
}

export function exportTransactionsToCsv(
  transactions: Transaction[],
  columns: { key: keyof Transaction | string; label: string }[]
): string {
  const rows = (transactions ?? []).map((t) => {
    return columns
      .map((col) => {
        const computed = getComputedValue(t, col.key)
        const val = computed !== undefined ? computed : (t as unknown as Record<string, unknown>)[col.key]
        if (val == null) return ''
        const str = String(val)
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str
      })
      .join(',')
  })
  const header = columns.map((c) => (c.label.includes(',') ? `"${c.label}"` : c.label)).join(',')
  return [header, ...rows].join('\n')
}
