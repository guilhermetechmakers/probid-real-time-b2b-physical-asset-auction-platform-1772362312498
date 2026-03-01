/**
 * Listing Detail API - fetch listing, bids, media, AI QA, watchlist.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { supabase } from '@/lib/supabase'
import type {
  ListingDetail,
  ListingMedia,
  AuctionSchedule,
  ListingBid,
  AIQAResult,
  BidStatus,
} from '@/types/listing-detail'
const MIN_BID_INCREMENT = 100

function toStrArray(v: unknown): string[] {
  if (v == null) return []
  if (!Array.isArray(v)) return []
  return v.map((s) => String(s))
}

async function getOrCreateBuyerId(): Promise<string | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id ?? null
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

function parseQAResult(raw: unknown): AIQAResult | null {
  if (raw == null || typeof raw !== 'object') return null
  const obj = raw as Record<string, unknown>
  const hardFails = toStrArray(obj.hardFails ?? obj.hard_fails)
  const warnings = toStrArray(obj.warnings)
  const tags = toStrArray(obj.tags)
  const evidenceImages = toStrArray(obj.evidenceImages ?? obj.evidence_images)
  const confidence = typeof obj.confidence === 'number' ? obj.confidence : 0
  return {
    hardFail: obj.hardFail === true || obj.hard_fail === true || hardFails.length > 0,
    hardFails,
    warnings,
    tags,
    confidence,
    evidenceImages,
    pass: obj.pass === true,
    structuredJson: obj.structured_json as Record<string, unknown> ?? obj,
  }
}

export async function fetchListingDetail(id: string): Promise<ListingDetail | null> {
  if (!id?.trim()) return null

  const { data: listingRow, error } = await supabase
    .from('listings')
    .select(
      `
      id,
      title,
      description,
      identifier,
      category,
      status,
      specs,
      enrichment,
      qa_results,
      reserve_price,
      starting_price,
      current_bid,
      image_urls,
      created_at,
      updated_at,
      location
    `
    )
    .eq('id', id)
    .in('status', ['approved', 'scheduled', 'live', 'sold', 'unsold'])
    .single()

  if (error || !listingRow) return null

  const imageUrls = Array.isArray(listingRow.image_urls)
    ? (listingRow.image_urls as string[])
    : []

  const { data: photosRows } = await supabase
    .from('listing_photos')
    .select('id, url, "order", angle')
    .eq('listing_id', id)
    .order('order', { ascending: true })

  const photos = Array.isArray(photosRows) ? photosRows : []
  const media: ListingMedia[] =
    photos.length > 0
      ? photos.map((p: Record<string, unknown>, i: number) => ({
          id: String(p.id ?? `photo-${i}`),
          url: String(p.url ?? ''),
          type: 'image' as const,
          angleTag: p.angle != null ? String(p.angle) : undefined,
          position: Number(p.order ?? i),
        }))
      : imageUrls.map((url, i) => ({
          id: `img-${i}`,
          url,
          type: 'image' as const,
          position: i,
        }))

  const { data: auctionRows } = await supabase
    .from('auctions')
    .select('id, listing_id, start_time, end_time, reserve_price, current_bid, status')
    .eq('listing_id', id)
    .order('start_time', { ascending: false })
    .limit(1)

  const auctionRow = Array.isArray(auctionRows) ? auctionRows[0] : null
  let auction: AuctionSchedule | null = null

  if (auctionRow) {
    const endTime = auctionRow.end_time != null ? String(auctionRow.end_time) : ''
    const endMs = endTime ? new Date(endTime).getTime() : 0
    const now = Date.now()
    const remainingTimeSeconds = endMs > now ? Math.max(0, Math.floor((endMs - now) / 1000)) : 0

    const { count: bidCount } = await supabase
      .from('bids')
      .select('id', { count: 'exact', head: true })
      .eq('auction_id', auctionRow.id)

    auction = {
      id: String(auctionRow.id),
      listingId: String(auctionRow.listing_id ?? id),
      startTime: String(auctionRow.start_time ?? ''),
      endTime,
      status: String(auctionRow.status ?? 'scheduled') as AuctionSchedule['status'],
      reserve: auctionRow.reserve_price != null ? Number(auctionRow.reserve_price) : undefined,
      currentHighestBid:
        auctionRow.current_bid != null
          ? Number(auctionRow.current_bid)
          : listingRow.current_bid != null
            ? Number(listingRow.current_bid)
            : undefined,
      bidCount: typeof bidCount === 'number' ? bidCount : 0,
      remainingTimeSeconds,
    }
  }

  const qaRaw = listingRow.qa_results ?? null
  const aiQa = qaRaw ? parseQAResult(qaRaw) : null

  const enrichment = listingRow.enrichment as Record<string, unknown> | null | undefined
  const provenance =
    enrichment?.provenance != null
      ? String(enrichment.provenance)
      : (listingRow as Record<string, unknown>).provenance != null
        ? String((listingRow as Record<string, unknown>).provenance)
        : undefined

  return {
    id: String(listingRow.id),
    title: String(listingRow.title ?? ''),
    description: listingRow.description != null ? String(listingRow.description) : undefined,
    identifier: listingRow.identifier != null ? String(listingRow.identifier) : undefined,
    category: listingRow.category != null ? String(listingRow.category) : undefined,
    status: String(listingRow.status ?? ''),
    specs: (listingRow.specs as Record<string, unknown>) ?? undefined,
    provenance,
    location: listingRow.location != null ? String(listingRow.location) : undefined,
    reservePrice: listingRow.reserve_price != null ? Number(listingRow.reserve_price) : undefined,
    startingPrice: listingRow.starting_price != null ? Number(listingRow.starting_price) : undefined,
    currentBid:
      listingRow.current_bid != null
        ? Number(listingRow.current_bid)
        : auction?.currentHighestBid,
    media,
    imageUrls: imageUrls.length > 0 ? imageUrls : media.map((m) => m.url),
    aiQa,
    auction,
    createdAt: String(listingRow.created_at ?? ''),
    updatedAt: String(listingRow.updated_at ?? ''),
  }
}

export async function fetchBidHistory(listingId: string): Promise<ListingBid[]> {
  if (!listingId?.trim()) return []

  const { data: auctionRows } = await supabase
    .from('auctions')
    .select('id')
    .eq('listing_id', listingId)
    .limit(1)
    .maybeSingle()

  const auctionId = auctionRows?.id
  if (!auctionId) return []

  const { data: bidRows } = await supabase
    .from('bids')
    .select('id, bidder_id, amount, placed_at')
    .eq('auction_id', auctionId)
    .order('placed_at', { ascending: false })
    .limit(50)

  const rows = Array.isArray(bidRows) ? bidRows : []
  const hashId = (s: string) => {
    const h = [...s].reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
    return `B${Math.abs(h).toString(36).slice(0, 6)}`
  }
  return rows.map((row: Record<string, unknown>, i: number) => {
    const bidderId = row.bidder_id != null ? String(row.bidder_id) : `row-${i}`
    const anonymizedBuyerId = hashId(bidderId)
    return {
      id: String(row.id ?? `bid-${i}`),
      amount: Number(row.amount ?? 0),
      createdAt: String(row.placed_at ?? ''),
      status: 'accepted' as BidStatus,
      anonymizedBuyerId,
    }
  })
}

export async function placeBid(
  listingId: string,
  amount: number,
  _isProxy?: boolean,
  _proxyMax?: number
): Promise<{ success: boolean; bidId?: string; error?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id ?? null
  if (!userId) return { success: false, error: 'Not authenticated' }

  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) return { success: false, error: 'Buyer profile required' }

  const { data: auctionRow } = await supabase
    .from('auctions')
    .select('id, current_bid, reserve_price, status')
    .eq('listing_id', listingId)
    .single()

  if (!auctionRow) return { success: false, error: 'Auction not found' }
  if (auctionRow.status !== 'live' && auctionRow.status !== 'scheduled') {
    return { success: false, error: 'Auction is not accepting bids' }
  }

  const currentBid = auctionRow.current_bid != null ? Number(auctionRow.current_bid) : 0
  const minBid = currentBid + MIN_BID_INCREMENT
  if (amount < minBid) {
    return { success: false, error: `Minimum bid is $${minBid}` }
  }

  const { data: bid, error } = await supabase
    .from('bids')
    .insert({
      auction_id: auctionRow.id,
      bidder_id: userId,
      amount,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message ?? 'Failed to place bid' }

  return { success: true, bidId: bid?.id != null ? String(bid.id) : undefined }
}

export async function getWatchStatus(listingId: string): Promise<boolean> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) return false

  const { data } = await supabase
    .from('watchlists')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('listing_id', listingId)
    .maybeSingle()

  return data?.id != null
}

export interface WatchlistPrefs {
  outbid?: boolean
  auctionStarting?: boolean
  inspectionScheduled?: boolean
}

export async function getWatchlistPrefs(
  listingId: string
): Promise<{ alertEnabled: boolean; prefs: WatchlistPrefs } | null> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) return null

  const { data } = await supabase
    .from('watchlists')
    .select('alert_enabled, alert_preferences')
    .eq('buyer_id', buyerId)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (!data) return null
  const prefs = (data.alert_preferences as WatchlistPrefs) ?? {}
  return {
    alertEnabled: Boolean(data.alert_enabled),
    prefs: {
      outbid: prefs.outbid ?? true,
      auctionStarting: prefs.auctionStarting ?? true,
      inspectionScheduled: prefs.inspectionScheduled ?? false,
    },
  }
}

export async function updateWatchlistPrefs(
  listingId: string,
  prefs: Partial<WatchlistPrefs>,
  alertEnabled?: boolean
): Promise<void> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('watchlists')
    .select('id, alert_preferences')
    .eq('buyer_id', buyerId)
    .eq('listing_id', listingId)
    .maybeSingle()

  const currentPrefs = (existing?.alert_preferences as WatchlistPrefs) ?? {}
  const newPrefs = { ...currentPrefs, ...prefs }

  if (!existing?.id) {
    throw new Error('Add to watchlist first to update preferences')
  }

  await supabase
    .from('watchlists')
    .update({
      ...(alertEnabled !== undefined && { alert_enabled: alertEnabled }),
      alert_preferences: newPrefs,
    })
    .eq('id', existing.id)
}

export async function toggleWatchlist(listingId: string): Promise<{ watching: boolean }> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) throw new Error('Not authenticated')

  const { data: existing } = await supabase
    .from('watchlists')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('listing_id', listingId)
    .maybeSingle()

  if (existing?.id) {
    await supabase.from('watchlists').delete().eq('id', existing.id)
    return { watching: false }
  }

  await supabase.from('watchlists').upsert(
    { buyer_id: buyerId, listing_id: listingId, alert_enabled: false },
    { onConflict: 'buyer_id,listing_id' }
  )
  return { watching: true }
}

export function getMinBidIncrement(currentBid = 0): number {
  return Math.max(MIN_BID_INCREMENT, Math.floor(currentBid * 0.05))
}

export async function setupProxyBid(
  listingId: string,
  maxAmount: number
): Promise<{ success: boolean; error?: string }> {
  return placeBid(listingId, maxAmount, true, maxAmount)
}
