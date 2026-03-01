/**
 * Analytics API - Metrics, events, export, and scheduled reports.
 * Uses Supabase Edge Functions when VITE_API_URL is empty.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type {
  AnalyticsMetricsResponse,
  AnalyticsEvent,
  ExportParams,
  ExportScheduleParams,
  ExportResponse,
  ExportScheduleResponse,
} from '@/types/analytics'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const useSupabaseFunctions = !API_BASE

export interface AnalyticsFilters {
  startDate?: string
  endDate?: string
  category?: string
  buyerSegment?: string
  eventType?: string
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function defaultDateRange(): { startDate: string; endDate: string } {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - 30)
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) }
}

export async function fetchAnalyticsMetrics(filters?: AnalyticsFilters): Promise<AnalyticsMetricsResponse> {
  const { startDate, endDate } = defaultDateRange()
  const params = {
    startDate: filters?.startDate ?? startDate,
    endDate: filters?.endDate ?? endDate,
    category: filters?.category ?? undefined,
    buyerSegment: filters?.buyerSegment ?? undefined,
  }

  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<AnalyticsMetricsResponse>('analytics-metrics', {
        body: params,
      })
      if (error) throw error
      return normalizeMetricsResponse(data)
    }
    const queryObj = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v != null && v !== 'All')
    ) as Record<string, string>
    const qs = new URLSearchParams(queryObj).toString()
    const data = await api.get<AnalyticsMetricsResponse>(`/api/analytics/metrics?${qs}`)
    return normalizeMetricsResponse(data)
  } catch {
    return emptyMetricsResponse()
  }
}

function normalizeMetricsResponse(data: AnalyticsMetricsResponse | null | undefined): AnalyticsMetricsResponse {
  const metrics = data?.metrics
  const series = data?.series ?? []
  const breakdown = data?.breakdown ?? []

  return {
    metrics: {
      conversion: Number(metrics?.conversion ?? 0),
      demand: Number(metrics?.demand ?? 0),
      auctionHealth: Number(metrics?.auctionHealth ?? 0),
      estimateAccuracy: Number(metrics?.estimateAccuracy ?? 0),
      revenue: Number(metrics?.revenue ?? 0),
      totalListings: Number(metrics?.totalListings ?? 0),
      completedSales: Number(metrics?.completedSales ?? 0),
      activeBuyers: Number(metrics?.activeBuyers ?? 0),
      totalBids: Number(metrics?.totalBids ?? 0),
    },
    series: Array.isArray(series) ? series : [],
    breakdown: Array.isArray(breakdown) ? breakdown : [],
  }
}

function emptyMetricsResponse(): AnalyticsMetricsResponse {
  return {
    metrics: {
      conversion: 0,
      demand: 0,
      auctionHealth: 0,
      estimateAccuracy: 0,
      revenue: 0,
      totalListings: 0,
      completedSales: 0,
      activeBuyers: 0,
      totalBids: 0,
    },
    series: [],
    breakdown: [],
  }
}

export async function fetchAnalyticsEvents(filters?: {
  startDate?: string
  endDate?: string
  eventType?: string
}): Promise<AnalyticsEvent[]> {
  const { startDate, endDate } = defaultDateRange()
  const params = {
    startDate: filters?.startDate ?? startDate,
    endDate: filters?.endDate ?? endDate,
    eventType: filters?.eventType ?? undefined,
  }

  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ events?: Record<string, unknown>[] }>('analytics-events', {
        body: params,
      })
      if (error) throw error
      const list = data?.events ?? []
      return Array.isArray(list) ? list.map(mapEvent) : []
    }
    const qs = new URLSearchParams(params as Record<string, string>).toString()
    const data = await api.get<{ events?: Record<string, unknown>[] }>(`/api/analytics/events?${qs}`)
    const list = data?.events ?? []
    return Array.isArray(list) ? list.map(mapEvent) : []
  } catch {
    return []
  }
}

function mapEvent(row: Record<string, unknown>): AnalyticsEvent {
  return {
    id: String(row.id ?? ''),
    type: (row.type ?? 'listing_created') as AnalyticsEvent['type'],
    payload: row.payload != null && typeof row.payload === 'object' ? (row.payload as Record<string, unknown>) : {},
    timestamp: String(row.timestamp ?? row.created_at ?? ''),
    userId: typeof row.user_id === 'string' ? row.user_id : (row.userId as string | undefined),
    auctionId: typeof row.auction_id === 'string' ? row.auction_id : (row.auctionId as string | undefined),
    listingId: typeof row.listing_id === 'string' ? row.listing_id : (row.listingId as string | undefined),
    category: typeof row.category === 'string' ? row.category : undefined,
  }
}

export async function exportAnalytics(params: ExportParams): Promise<ExportResponse | null> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<ExportResponse>('analytics-export', {
        body: params,
      })
      if (error) throw error
      return data ?? null
    }
    const res = await api.post<ExportResponse>('/api/analytics/export', params)
    return res ?? null
  } catch {
    return null
  }
}

export async function scheduleExportReport(params: ExportScheduleParams): Promise<ExportScheduleResponse> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<ExportScheduleResponse>('analytics-export-schedule', {
        body: params,
      })
      if (error) throw error
      return { success: data?.success ?? false, scheduleId: data?.scheduleId }
    }
    const res = await api.post<ExportScheduleResponse>('/api/analytics/export/schedule', params)
    return { success: res?.success ?? false, scheduleId: res?.scheduleId }
  } catch {
    return { success: false }
  }
}
