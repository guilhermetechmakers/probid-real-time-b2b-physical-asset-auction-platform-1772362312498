/**
 * Analytics types for ProBid Analytics / Reports dashboard.
 * All types support null-safe usage per runtime safety rules.
 */

export type AnalyticsEventType =
  | 'listing_created'
  | 'bid_placed'
  | 'auction_outcome'
  | 'ops_decision'
  | 'listing_approved'
  | 'listing_rejected'
  | 'buyer_approved'
  | 'buyer_denied'

export interface AnalyticsEventPayload {
  [key: string]: unknown
}

export interface AnalyticsEventInput {
  type: AnalyticsEventType
  payload?: AnalyticsEventPayload
  timestamp?: string
  userId?: string
  auctionId?: string
  listingId?: string
  category?: string
}

export interface AnalyticsEvent {
  id: string
  type: AnalyticsEventType
  payload: AnalyticsEventPayload
  timestamp: string
  userId?: string
  auctionId?: string
  listingId?: string
  category?: string
}

export interface AnalyticsMetrics {
  conversion: number
  demand: number
  auctionHealth: number
  estimateAccuracy: number
  revenue: number
  totalListings?: number
  completedSales?: number
  activeBuyers?: number
  totalBids?: number
}

export interface TimeSeriesDataPoint {
  date: string
  revenue?: number
  bids?: number
  buyers?: number
}

export interface BreakdownItem {
  key: string
  value: number
}

export interface AnalyticsMetricsResponse {
  metrics: AnalyticsMetrics
  series: TimeSeriesDataPoint[]
  breakdown?: BreakdownItem[]
}

export interface DistributionBarItem {
  category: string
  value: number
}

export interface ExportParams {
  format: 'csv' | 'xlsx'
  startDate: string
  endDate: string
  filters?: Record<string, string | string[]>
}

export interface ExportScheduleParams {
  email: string
  frequency: 'daily' | 'weekly' | 'monthly'
  params?: Record<string, unknown>
}

export interface ExportResponse {
  url: string
  fileName: string
}

export interface ExportScheduleResponse {
  success: boolean
  scheduleId?: string
}
