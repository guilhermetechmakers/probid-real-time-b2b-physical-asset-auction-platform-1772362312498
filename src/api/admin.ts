/**
 * Admin API - Ops Queue, Buyers, Auctions, Disputes, Finance, RBAC, Audit Logs.
 * Uses Supabase Edge Functions when VITE_API_URL is empty.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  AdminListing,
  AdminBuyer,
  AdminAuction,
  AdminDispute,
  FinanceMetrics,
  FinanceLedgerEntry,
  Role,
  AuditLogEntry,
  AdminDashboardMetrics,
} from '@/types/admin'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const useSupabaseFunctions = !API_BASE

function mapListing(row: Record<string, unknown>): AdminListing {
  const urls = row.image_urls ?? row.imageUrls ?? []
  return {
    id: String(row.id ?? ''),
    sellerId: String(row.seller_id ?? row.sellerId ?? ''),
    sellerName: typeof row.seller_name === 'string' ? row.seller_name : (row.sellerName as string | undefined),
    identifier: typeof row.identifier === 'string' ? row.identifier : undefined,
    title: String(row.title ?? ''),
    description: typeof row.description === 'string' ? row.description : undefined,
    status: (row.status ?? 'draft') as AdminListing['status'],
    reservePrice: typeof row.reserve_price === 'number' ? row.reserve_price : (row.reservePrice as number | undefined),
    startingPrice: typeof row.starting_price === 'number' ? row.starting_price : (row.startingPrice as number | undefined),
    currentBid: typeof row.current_bid === 'number' ? row.current_bid : (row.currentBid as number | undefined),
    imageUrls: Array.isArray(urls) ? urls.map(String) : [],
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? ''),
    dueDate: typeof row.due_date === 'string' ? row.due_date : (row.dueDate as string | undefined),
    inspectorId: typeof row.inspector_id === 'string' ? row.inspector_id : (row.inspectorId as string | undefined),
  }
}

function mapBuyer(row: Record<string, unknown>): AdminBuyer {
  const docs = row.documents ?? row.kyc_documents ?? []
  return {
    id: String(row.id ?? ''),
    userId: String(row.user_id ?? row.userId ?? ''),
    email: typeof row.email === 'string' ? row.email : undefined,
    name: typeof row.name === 'string' ? row.name : undefined,
    kycStatus: (row.kyc_status ?? row.kycStatus ?? 'pending') as AdminBuyer['kycStatus'],
    verificationStatus: String(row.verification_status ?? row.verificationStatus ?? 'pending'),
    adminApproved: Boolean(row.admin_approved ?? row.adminApproved ?? false),
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? ''),
    submittedAt: typeof row.submitted_at === 'string' ? row.submitted_at : (row.submittedAt as string | undefined),
    documents: Array.isArray(docs) ? docs.map((d: unknown) => (typeof d === 'object' && d && 'type' in d && 'url' in d) ? { type: String((d as Record<string, unknown>).type), url: String((d as Record<string, unknown>).url) } : { type: 'unknown', url: '' }) : undefined,
  }
}

function mapAuction(row: Record<string, unknown>): AdminAuction {
  return {
    id: String(row.id ?? ''),
    listingId: String(row.listing_id ?? row.listingId ?? ''),
    listingTitle: typeof row.listing_title === 'string' ? row.listing_title : (row.listingTitle as string | undefined),
    status: (row.status ?? 'scheduled') as AdminAuction['status'],
    startTime: String(row.start_time ?? row.startTime ?? ''),
    endTime: String(row.end_time ?? row.endTime ?? ''),
    reservePrice: typeof row.reserve_price === 'number' ? row.reserve_price : (row.reservePrice as number | undefined),
    currentBid: typeof row.current_bid === 'number' ? row.current_bid : (row.currentBid as number | undefined),
    bidCount: typeof row.bid_count === 'number' ? row.bid_count : (row.bidCount as number | undefined),
    paused: Boolean(row.paused ?? false),
    extendedMinutes: typeof row.extended_minutes === 'number' ? row.extended_minutes : (row.extendedMinutes as number | undefined),
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
  }
}

function mapDispute(row: Record<string, unknown>): AdminDispute {
  const links = row.evidence_links ?? row.evidenceLinks ?? []
  return {
    id: String(row.id ?? ''),
    transactionId: String(row.transaction_id ?? row.transactionId ?? ''),
    initiatorId: String(row.initiator_id ?? row.initiatorId ?? ''),
    initiatorEmail: typeof row.initiator_email === 'string' ? row.initiator_email : (row.initiatorEmail as string | undefined),
    status: (row.status ?? 'initiated') as AdminDispute['status'],
    reason: String(row.reason ?? ''),
    description: typeof row.description === 'string' ? row.description : undefined,
    caseNotes: typeof row.case_notes === 'string' ? row.case_notes : (row.caseNotes as string | undefined),
    evidenceLinks: Array.isArray(links) ? links.map(String) : undefined,
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? ''),
    resolvedAt: typeof row.resolved_at === 'string' ? row.resolved_at : (row.resolvedAt as string | undefined),
  }
}

function mapAuditLog(row: Record<string, unknown>): AuditLogEntry {
  return {
    id: String(row.id ?? ''),
    action: String(row.action ?? ''),
    entityType: typeof row.entity_type === 'string' ? row.entity_type : (row.target_type as string | undefined),
    entityId: typeof (row.entity_id ?? row.target_id) === 'string' ? (row.entity_id ?? row.target_id) as string : undefined,
    actorId: String(row.actor_id ?? row.actorId ?? ''),
    actorEmail: typeof row.actor_email === 'string' ? row.actor_email : undefined,
    metadata: row.metadata != null && typeof row.metadata === 'object' ? (row.metadata as Record<string, unknown>) : undefined,
    timestamp: String(row.timestamp ?? row.created_at ?? ''),
    immutable: Boolean(row.immutable ?? true),
  }
}

export async function fetchAdminMetrics(): Promise<AdminDashboardMetrics> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ metrics?: Record<string, unknown> }>('admin-metrics', { body: {} })
      if (error) throw error
      const m = (data?.metrics ?? data ?? {}) as Record<string, unknown>
      return {
        pendingListings: Number(m.pendingListings ?? m.pending_listings ?? 0),
        pendingBuyerApprovals: Number(m.pendingBuyerApprovals ?? m.pending_buyer_approvals ?? 0),
        liveAuctions: Number(m.liveAuctions ?? m.live_auctions ?? 0),
        openDisputes: Number(m.openDisputes ?? m.open_disputes ?? 0),
        totalRevenue: Number(m.totalRevenue ?? m.total_revenue ?? 0),
      }
    }
    const data = await api.get<{ metrics?: Record<string, unknown> }>('/api/admin/metrics')
    const m = data?.metrics ?? {}
    return {
      pendingListings: Number(m.pendingListings ?? m.pending_listings ?? 0),
      pendingBuyerApprovals: Number(m.pendingBuyerApprovals ?? m.pending_buyer_approvals ?? 0),
      liveAuctions: Number(m.liveAuctions ?? m.live_auctions ?? 0),
      openDisputes: Number(m.openDisputes ?? m.open_disputes ?? 0),
      totalRevenue: Number(m.totalRevenue ?? m.total_revenue ?? 0),
    }
  } catch {
    return { pendingListings: 0, pendingBuyerApprovals: 0, liveAuctions: 0, openDisputes: 0, totalRevenue: 0 }
  }
}

/** Alias for fetchOpsListings - accepts object with optional status */
export async function fetchAdminListings(opts?: { status?: string }): Promise<AdminListing[]> {
  return fetchOpsListings(opts?.status)
}

export async function fetchOpsListings(status?: string): Promise<AdminListing[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ listings?: Record<string, unknown>[] }>('admin-listings', { body: { status } })
      if (error) throw error
      const list = data?.listings ?? []
      return Array.isArray(list) ? list.map(mapListing) : []
    }
    const endpoint = status ? `/api/admin/listings?status=${encodeURIComponent(status)}` : '/api/admin/listings'
    const data = await api.get<{ listings?: Record<string, unknown>[] }>(endpoint)
    const list = data?.listings ?? []
    return Array.isArray(list) ? list.map(mapListing) : []
  } catch {
    return []
  }
}

export async function approveListing(id: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-listings-approve', { body: { id, reason } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/listings/${encodeURIComponent(id)}/approve`, { reason })
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to approve listing' }
  }
}

export async function rejectListing(id: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-listings-reject', { body: { id, reason } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/listings/${encodeURIComponent(id)}/reject`, { reason })
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to reject listing' }
  }
}

export async function requestListingChanges(id: string, checklist: { label: string; completed: boolean }[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-listings-request-changes', { body: { id, checklist } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/listings/${encodeURIComponent(id)}/request-changes`, { checklist })
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to request changes' }
  }
}

export async function fetchAdminBuyers(status?: string): Promise<AdminBuyer[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ buyers?: Record<string, unknown>[] }>('admin-buyers', { body: { status } })
      if (error) throw error
      const list = data?.buyers ?? []
      return Array.isArray(list) ? list.map(mapBuyer) : []
    }
    const endpoint = status ? `/api/admin/buyers?status=${encodeURIComponent(status)}` : '/api/admin/buyers'
    const data = await api.get<{ buyers?: Record<string, unknown>[] }>(endpoint)
    const list = data?.buyers ?? []
    return Array.isArray(list) ? list.map(mapBuyer) : []
  } catch {
    return []
  }
}

export async function approveBuyer(id: string, decision: 'approve' | 'deny', notes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-buyers-approve', { body: { id, decision, notes } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/buyers/${encodeURIComponent(id)}/approve`, { decision, notes })
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to process buyer' }
  }
}

export async function fetchAdminAuctions(status?: string): Promise<AdminAuction[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ auctions?: Record<string, unknown>[] }>('admin-auctions', { body: { status } })
      if (error) throw error
      const list = data?.auctions ?? []
      return Array.isArray(list) ? list.map(mapAuction) : []
    }
    const endpoint = status ? `/api/admin/auctions?status=${encodeURIComponent(status)}` : '/api/admin/auctions'
    const data = await api.get<{ auctions?: Record<string, unknown>[] }>(endpoint)
    const list = data?.auctions ?? []
    return Array.isArray(list) ? list.map(mapAuction) : []
  } catch {
    return []
  }
}

export async function pauseAuction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-auctions-pause', { body: { id } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/auctions/${encodeURIComponent(id)}/pause`, {})
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to pause auction' }
  }
}

export async function extendAuction(id: string, minutes: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-auctions-extend', { body: { id, minutes } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/auctions/${encodeURIComponent(id)}/extend`, { minutes })
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to extend auction' }
  }
}

export async function cancelAuction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-auctions-cancel', { body: { id } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/auctions/${encodeURIComponent(id)}/cancel`, {})
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to cancel auction' }
  }
}

export async function fetchAdminDisputes(status?: string): Promise<AdminDispute[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ disputes?: Record<string, unknown>[] }>('admin-disputes', { body: { status } })
      if (error) throw error
      const list = data?.disputes ?? []
      return Array.isArray(list) ? list.map(mapDispute) : []
    }
    const endpoint = status ? `/api/admin/disputes?status=${encodeURIComponent(status)}` : '/api/admin/disputes'
    const data = await api.get<{ disputes?: Record<string, unknown>[] }>(endpoint)
    const list = data?.disputes ?? []
    return Array.isArray(list) ? list.map(mapDispute) : []
  } catch {
    return []
  }
}

export async function resolveDispute(id: string, resolution: string, notes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-disputes-resolve', { body: { id, resolution, notes } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/disputes/${encodeURIComponent(id)}/resolution`, { resolution, notes })
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to resolve dispute' }
  }
}

export async function fetchFinanceLedger(): Promise<FinanceLedgerEntry[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ entries?: Record<string, unknown>[]; ledger?: Record<string, unknown>[] }>('admin-finance-ledger', { body: {} })
      if (error) throw error
      const list = data?.entries ?? data?.ledger ?? []
      return Array.isArray(list)
        ? list.map((r) => ({
            id: String(r.id ?? ''),
            type: (['subscription', 'fee', 'deposit', 'payout'].includes(String(r.type ?? '')) ? r.type : 'fee') as FinanceLedgerEntry['type'],
            amount: Number(r.amount ?? 0),
            currency: String(r.currency ?? 'USD'),
            status: String(r.status ?? ''),
            createdAt: String(r.timestamp ?? r.created_at ?? r.createdAt ?? ''),
            description: typeof r.description === 'string' ? r.description : undefined,
          }))
        : []
    }
    const data = await api.get<{ entries?: Record<string, unknown>[] }>('/api/admin/finance/ledger')
    const list = data?.entries ?? []
    return Array.isArray(list)
      ? list.map((r) => ({
          id: String(r.id ?? ''),
          type: (r.type ?? 'subscription') as FinanceLedgerEntry['type'],
          amount: Number(r.amount ?? 0),
          currency: String(r.currency ?? 'USD'),
          status: String(r.status ?? ''),
          createdAt: String(r.timestamp ?? r.created_at ?? r.createdAt ?? ''),
          description: typeof r.description === 'string' ? r.description : undefined,
        }))
      : []
  } catch {
    return []
  }
}

export async function fetchFinanceMetrics(): Promise<FinanceMetrics> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ metrics?: Record<string, unknown> }>('admin-finance-metrics', { body: {} })
      if (error) throw error
      const m = data?.metrics ?? {}
      return {
        totalRevenue: Number(m.totalRevenue ?? m.total_revenue ?? 0),
        subscriptionRevenue: Number(m.subscriptionRevenue ?? m.subscription_revenue ?? 0),
        transactionalFees: Number(m.transactionalFees ?? m.transactional_fees ?? 0),
        openDisputes: Number(m.openDisputes ?? m.open_disputes ?? 0),
        pendingPayouts: Number(m.pendingPayouts ?? m.pending_payouts ?? 0),
      }
    }
    const data = await api.get<{ metrics?: Record<string, unknown> }>('/api/admin/finance/metrics')
    const m = data?.metrics ?? {}
    return {
      totalRevenue: Number(m.totalRevenue ?? m.total_revenue ?? 0),
      subscriptionRevenue: Number(m.subscriptionRevenue ?? m.subscription_revenue ?? 0),
      transactionalFees: Number(m.transactionalFees ?? m.transactional_fees ?? 0),
      openDisputes: Number(m.openDisputes ?? m.open_disputes ?? 0),
      pendingPayouts: Number(m.pendingPayouts ?? m.pending_payouts ?? 0),
    }
  } catch {
    return { totalRevenue: 0, subscriptionRevenue: 0, transactionalFees: 0, openDisputes: 0, pendingPayouts: 0 }
  }
}

export async function fetchAuditLogs(filters?: { action?: string; entityType?: string; limit?: number }): Promise<AuditLogEntry[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ logs?: Record<string, unknown>[] }>('admin-audit-logs', { body: filters ?? {} })
      if (error) throw error
      const list = data?.logs ?? []
      return Array.isArray(list) ? list.map(mapAuditLog) : []
    }
    const params = new URLSearchParams()
    if (filters?.action) params.set('action', filters.action)
    if (filters?.entityType) params.set('entityType', filters.entityType)
    if (filters?.limit) params.set('limit', String(filters.limit))
    const qs = params.toString()
    const endpoint = qs ? `/api/admin/audit-logs?${qs}` : '/api/admin/audit-logs'
    const data = await api.get<{ logs?: Record<string, unknown>[] }>(endpoint)
    const list = data?.logs ?? []
    return Array.isArray(list) ? list.map(mapAuditLog) : []
  } catch {
    return []
  }
}

export async function fetchRoles(): Promise<Role[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ roles?: Record<string, unknown>[] }>('admin-rbac-roles', { body: {} })
      if (error) throw error
      const list = data?.roles ?? []
      return Array.isArray(list)
        ? list.map((r) => ({
            id: String(r.id ?? ''),
            name: String(r.name ?? ''),
            permissions: Array.isArray(r.permissions) ? r.permissions.map(String) : [],
            createdAt: typeof r.created_at === 'string' ? r.created_at : undefined,
          }))
        : []
    }
    const data = await api.get<{ roles?: Record<string, unknown>[] }>('/api/admin/rbac/roles')
    const list = data?.roles ?? []
    return Array.isArray(list)
      ? list.map((r) => ({
          id: String(r.id ?? ''),
          name: String(r.name ?? ''),
          permissions: Array.isArray(r.permissions) ? r.permissions.map(String) : [],
          createdAt: typeof r.created_at === 'string' ? r.created_at : undefined,
        }))
      : []
  } catch {
    return []
  }
}

export async function assignRole(userId: string, roleId: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('admin-rbac-assign', { body: { userId, roleId } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const res = await api.post<{ success?: boolean; error?: string }>(`/api/admin/rbac/users/${encodeURIComponent(userId)}/assign-role`, { roleId })
    return { success: res?.success ?? false, error: res?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to assign role' }
  }
}
