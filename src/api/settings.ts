/**
 * Settings API - Profile, notifications, subscription, KYC, integrations, API keys, sessions.
 * Uses Supabase Edge Functions when VITE_API_URL is empty.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  UserProfile,
  NotificationPreferences,
  SubscriptionInfo,
  Invoice,
  KycInfo,
  Integration,
  ApiKey,
  Session,
  SettingsProfilePayload,
  SettingsNotificationsPayload,
  CreateApiKeyPayload,
  CreateApiKeyResponse,
} from '@/types/settings'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const useSupabaseFunctions = !API_BASE

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: String(row.id ?? ''),
    email: String(row.email ?? ''),
    name: typeof row.name === 'string' ? row.name : undefined,
    company: typeof row.company === 'string' ? row.company : undefined,
    contactPhone: typeof row.contact_phone === 'string' ? row.contact_phone : (row.contactPhone as string | undefined),
    taxVat: typeof row.tax_vat === 'string' ? row.tax_vat : (row.taxVat as string | undefined),
    payoutAccountId: typeof row.payout_account_id === 'string' ? row.payout_account_id : (row.payoutAccountId as string | undefined),
    payoutLast4: typeof row.payout_last4 === 'string' ? row.payout_last4 : (row.payoutLast4 as string | undefined),
    avatarUrl: typeof row.avatar_url === 'string' ? row.avatar_url : (row.avatarUrl as string | undefined),
    createdAt: typeof row.created_at === 'string' ? row.created_at : undefined,
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : undefined,
  }
}

function mapNotifications(row: Record<string, unknown>): NotificationPreferences {
  return {
    email: Boolean(row.email ?? row.email_enabled ?? row.emailEnabled ?? true),
    sms: Boolean(row.sms ?? row.sms_enabled ?? row.smsEnabled ?? false),
    push: Boolean(row.push ?? row.push_enabled ?? row.pushEnabled ?? false),
    outbid: Boolean(row.outbid ?? row.outbid_enabled ?? true),
    auctionStart: Boolean(row.auction_start ?? row.auctionStart ?? true),
    inspectionScheduling: Boolean(row.inspection_scheduling ?? row.inspectionScheduling ?? true),
  }
}

function mapSubscription(row: Record<string, unknown> | null): SubscriptionInfo | null {
  if (!row) return null
  return {
    id: String(row.id ?? ''),
    planId: String(row.plan_id ?? row.planId ?? ''),
    planName: typeof row.plan_name === 'string' ? row.plan_name : (row.planName as string | undefined),
    status: (row.status ?? 'inactive') as SubscriptionInfo['status'],
    currentPeriodStart: typeof row.current_period_start === 'string' ? row.current_period_start : (row.currentPeriodStart as string | undefined),
    currentPeriodEnd: typeof row.current_period_end === 'string' ? row.current_period_end : (row.currentPeriodEnd as string | undefined),
    nextBillingDate: typeof row.next_billing_date === 'string' ? row.next_billing_date : (row.nextBillingDate as string | undefined),
    nextBillingAmount: typeof row.next_billing_amount === 'number' ? row.next_billing_amount : (row.nextBillingAmount as number | undefined),
    currency: typeof row.currency === 'string' ? row.currency : undefined,
  }
}

function mapInvoice(row: Record<string, unknown>): Invoice {
  return {
    id: String(row.id ?? ''),
    subscriptionId: typeof row.subscription_id === 'string' ? row.subscription_id : (row.subscriptionId as string | undefined),
    amountDue: Number(row.amount_due ?? row.amountDue ?? 0),
    currency: String(row.currency ?? 'USD'),
    status: String(row.status ?? ''),
    periodStart: typeof row.period_start === 'string' ? row.period_start : (row.periodStart as string | undefined),
    periodEnd: typeof row.period_end === 'string' ? row.period_end : (row.periodEnd as string | undefined),
    invoicePdfUrl: typeof row.invoice_pdf_url === 'string' ? row.invoice_pdf_url : (row.invoicePdfUrl as string | undefined),
    createdAt: typeof row.created_at === 'string' ? row.created_at : (row.createdAt as string | undefined),
  }
}

function mapKyc(row: Record<string, unknown>): KycInfo {
  const actions = row.required_actions ?? row.requiredActions
  return {
    status: (row.status ?? 'pending') as KycInfo['status'],
    submittedAt: typeof row.submitted_at === 'string' ? row.submitted_at : (row.submittedAt as string | undefined),
    reviewedAt: typeof row.reviewed_at === 'string' ? row.reviewed_at : (row.reviewedAt as string | undefined),
    reviewedBy: typeof row.reviewed_by === 'string' ? row.reviewed_by : (row.reviewedBy as string | undefined),
    notes: typeof row.notes === 'string' ? row.notes : undefined,
    requiredActions: Array.isArray(actions) ? actions.map(String) : [],
  }
}

function mapIntegration(row: Record<string, unknown>): Integration {
  return {
    id: String(row.id ?? ''),
    type: String(row.type ?? ''),
    name: String(row.name ?? row.type ?? ''),
    enabled: Boolean(row.enabled ?? true),
    config: row.config != null && typeof row.config === 'object' ? (row.config as Record<string, unknown>) : undefined,
    createdAt: typeof row.created_at === 'string' ? row.created_at : (row.createdAt as string | undefined),
    updatedAt: typeof row.updated_at === 'string' ? row.updated_at : (row.updatedAt as string | undefined),
  }
}

function mapApiKey(row: Record<string, unknown>): ApiKey {
  const scopes = row.scopes ?? []
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    scopes: Array.isArray(scopes) ? scopes.map(String) : [],
    createdAt: String(row.created_at ?? row.createdAt ?? ''),
    lastUsedAt: typeof (row.last_used_at ?? row.lastUsedAt) === 'string' ? (row.last_used_at ?? row.lastUsedAt) as string : undefined,
    status: (row.status ?? 'active') as ApiKey['status'],
    keyPrefix: typeof row.key_prefix === 'string' ? row.key_prefix : (row.keyPrefix as string | undefined),
  }
}

function mapSession(row: Record<string, unknown>): Session {
  return {
    id: String(row.id ?? ''),
    device: typeof row.device === 'string' ? row.device : undefined,
    os: typeof row.os === 'string' ? row.os : undefined,
    location: typeof row.location === 'string' ? row.location : undefined,
    lastActive: String(row.last_active ?? row.lastActive ?? ''),
    ipAddress: typeof row.ip_address === 'string' ? row.ip_address : (row.ipAddress as string | undefined),
    isActive: Boolean(row.is_active ?? row.isActive ?? true),
    isCurrent: Boolean(row.is_current ?? row.isCurrent ?? false),
  }
}

export async function fetchProfile(): Promise<UserProfile | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ profile?: Record<string, unknown> }>('settings-profile', { body: {} })
      if (error) throw error
      const p = data?.profile ?? null
      return p ? mapProfile(p) : null
    }
    const data = await api.get<{ profile?: Record<string, unknown> }>('/api/settings/profile')
    const p = data?.profile ?? null
    return p ? mapProfile(p) : null
  } catch {
    return null
  }
}

export async function updateProfile(payload: SettingsProfilePayload): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-profile-update', { body: payload })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.patch<{ success?: boolean; error?: string }>('/api/settings/profile', payload)
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to update profile' }
  }
}

export async function fetchNotifications(): Promise<NotificationPreferences> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ preferences?: Record<string, unknown> }>('settings-notifications', { body: {} })
      if (error) throw error
      const p = data?.preferences ?? {}
      return mapNotifications(p as Record<string, unknown>)
    }
    const data = await api.get<{ preferences?: Record<string, unknown> }>('/api/settings/notifications')
    const p = data?.preferences ?? {}
    return mapNotifications(p as Record<string, unknown>)
  } catch {
    return { email: true, sms: false, push: false, outbid: true, auctionStart: true, inspectionScheduling: true }
  }
}

export async function updateNotifications(payload: SettingsNotificationsPayload): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-notifications-update', { body: payload })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.patch<{ success?: boolean; error?: string }>('/api/settings/notifications', payload)
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to update notifications' }
  }
}

export async function fetchSubscription(): Promise<SubscriptionInfo | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ subscription?: Record<string, unknown> }>('settings-subscription', { body: {} })
      if (error) throw error
      return mapSubscription((data?.subscription ?? null) as Record<string, unknown> | null)
    }
    const data = await api.get<{ subscription?: Record<string, unknown> }>('/api/settings/subscription')
    return mapSubscription((data?.subscription ?? null) as Record<string, unknown> | null)
  } catch {
    return null
  }
}

export async function fetchInvoices(): Promise<Invoice[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ invoices?: Record<string, unknown>[] }>('settings-invoices', { body: {} })
      if (error) throw error
      const list = data?.invoices ?? []
      return Array.isArray(list) ? list.map(mapInvoice) : []
    }
    const data = await api.get<{ invoices?: Record<string, unknown>[] }>('/api/settings/invoices')
    const list = data?.invoices ?? []
    return Array.isArray(list) ? list.map(mapInvoice) : []
  } catch {
    return []
  }
}

export async function fetchKyc(): Promise<KycInfo | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ kyc?: Record<string, unknown> }>('settings-kyc', { body: {} })
      if (error) throw error
      const k = data?.kyc ?? null
      return k ? mapKyc(k) : null
    }
    const data = await api.get<{ kyc?: Record<string, unknown> }>('/api/settings/kyc')
    const k = data?.kyc ?? null
    return k ? mapKyc(k) : null
  } catch {
    return null
  }
}

export async function approveKyc(): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-kyc-approve', { body: {} })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.post<{ success?: boolean; error?: string }>('/api/settings/kyc/approve', {})
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to approve KYC' }
  }
}

export async function rejectKyc(notes?: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-kyc-reject', { body: { notes } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.post<{ success?: boolean; error?: string }>('/api/settings/kyc/reject', { notes })
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to reject KYC' }
  }
}

export async function fetchIntegrations(): Promise<Integration[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ integrations?: Record<string, unknown>[] }>('settings-integrations', { body: {} })
      if (error) throw error
      const list = data?.integrations ?? []
      return Array.isArray(list) ? list.map(mapIntegration) : []
    }
    const data = await api.get<{ integrations?: Record<string, unknown>[] }>('/api/settings/integrations')
    const list = data?.integrations ?? []
    return Array.isArray(list) ? list.map(mapIntegration) : []
  } catch {
    return []
  }
}

export async function updateIntegration(id: string, payload: Record<string, unknown>): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-integrations-update', { body: { id, ...payload } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.patch<{ success?: boolean; error?: string }>(`/api/settings/integrations/${encodeURIComponent(id)}`, payload)
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to update integration' }
  }
}

export async function fetchApiKeys(): Promise<ApiKey[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ apiKeys?: Record<string, unknown>[] }>('settings-apikeys', { body: {} })
      if (error) throw error
      const list = data?.apiKeys ?? []
      return Array.isArray(list) ? list.map(mapApiKey) : []
    }
    const data = await api.get<{ apiKeys?: Record<string, unknown>[] }>('/api/settings/apikeys')
    const list = data?.apiKeys ?? []
    return Array.isArray(list) ? list.map(mapApiKey) : []
  } catch {
    return []
  }
}

export async function createApiKey(payload: CreateApiKeyPayload): Promise<CreateApiKeyResponse | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<CreateApiKeyResponse & { key?: string }>('settings-apikeys-create', { body: payload })
      if (error) throw error
      const key = data?.key
      return data ? { id: data.id ?? '', name: data.name ?? payload.name, key: typeof key === 'string' ? key : '', scopes: Array.isArray(data.scopes) ? data.scopes : payload.scopes ?? [], createdAt: data.createdAt ?? new Date().toISOString() } : null
    }
    const data = await api.post<CreateApiKeyResponse>('/api/settings/apikeys', payload)
    return data ?? null
  } catch {
    return null
  }
}

export async function regenerateApiKey(id: string): Promise<CreateApiKeyResponse | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<CreateApiKeyResponse & { key?: string }>('settings-apikeys-regenerate', { body: { id } })
      if (error) throw error
      return data ?? null
    }
    const data = await api.post<CreateApiKeyResponse>(`/api/settings/apikeys/${encodeURIComponent(id)}/regenerate`, {})
    return data ?? null
  } catch {
    return null
  }
}

export async function revokeApiKey(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-apikeys-revoke', { body: { id } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.delete<{ success?: boolean; error?: string }>(`/api/settings/apikeys/${encodeURIComponent(id)}`)
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to revoke key' }
  }
}

export async function fetchSessions(): Promise<Session[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ sessions?: Record<string, unknown>[] }>('settings-sessions', { body: {} })
      if (error) throw error
      const list = data?.sessions ?? []
      return Array.isArray(list) ? list.map(mapSession) : []
    }
    const data = await api.get<{ sessions?: Record<string, unknown>[] }>('/api/settings/sessions')
    const list = data?.sessions ?? []
    return Array.isArray(list) ? list.map(mapSession) : []
  } catch {
    return []
  }
}

export async function revokeSession(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-sessions-revoke', { body: { id } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.post<{ success?: boolean; error?: string }>(`/api/settings/sessions/${encodeURIComponent(id)}/revoke`, {})
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to revoke session' }
  }
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; error?: string }>('settings-password-change', { body: { currentPassword, newPassword } })
      if (error) return { success: false, error: error.message }
      return { success: data?.success ?? false, error: data?.error }
    }
    const data = await api.post<{ success?: boolean; error?: string }>('/api/settings/password-change', { currentPassword, newPassword })
    return { success: data?.success ?? false, error: data?.error }
  } catch (e) {
    const err = e as { message?: string }
    return { success: false, error: err?.message ?? 'Failed to change password' }
  }
}
