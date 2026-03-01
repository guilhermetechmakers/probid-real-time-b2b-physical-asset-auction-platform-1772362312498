/**
 * Seller Dashboard API - uses Supabase client for data operations.
 * All responses are validated for shape; array data guarded per runtime safety rules.
 */
import { supabase } from '@/lib/supabase'
import type {
  Listing,
  ListingPhoto,
  Inspection,
  Sale,
  Notification,
  EnrichmentResult,
} from '@/types'

export interface SellerListingsResponse {
  data: Listing[]
  count: number
}

export interface SellerAuctionsResponse {
  data: Array<{
    id: string
    listingId: string
    startTime: string
    endTime: string
    reservePrice?: number
    currentBid?: number
    status: string
    listing?: Listing
  }>
  count: number
}

export interface SellerInspectionsResponse {
  data: Inspection[]
  count: number
}

export interface SellerSalesResponse {
  data: Sale[]
  totalSales: number
  avgSalePrice: number
  sellThroughRate: number
}

export interface SellerNotificationsResponse {
  data: Notification[]
  count: number
}

export interface SellerMetrics {
  listingCount: number
  draftCount: number
  liveAuctionCount: number
  totalSold: number
  sellThroughRate: number
  avgSalePrice: number
}

async function getCurrentUserId(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

export async function fetchSellerListings(
  status?: string
): Promise<SellerListingsResponse> {
  const userId = await getCurrentUserId()
  if (!userId) return { data: [], count: 0 }

  let query = supabase
    .from('listings')
    .select('*', { count: 'exact' })
    .eq('seller_id', userId)
    .order('updated_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error, count } = await query

  if (error) throw new Error(error.message ?? 'Failed to fetch listings')
  const list = Array.isArray(data) ? data : []
  const items = list.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    sellerId: String(row.seller_id ?? ''),
    identifier: String(row.identifier ?? ''),
    title: String(row.title ?? ''),
    description: row.description != null ? String(row.description) : undefined,
    status: String(row.status ?? 'draft') as Listing['status'],
    reservePrice: row.reserve_price != null ? Number(row.reserve_price) : undefined,
    startingPrice: row.starting_price != null ? Number(row.starting_price) : undefined,
    currentBid: row.current_bid != null ? Number(row.current_bid) : undefined,
    imageUrls: Array.isArray(row.image_urls) ? (row.image_urls as string[]) : [],
    specs: (row.specs as Record<string, unknown>) ?? undefined,
    qaResults: (row.qa_results as Listing['qaResults']) ?? undefined,
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }))
  return { data: items, count: count ?? 0 }
}

export async function createListing(payload: {
  identifier?: string
  title: string
  description?: string
  status?: string
}): Promise<{ id: string; status: string }> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('listings')
    .insert({
      seller_id: userId,
      identifier: payload.identifier ?? '',
      title: payload.title,
      description: payload.description ?? null,
      status: payload.status ?? 'draft',
    })
    .select('id, status')
    .single()

  if (error) throw new Error(error.message ?? 'Failed to create listing')
  return { id: String(data?.id ?? ''), status: String(data?.status ?? 'draft') }
}

export async function updateListing(
  id: string,
  payload: Partial<{ title: string; description: string; status: string; reservePrice: number; startingPrice: number }>
): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.title != null) updatePayload.title = payload.title
  if (payload.description != null) updatePayload.description = payload.description
  if (payload.status != null) updatePayload.status = payload.status
  if (payload.reservePrice != null) updatePayload.reserve_price = payload.reservePrice
  if (payload.startingPrice != null) updatePayload.starting_price = payload.startingPrice

  const { error } = await supabase
    .from('listings')
    .update(updatePayload)
    .eq('id', id)
    .eq('seller_id', userId)

  if (error) throw new Error(error.message ?? 'Failed to update listing')
}

export async function uploadListingPhotos(
  listingId: string,
  photos: Array<{ url: string; order: number; width?: number; height?: number }>
): Promise<void> {
  const userId = await getCurrentUserId()
  if (!userId) throw new Error('Not authenticated')

  const { data: listing } = await supabase
    .from('listings')
    .select('seller_id')
    .eq('id', listingId)
    .single()

  if (!listing || listing.seller_id !== userId) throw new Error('Unauthorized')

  const rows = photos.map((p) => ({
    listing_id: listingId,
    url: p.url,
    order: p.order,
    width: p.width ?? null,
    height: p.height ?? null,
  }))

  const { error } = await supabase.from('listing_photos').insert(rows)
  if (error) throw new Error(error.message ?? 'Failed to upload photos')
}

export async function fetchListingPhotos(listingId: string): Promise<ListingPhoto[]> {
  const { data, error } = await supabase
    .from('listing_photos')
    .select('*')
    .eq('listing_id', listingId)
    .order('order', { ascending: true })

  if (error) throw new Error(error.message ?? 'Failed to fetch photos')
  const list = Array.isArray(data) ? data : []
  return list.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    listingId: String(row.listing_id ?? ''),
    url: String(row.url ?? ''),
    order: Number(row.order ?? 0),
    width: row.width != null ? Number(row.width) : undefined,
    height: row.height != null ? Number(row.height) : undefined,
    storedAt: row.stored_at != null ? String(row.stored_at) : undefined,
  }))
}

export async function fetchSellerAuctions(listingId?: string): Promise<SellerAuctionsResponse['data']> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data: listingRows } = await supabase
    .from('listings')
    .select('id')
    .eq('seller_id', userId)
  const listingIds = (listingRows ?? []).map((l: { id: string }) => l.id)
  if (listingIds.length === 0 && !listingId) return []

  let query = supabase
    .from('auctions')
    .select(`
      id,
      listing_id,
      start_time,
      end_time,
      reserve_price,
      current_bid,
      status,
      listings (*)
    `)
    .in('status', ['scheduled', 'live'])
    .order('start_time', { ascending: true })

  if (listingId) {
    query = query.eq('listing_id', listingId)
  } else {
    query = query.in('listing_id', listingIds)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message ?? 'Failed to fetch auctions')
  const list = Array.isArray(data) ? data : []
  return list.map((row: Record<string, unknown>) => {
    const listing = row.listings as Record<string, unknown> | null
    return {
      id: String(row.id ?? ''),
      listingId: String(row.listing_id ?? ''),
      startTime: String(row.start_time ?? ''),
      endTime: String(row.end_time ?? ''),
      reservePrice: row.reserve_price != null ? Number(row.reserve_price) : undefined,
      currentBid: row.current_bid != null ? Number(row.current_bid) : undefined,
      status: String(row.status ?? 'scheduled'),
      listing: listing ? {
        id: String(listing.id ?? ''),
        sellerId: String(listing.seller_id ?? ''),
        identifier: String(listing.identifier ?? ''),
        title: String(listing.title ?? ''),
        status: String(listing.status ?? 'draft') as Listing['status'],
        imageUrls: Array.isArray(listing.image_urls) ? (listing.image_urls as string[]) : [],
        createdAt: String(listing.created_at ?? ''),
        updatedAt: String(listing.updated_at ?? ''),
      } : undefined,
    }
  })
}

export async function fetchSellerInspections(): Promise<Inspection[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data: listings } = await supabase
    .from('listings')
    .select('id')
    .eq('seller_id', userId)

  const listingIds = (listings ?? []).map((l: { id: string }) => l.id)
  if (listingIds.length === 0) return []

  const { data, error } = await supabase
    .from('inspections')
    .select('*')
    .in('listing_id', listingIds)
    .order('scheduled_at', { ascending: false })

  if (error) throw new Error(error.message ?? 'Failed to fetch inspections')
  const list = Array.isArray(data) ? data : []
  return list.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    listingId: String(row.listing_id ?? ''),
    scheduledAt: String(row.scheduled_at ?? ''),
    inspectorId: row.inspector_id != null ? String(row.inspector_id) : undefined,
    inspectorName: row.inspector_name != null ? String(row.inspector_name) : undefined,
    status: String(row.status ?? 'scheduled') as Inspection['status'],
    notes: row.notes != null ? String(row.notes) : undefined,
  }))
}

export async function fetchRecentSales(): Promise<SellerSalesResponse> {
  const userId = await getCurrentUserId()
  if (!userId) return { data: [], totalSales: 0, avgSalePrice: 0, sellThroughRate: 0 }

  const { data: listingRows } = await supabase
    .from('listings')
    .select('id')
    .eq('seller_id', userId)
  const listingIds = (listingRows ?? []).map((l: { id: string }) => l.id)
  if (listingIds.length === 0) return { data: [], totalSales: 0, avgSalePrice: 0, sellThroughRate: 0 }

  const { data: salesData, error } = await supabase
    .from('sales')
    .select(`
      id,
      listing_id,
      sale_price,
      sold_at,
      buyer_id,
      listings (title)
    `)
    .in('listing_id', listingIds)
    .order('sold_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message ?? 'Failed to fetch sales')

  const list = Array.isArray(salesData) ? salesData : []
  const sales = list.map((row: Record<string, unknown>) => {
    const listing = row.listings as { title?: string } | null
    return {
      id: String(row.id ?? ''),
      listingId: String(row.listing_id ?? ''),
      listingTitle: listing?.title != null ? String(listing.title) : undefined,
      salePrice: Number(row.sale_price ?? 0),
      soldAt: String(row.sold_at ?? ''),
      buyerId: row.buyer_id != null ? String(row.buyer_id) : undefined,
    }
  })

  const totalSales = sales.length
  const totalAmount = sales.reduce((sum, s) => sum + s.salePrice, 0)
  const avgSalePrice = totalSales > 0 ? totalAmount / totalSales : 0

  const { count: totalListings } = await supabase
    .from('listings')
    .select('*', { count: 'exact', head: true })
    .eq('seller_id', userId)

  const { count: soldCount } = await supabase
    .from('sales')
    .select('*', { count: 'exact', head: true })
    .in('listing_id', listingIds)

  const sellThroughRate = (totalListings ?? 0) > 0
    ? ((soldCount ?? 0) / (totalListings ?? 1)) * 100
    : 0

  return {
    data: sales,
    totalSales,
    avgSalePrice,
    sellThroughRate,
  }
}

export async function fetchNotifications(): Promise<Notification[]> {
  const userId = await getCurrentUserId()
  if (!userId) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message ?? 'Failed to fetch notifications')
  const list = Array.isArray(data) ? data : []
  return list.map((row: Record<string, unknown>) => ({
    id: String(row.id ?? ''),
    sellerId: String(row.seller_id ?? ''),
    type: String(row.type ?? ''),
    message: String(row.message ?? ''),
    read: Boolean(row.read ?? false),
    createdAt: String(row.created_at ?? ''),
    actionUrl: row.action_url != null ? String(row.action_url) : undefined,
  }))
}

export async function fetchEnrichmentResults(listingId: string): Promise<EnrichmentResult[]> {
  const { data, error } = await supabase
    .from('enrich_results')
    .select('*')
    .eq('listing_id', listingId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message ?? 'Failed to fetch enrichment')
  const list = Array.isArray(data) ? data : []
  return list.map((row: Record<string, unknown>) => ({
    provider: String(row.provider ?? ''),
    dataJson: (row.data_json as Record<string, unknown>) ?? {},
    confidence: Number(row.confidence ?? 0),
    hardFail: Boolean(row.hard_fail ?? false),
    warnings: Array.isArray(row.warnings) ? (row.warnings as string[]) : [],
  }))
}

export async function fetchSellerMetrics(): Promise<SellerMetrics> {
  const userId = await getCurrentUserId()
  if (!userId) {
    return {
      listingCount: 0,
      draftCount: 0,
      liveAuctionCount: 0,
      totalSold: 0,
      sellThroughRate: 0,
      avgSalePrice: 0,
    }
  }

  const { data: listings } = await supabase
    .from('listings')
    .select('id, status')
    .eq('seller_id', userId)

  const list = Array.isArray(listings) ? listings : []
  const listingCount = list.length
  const draftCount = list.filter((l: { status: string }) => l.status === 'draft').length

  const listingIds = list.map((l: { id: string }) => l.id)
  let liveCount = 0
  if (listingIds.length > 0) {
    const res = await supabase
      .from('auctions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'live')
      .in('listing_id', listingIds)
    liveCount = res.count ?? 0
  }

  const salesRes = await fetchRecentSales()
  return {
    listingCount,
    draftCount,
    liveAuctionCount: liveCount ?? 0,
    totalSold: salesRes.totalSales,
    sellThroughRate: salesRes.sellThroughRate,
    avgSalePrice: salesRes.avgSalePrice,
  }
}
