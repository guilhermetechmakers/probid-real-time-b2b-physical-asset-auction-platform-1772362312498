/**
 * Buyer Dashboard API - uses Supabase client for data operations.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { supabase } from '@/lib/supabase'
import type {
  BuyerAuction,
  WatchlistItem,
  BidHistoryItem,
  Subscription,
  SavedFilter,
  KycVerificationStatus,
} from '@/types'

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user?.id ?? null
}

async function getOrCreateBuyerId(): Promise<string | null> {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const { data: existing } = await supabase
    .from('buyers')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existing?.id) return String(existing.id)

  const { data: inserted, error } = await supabase
    .from('buyers')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (error) return null
  return inserted?.id != null ? String(inserted.id) : null
}

export interface BuyerDashboardData {
  auctions: BuyerAuction[]
  watchlist: WatchlistItem[]
  biddingHistory: BidHistoryItem[]
  subscription: Subscription | null
  savedFilters: SavedFilter[]
  verificationStatus: KycVerificationStatus
}

function mapAuction(row: Record<string, unknown>): BuyerAuction {
  const listing = row.listings as Record<string, unknown> | null
  const imageUrls = listing != null && Array.isArray(listing.image_urls) ? (listing.image_urls as string[]) : []
  return {
    id: String(row.id ?? ''),
    listingId: String(row.listing_id ?? ''),
    scheduledAt: String(row.start_time ?? row.scheduled_at ?? ''),
    status: String(row.status ?? 'scheduled') as BuyerAuction['status'],
    currentBid: row.current_bid != null ? Number(row.current_bid) : undefined,
    reservePrice: row.reserve_price != null ? Number(row.reserve_price) : undefined,
    batchId: row.batch_id != null ? String(row.batch_id) : undefined,
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    listing: listing
      ? {
          id: String(listing.id ?? ''),
          title: String(listing.title ?? ''),
          category: listing.category != null ? String(listing.category) : undefined,
          location: listing.location != null ? String(listing.location) : undefined,
          condition: listing.condition != null ? String(listing.condition) : undefined,
          imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
        }
      : undefined,
  }
}

export async function fetchBuyerDashboard(): Promise<BuyerDashboardData> {
  const buyerId = await getOrCreateBuyerId()
  const userId = await getCurrentUserId()

  const defaultData: BuyerDashboardData = {
    auctions: [],
    watchlist: [],
    biddingHistory: [],
    subscription: null,
    savedFilters: [],
    verificationStatus: {
      status: 'pending',
      adminApproved: false,
    },
  }

  if (!userId) return defaultData

  const [auctionsRes, watchlistRes, bidsRes, subsRes, filtersRes, buyerRes] = await Promise.all([
    supabase
      .from('auctions')
      .select(
        `
        id,
        listing_id,
        start_time,
        end_time,
        reserve_price,
        current_bid,
        status,
        listings (id, title, image_urls)
      `
      )
      .in('status', ['scheduled', 'live'])
      .order('start_time', { ascending: true })
      .limit(20),
    buyerId
      ? supabase
          .from('watchlists')
          .select(
            `
          id,
          buyer_id,
          listing_id,
          alert_enabled,
          alert_preferences,
          created_at,
          listings (id, title, image_urls, current_bid, status)
        `
          )
          .eq('buyer_id', buyerId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    supabase
      .from('bids')
      .select(
        `
        id,
        auction_id,
        amount,
        placed_at,
        auctions (listing_id, listings (title))
      `
      )
      .eq('bidder_id', userId)
      .order('placed_at', { ascending: false })
      .limit(20),
    buyerId
      ? supabase
          .from('subscriptions')
          .select('*')
          .eq('buyer_id', buyerId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
    buyerId
      ? supabase
          .from('saved_filters')
          .select('*')
          .eq('buyer_id', buyerId)
          .order('created_at', { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    buyerId
      ? supabase.from('buyers').select('kyc_status, verification_status, admin_approved').eq('id', buyerId).single()
      : Promise.resolve({ data: null, error: null }),
  ])

  const auctions: BuyerAuction[] = Array.isArray(auctionsRes.data)
    ? auctionsRes.data.map((r: Record<string, unknown>) => mapAuction(r))
    : []

  const watchlist: WatchlistItem[] = []
  if (Array.isArray(watchlistRes.data)) {
    for (const row of watchlistRes.data) {
      const listing = (row.listings as unknown) as Record<string, unknown> | null | undefined
      const listingObj = listing != null && !Array.isArray(listing) ? listing : null
      watchlist.push({
        id: String(row.id ?? ''),
        buyerId: String(row.buyer_id ?? ''),
        listingId: String(row.listing_id ?? ''),
        alertEnabled: Boolean(row.alert_enabled ?? false),
        alertPreferences: (row.alert_preferences as Record<string, unknown>) ?? undefined,
        createdAt: row.created_at != null ? String(row.created_at) : undefined,
        listing: listingObj
          ? {
              id: String(listingObj.id ?? ''),
              title: String(listingObj.title ?? ''),
              category: listingObj.category != null ? String(listingObj.category) : undefined,
              imageUrls: Array.isArray(listingObj.image_urls) ? (listingObj.image_urls as string[]) : [],
              currentBid: listingObj.current_bid != null ? Number(listingObj.current_bid) : undefined,
              status: listingObj.status != null ? String(listingObj.status) : undefined,
            }
          : undefined,
      })
    }
  }

  const biddingHistory: BidHistoryItem[] = []
  if (Array.isArray(bidsRes.data)) {
    for (const row of bidsRes.data) {
      const auction = (row.auctions as unknown) as Record<string, unknown> | null | undefined
      const auctionObj = auction != null && !Array.isArray(auction) ? auction : null
      const listings = auctionObj?.listings != null && !Array.isArray(auctionObj.listings)
        ? (auctionObj.listings as { title?: string })
        : null
      const listingId = auctionObj?.listing_id != null ? String(auctionObj.listing_id) : undefined
      biddingHistory.push({
        id: String(row.id ?? ''),
        auctionId: String(row.auction_id ?? ''),
        amount: Number(row.amount ?? 0),
        createdAt: String((row as Record<string, unknown>).placed_at ?? (row as Record<string, unknown>).created_at ?? ''),
        status: 'pending',
        listingTitle: listings?.title != null ? String(listings.title) : undefined,
        listingId,
      })
    }
  }

  let subscription: Subscription | null = null
  const subData = subsRes.data as Record<string, unknown> | null
  if (subData?.id != null && buyerId != null) {
    subscription = {
      id: String(subData.id),
      buyerId,
      planId: String(subData.plan_id ?? ''),
      planName: subData.plan_id != null ? String(subData.plan_id).replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : undefined,
      status: String(subData.status ?? 'active') as Subscription['status'],
      currentPeriodStart: subData.current_period_start != null ? String(subData.current_period_start) : undefined,
      currentPeriodEnd: subData.current_period_end != null ? String(subData.current_period_end) : undefined,
      nextBillingDate: subData.next_billing_date != null ? String(subData.next_billing_date) : undefined,
    }
  }

  const savedFilters: SavedFilter[] = Array.isArray(filtersRes.data)
    ? filtersRes.data.map((r: Record<string, unknown>) => ({
        id: String(r.id ?? ''),
        buyerId: r.buyer_id != null ? String(r.buyer_id) : undefined,
        name: String(r.name ?? ''),
        filters: (r.filters_json as SavedFilter['filters']) ?? {},
        createdAt: String(r.created_at ?? ''),
        updatedAt: r.updated_at != null ? String(r.updated_at) : undefined,
      }))
    : []

  const verificationStatus: KycVerificationStatus = {
    status: (buyerRes.data?.kyc_status as KycVerificationStatus['status']) ?? 'pending',
    kycStatus: (buyerRes.data?.kyc_status as 'pending' | 'approved' | 'rejected') ?? 'pending',
    verificationStatus: (buyerRes.data?.verification_status as 'pending' | 'submitted' | 'approved' | 'rejected') ?? 'pending',
    adminApproved: Boolean(buyerRes.data?.admin_approved ?? false),
  }

  return {
    auctions,
    watchlist,
    biddingHistory,
    subscription,
    savedFilters,
    verificationStatus,
  }
}

export async function toggleWatchlistAlert(watchlistId: string, alertEnabled: boolean): Promise<void> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('watchlists')
    .update({ alert_enabled: alertEnabled })
    .eq('id', watchlistId)
    .eq('buyer_id', buyerId)

  if (error) throw new Error(error.message ?? 'Failed to update watchlist')
}

export async function addToWatchlist(listingId: string): Promise<void> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const { error } = await supabase.from('watchlists').upsert(
    { buyer_id: buyerId, listing_id: listingId, alert_enabled: false },
    { onConflict: 'buyer_id,listing_id' }
  )

  if (error) throw new Error(error.message ?? 'Failed to add to watchlist')
}

export async function removeFromWatchlist(listingId: string): Promise<void> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const { error } = await supabase.from('watchlists').delete().eq('buyer_id', buyerId).eq('listing_id', listingId)

  if (error) throw new Error(error.message ?? 'Failed to remove from watchlist')
}

export async function createSavedFilter(name: string, filters: SavedFilter['filters']): Promise<SavedFilter> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('saved_filters')
    .insert({ buyer_id: buyerId, name, filters_json: filters ?? {} })
    .select('id, name, filters_json, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message ?? 'Failed to save filter')
  return {
    id: String(data?.id ?? ''),
    buyerId,
    name: String(data?.name ?? ''),
    filters: (data?.filters_json as SavedFilter['filters']) ?? {},
    createdAt: String(data?.created_at ?? ''),
    updatedAt: data?.updated_at != null ? String(data.updated_at) : undefined,
  }
}

export async function updateSavedFilter(id: string, payload: { name?: string; filters?: SavedFilter['filters'] }): Promise<void> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (payload.name != null) updatePayload.name = payload.name
  if (payload.filters != null) updatePayload.filters_json = payload.filters

  const { error } = await supabase.from('saved_filters').update(updatePayload).eq('id', id).eq('buyer_id', buyerId)

  if (error) throw new Error(error.message ?? 'Failed to update filter')
}

export async function deleteSavedFilter(id: string): Promise<void> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const { error } = await supabase.from('saved_filters').delete().eq('id', id).eq('buyer_id', buyerId)

  if (error) throw new Error(error.message ?? 'Failed to delete filter')
}
