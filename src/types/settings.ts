/**
 * Settings / Preferences types for ProBid.
 * All types support null-safe patterns per runtime safety rules.
 */

export interface UserProfile {
  id: string
  userId?: string
  email: string
  name?: string
  company?: string
  contactPhone?: string
  taxVat?: string
  payoutAccountId?: string
  payoutLast4?: string
  avatarUrl?: string
  createdAt?: string
  updatedAt?: string
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  outbid: boolean
  auctionStart: boolean
  inspectionScheduling: boolean
}

export type SubscriptionStatus =
  | 'active'
  | 'inactive'
  | 'cancelled'
  | 'past_due'
  | 'trialing'

export interface SubscriptionInfo {
  id: string
  planId: string
  planName?: string
  status: SubscriptionStatus
  currentPeriodStart?: string
  currentPeriodEnd?: string
  nextBillingDate?: string
  nextBillingAmount?: number
  currency?: string
}

export interface Invoice {
  id: string
  subscriptionId?: string
  amountDue: number
  currency: string
  status: string
  periodStart?: string
  periodEnd?: string
  invoicePdfUrl?: string
  invoiceUrl?: string
  createdAt?: string
}

export type KycStatus = 'pending' | 'in_review' | 'verified' | 'rejected'

export interface KycInfo {
  id?: string
  status: KycStatus
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  notes?: string
  requiredActions?: string[]
}

export interface Integration {
  id: string
  type: string
  name: string
  enabled: boolean
  config?: Record<string, unknown>
  createdAt?: string
  updatedAt?: string
}

export interface ApiKey {
  id: string
  name: string
  scopes: string[]
  createdAt: string
  lastUsedAt?: string
  status: 'active' | 'revoked'
  /** Only shown once at creation - never stored in list */
  keyPrefix?: string
}

export interface Session {
  id: string
  device?: string
  os?: string
  location?: string
  lastActive: string
  ipAddress?: string
  isActive: boolean
  isCurrent?: boolean
}

export interface SettingsProfilePayload {
  name?: string
  company?: string
  contactPhone?: string
  taxVat?: string
}

export interface SettingsNotificationsPayload {
  email?: boolean
  sms?: boolean
  push?: boolean
  outbid?: boolean
  auctionStart?: boolean
  inspectionScheduling?: boolean
}

export interface CreateApiKeyPayload {
  name: string
  scopes: string[]
}

export interface CreateApiKeyResponse {
  id: string
  name: string
  key: string
  scopes: string[]
  createdAt: string
}
