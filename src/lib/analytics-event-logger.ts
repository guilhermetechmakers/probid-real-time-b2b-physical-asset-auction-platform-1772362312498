/**
 * AnalyticsEventLoggerBridge - Centralized event logging for listing lifecycle,
 * bids, outcomes, and ops decisions. Integrates with Data & Analytics backend.
 * All methods guard against null/undefined inputs per runtime safety rules.
 */
import { supabase } from '@/lib/supabase'
import type { AnalyticsEventInput, AnalyticsEventType } from '@/types/analytics'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const useSupabaseFunctions = !API_BASE

interface NormalizedEvent {
  type: AnalyticsEventType
  payload: Record<string, unknown>
  timestamp: string
  userId?: string
  auctionId?: string
  listingId?: string
  category?: string
}

function normalizeEvent(input: AnalyticsEventInput | null | undefined): NormalizedEvent | null {
  if (!input || typeof input.type !== 'string') return null
  return {
    type: input.type,
    payload: input.payload != null && typeof input.payload === 'object' ? (input.payload as Record<string, unknown>) : {},
    timestamp: typeof input.timestamp === 'string' ? input.timestamp : new Date().toISOString(),
    userId: typeof input.userId === 'string' ? input.userId : undefined,
    auctionId: typeof input.auctionId === 'string' ? input.auctionId : undefined,
    listingId: typeof input.listingId === 'string' ? input.listingId : undefined,
    category: typeof input.category === 'string' ? input.category : undefined,
  }
}

/**
 * Log a single analytics event.
 */
export async function logEvent(input: AnalyticsEventInput | null | undefined): Promise<{ success: boolean; id?: string }> {
  const event = normalizeEvent(input)
  if (!event) return { success: false }

  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; id?: string }>('analytics-log', {
        body: event,
      })
      if (error) return { success: false }
      return { success: data?.success ?? false, id: data?.id }
    }
    const res = await import('@/lib/api').then((m) =>
      m.api.post<{ success?: boolean; id?: string }>('/api/analytics/log', event)
    )
    return { success: res?.success ?? false, id: res?.id }
  } catch {
    return { success: false }
  }
}

const eventQueue: NormalizedEvent[] = []

/**
 * Queue an event for bulk logging. Call flush() to send.
 */
export function queueEvent(input: AnalyticsEventInput | null | undefined): void {
  const event = normalizeEvent(input)
  if (event) eventQueue.push(event)
}

/**
 * Bulk log multiple events.
 */
export async function bulkLog(events: (AnalyticsEventInput | null | undefined)[]): Promise<{ success: boolean; count?: number }> {
  const normalized = (events ?? [])
    .map(normalizeEvent)
    .filter((e): e is NormalizedEvent => e != null)
  if (normalized.length === 0) return { success: false, count: 0 }

  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ success?: boolean; count?: number }>('analytics-log', {
        body: { bulk: true, events: normalized },
      })
      if (error) return { success: false }
      return { success: data?.success ?? false, count: data?.count ?? normalized.length }
    }
    const res = await import('@/lib/api').then((m) =>
      m.api.post<{ success?: boolean; count?: number }>('/api/analytics/log', { bulk: true, events: normalized })
    )
    return { success: res?.success ?? false, count: res?.count ?? normalized.length }
  } catch {
    return { success: false, count: 0 }
  }
}

/**
 * Flush queued events to the backend.
 */
export async function flush(): Promise<{ success: boolean; count?: number }> {
  if (eventQueue.length === 0) return { success: true, count: 0 }
  const toSend = eventQueue.splice(0, eventQueue.length)
  return bulkLog(toSend)
}

/**
 * AnalyticsEventLoggerBridge - singleton-style API for convenience.
 */
export const analyticsEventLogger = {
  logEvent,
  queueEvent,
  bulkLog,
  flush,
}
