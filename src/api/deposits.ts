/**
 * Deposits API - Cart / pre-bidding deposit holds.
 * Uses Supabase Edge Functions when VITE_API_URL is empty.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  DepositHold,
  CreateDepositRequest,
  CreateDepositResponse,
  DepositRequirements,
  HoldType,
  ReleaseRule,
} from '@/types/deposits'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const useSupabaseFunctions = !API_BASE

function mapDepositRow(row: Record<string, unknown>): DepositHold {
  const releaseRule = row.release_rule ?? row.releaseRule
  return {
    id: String(row.id ?? ''),
    buyerId: String(row.buyer_id ?? row.buyerId ?? ''),
    auctionId: String(row.auction_id ?? row.auctionId ?? ''),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? 'USD'),
    status: String(row.status ?? 'holding') as DepositHold['status'],
    expiresAt:
      typeof (row.expires_at ?? row.expiresAt) === 'string'
        ? (row.expires_at ?? row.expiresAt) as string
        : null,
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    updatedAt: String(row.updated_at ?? row.updatedAt ?? ''),
    paymentMethodId:
      typeof (row.payment_method_id ?? row.paymentMethodId) === 'string'
        ? ((row.payment_method_id ?? row.paymentMethodId) as string)
        : undefined,
    stripePaymentIntentId:
      typeof (row.stripe_payment_intent_id ?? row.stripePaymentIntentId) === 'string'
        ? (row.stripe_payment_intent_id ?? row.stripePaymentIntentId) as string
        : null,
    holdType: (String(row.hold_type ?? row.holdType ?? 'deposit') || 'deposit') as HoldType,
    releaseRule:
      releaseRule != null && typeof releaseRule === 'object'
        ? (releaseRule as ReleaseRule)
        : undefined,
    notes:
      typeof (row.notes ?? '') === 'string' ? (row.notes as string) : null,
    capturedAt:
      typeof (row.captured_at ?? row.capturedAt) === 'string'
        ? (row.captured_at ?? row.capturedAt) as string
        : null,
    releasedAt:
      typeof (row.released_at ?? row.releasedAt) === 'string'
        ? (row.released_at ?? row.releasedAt) as string
        : null,
    auctionTitle:
      typeof (row.auction_title ?? row.auctionTitle) === 'string'
        ? (row.auction_title ?? row.auctionTitle) as string
        : null,
    listingId:
      typeof (row.listing_id ?? row.listingId) === 'string'
        ? (row.listing_id ?? row.listingId) as string
        : null,
  }
}

export async function fetchDeposits(buyerId?: string): Promise<DepositHold[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{
        deposits?: Record<string, unknown>[]
      }>('deposits-list', { body: { buyerId: buyerId ?? undefined } })
      if (error) throw error
      const list = data?.deposits ?? []
      return Array.isArray(list) ? list.map(mapDepositRow) : []
    }
    const params = buyerId ? `?buyerId=${encodeURIComponent(buyerId)}` : ''
    const data = await api.get<{ deposits?: DepositHold[] }>(
      `/api/deposits${params}`
    )
    const list = data?.deposits ?? []
    return Array.isArray(list) ? list : []
  } catch {
    return []
  }
}

export async function createDeposit(
  payload: CreateDepositRequest
): Promise<CreateDepositResponse | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<Record<string, unknown> & { clientSecret?: string }>('deposits-create', { body: payload })
      if (error) throw error
      const dep = (data?.deposit ?? data) as Record<string, unknown> | null
      if (!dep) return null
      const mapped = mapDepositRow(dep)
      return { ...mapped, clientSecret: (data?.clientSecret ?? dep.clientSecret) as string | null ?? null }
    }
    const data = await api.post<CreateDepositResponse | { deposit?: DepositHold }>('/api/deposits', payload)
    const dep = data && 'deposit' in data ? data.deposit : data
    return dep ? (dep as CreateDepositResponse) : null
  } catch {
    return null
  }
}

export async function captureDeposit(
  depositId: string,
  paymentMethodId: string
): Promise<{ success: boolean; error?: string }> {
  if (!depositId?.trim() || !paymentMethodId?.trim()) {
    return { success: false, error: 'depositId and paymentMethodId required' }
  }
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{
        success?: boolean
        error?: string
      }>('deposits-capture', {
        body: { depositId, paymentMethodId },
      })
      if (error) return { success: false, error: error.message }
      return {
        success: data?.success ?? false,
        error: data?.error ?? undefined,
      }
    }
    const data = await api.post<{ success?: boolean; error?: string }>(
      `/api/deposits/${encodeURIComponent(depositId)}/capture`,
      { paymentMethodId }
    )
    return {
      success: data?.success ?? false,
      error: data?.error ?? undefined,
    }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to capture' }
  }
}

export async function releaseDeposit(
  depositId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{
        success?: boolean
        error?: string
      }>('deposits-release', { body: { depositId } })
      if (error) return { success: false, error: error.message }
      return {
        success: data?.success ?? false,
        error: data?.error ?? undefined,
      }
    }
    const data = await api.post<{ success?: boolean; error?: string }>(
      `/api/deposits/${encodeURIComponent(depositId)}/release`,
      {}
    )
    return {
      success: data?.success ?? false,
      error: data?.error ?? undefined,
    }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to release' }
  }
}

export async function extendDeposit(
  depositId: string,
  extendByHours?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{
        success?: boolean
        error?: string
      }>('deposits-extend', {
        body: { depositId, extendByHours: extendByHours ?? 24 },
      })
      if (error) return { success: false, error: error.message }
      return {
        success: data?.success ?? false,
        error: data?.error ?? undefined,
      }
    }
    const data = await api.post<{ success?: boolean; error?: string }>(
      `/api/deposits/${encodeURIComponent(depositId)}/extend`,
      { extendByHours: extendByHours ?? 24 }
    )
    return {
      success: data?.success ?? false,
      error: data?.error ?? undefined,
    }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to extend' }
  }
}

export async function fetchDepositDetails(
  depositId: string
): Promise<DepositHold | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{
        deposit?: Record<string, unknown>
      }>('deposits-details', { body: { depositId } })
      if (error) throw error
      const dep = data?.deposit ?? null
      return dep ? mapDepositRow(dep) : null
    }
    const data = await api.get<{ deposit?: DepositHold }>(
      `/api/deposits/${encodeURIComponent(depositId)}/details`
    )
    const dep = data?.deposit ?? null
    return dep ?? null
  } catch {
    return null
  }
}

export async function getDepositClientSecret(depositId: string): Promise<string | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ clientSecret?: string | null }>('deposits-get-client-secret', {
        body: { depositId },
      })
      if (error) throw error
      return data?.clientSecret ?? null
    }
    const data = await api.post<{ clientSecret?: string | null }>(
      `/api/deposits/${encodeURIComponent(depositId)}/client-secret`,
      {}
    )
    return data?.clientSecret ?? null
  } catch {
    return null
  }
}

export async function fetchDepositRequirements(
  auctionId?: string
): Promise<DepositRequirements[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{
        requirements?: Record<string, unknown>[]
      }>('deposits-requirements', {
        body: { auctionId: auctionId ?? undefined },
      })
      if (error) throw error
    const list = data?.requirements ?? []
    return Array.isArray(list)
        ? list.map((r): DepositRequirements => ({
            auctionId: String(r.auctionId ?? r.auction_id ?? ''),
            auctionTitle: typeof r.auctionTitle === 'string' ? r.auctionTitle : undefined,
            listingId: typeof r.listingId === 'string' ? r.listingId : undefined,
            requiredAmount: Number(r.requiredAmount ?? r.required_amount ?? 0),
            currency: String(r.currency ?? 'USD'),
            expiryHours: typeof r.expiryHours === 'number' ? r.expiryHours : undefined,
            releaseConditions: typeof r.releaseConditions === 'string' ? r.releaseConditions : (r.release_conditions as string) ?? undefined,
            releaseRule: (r.releaseRule ?? r.release_rule) as ReleaseRule | undefined,
            hasActiveHold: Boolean(r.hasActiveHold ?? r.has_active_hold),
            activeHoldId:
              typeof (r.activeHoldId ?? r.active_hold_id) === 'string'
                ? (r.activeHoldId ?? r.active_hold_id) as string
                : null,
          }))
        : []
    }
    const params = auctionId ? `?auctionId=${encodeURIComponent(auctionId)}` : ''
    const data = await api.get<{ requirements?: Record<string, unknown>[] }>(
      `/api/deposits/requirements${params}`
    )
    const list = data?.requirements ?? []
    return Array.isArray(list)
      ? list.map((r): DepositRequirements => ({
          auctionId: String(r.auctionId ?? r.auction_id ?? ''),
          auctionTitle: typeof r.auctionTitle === 'string' ? r.auctionTitle : undefined,
          listingId: typeof r.listingId === 'string' ? r.listingId : undefined,
          requiredAmount: Number(r.requiredAmount ?? r.required_amount ?? 0),
          currency: String(r.currency ?? 'USD'),
          expiryHours: typeof r.expiryHours === 'number' ? r.expiryHours : undefined,
          releaseConditions: typeof r.releaseConditions === 'string' ? r.releaseConditions : (r.release_conditions as string) ?? undefined,
          releaseRule: (r.releaseRule ?? r.release_rule) as ReleaseRule | undefined,
          hasActiveHold: Boolean(r.hasActiveHold ?? r.has_active_hold),
          activeHoldId:
            typeof (r.activeHoldId ?? r.active_hold_id) === 'string'
              ? (r.activeHoldId ?? r.active_hold_id) as string
              : null,
        }))
      : []
  } catch {
    return []
  }
}
