/**
 * Marketplace API - fetch listings, suggest, watch, join.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { supabase } from '@/lib/supabase'
import type {
  MarketplaceListing,
  ListingsResponse,
  ListingFilters,
  ListingSortOption,
  SuggestResult,
} from '@/types/marketplace'

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

function mapListing(row: Record<string, unknown>, auction?: Record<string, unknown> | null): MarketplaceListing {
  const imageUrls = Array.isArray(row.image_urls) ? (row.image_urls as string[]) : []
  const thumbnailUrl = imageUrls[0] ?? (row.thumbnail_url != null ? String(row.thumbnail_url) : undefined)
  const specs = row.specs as Record<string, unknown> | null | undefined
  const make = specs?.make != null ? String(specs.make) : undefined
  const model = specs?.model != null ? String(specs.model) : undefined
  const year = specs?.year != null ? Number(specs.year) : undefined
  const condition = specs?.condition != null ? String(specs.condition) : row.condition != null ? String(row.condition) : undefined

  let auctionStart: string | undefined
  let auctionEnd: string | undefined
  let remainingTime: number | undefined
  if (auction) {
    auctionStart = auction.start_time != null ? String(auction.start_time) : undefined
    auctionEnd = auction.end_time != null ? String(auction.end_time) : undefined
    if (auctionEnd) {
      const end = new Date(auctionEnd).getTime()
      const now = Date.now()
      remainingTime = Math.max(0, Math.floor((end - now) / 1000))
    }
  }

  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    identifier: row.identifier != null ? String(row.identifier) : undefined,
    category: row.category != null ? String(row.category) : undefined,
    condition,
    make,
    model,
    year,
    price: row.reserve_price != null ? Number(row.reserve_price) : row.starting_price != null ? Number(row.starting_price) : undefined,
    reservePrice: row.reserve_price != null ? Number(row.reserve_price) : undefined,
    startingPrice: row.starting_price != null ? Number(row.starting_price) : undefined,
    currentBid: row.current_bid != null ? Number(row.current_bid) : auction?.current_bid != null ? Number(auction.current_bid) : undefined,
    auctionStart,
    auctionEnd,
    thumbnailUrl,
    imageUrls: imageUrls.length > 0 ? imageUrls : [],
    location: row.location != null ? String(row.location) : undefined,
    geolocation: undefined,
    status: String(row.status ?? 'pending') as MarketplaceListing['status'],
    gated: row.gated === true,
    createdAt: String(row.created_at ?? ''),
    auction: auction
      ? {
          listingId: String(auction.listing_id ?? row.id ?? ''),
          currentBid: auction.current_bid != null ? Number(auction.current_bid) : undefined,
          bidCount: auction.bid_count != null ? Number(auction.bid_count) : undefined,
          remainingTime,
          status: String((auction as { status?: string }).status ?? 'scheduled') as 'active' | 'ended' | 'scheduled' | 'cancelled',
        }
      : undefined,
  }
}

export async function fetchListings(
  filters: ListingFilters = {},
  page = 1,
  limit = 24,
  sort: ListingSortOption = 'newest'
): Promise<ListingsResponse> {
  const offset = (page - 1) * limit

  let query = supabase
    .from('listings')
    .select(
      `
      id,
      identifier,
      title,
      description,
      status,
      category,
      location,
      reserve_price,
      starting_price,
      current_bid,
      image_urls,
      specs,
      created_at,
      updated_at,
      auctions (id, listing_id, start_time, end_time, current_bid, status)
    `,
      { count: 'exact' }
    )
    .in('status', ['approved', 'scheduled', 'live', 'sold', 'unsold'])

  if (filters.q?.trim()) {
    const q = filters.q.trim()
    query = query.or(`title.ilike.%${q}%,identifier.ilike.%${q}%,description.ilike.%${q}%`)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.condition) {
    query = query.contains('specs', { condition: filters.condition })
  }
  if (filters.priceMin != null) {
    query = query.gte('reserve_price', filters.priceMin)
  }
  if (filters.priceMax != null) {
    query = query.lte('reserve_price', filters.priceMax)
  }
  if (filters.location?.trim()) {
    query = query.ilike('location', `%${filters.location.trim()}%`)
  }

  switch (sort) {
    case 'price_asc':
      query = query.order('reserve_price', { ascending: true, nullsFirst: false })
      break
    case 'price_desc':
      query = query.order('reserve_price', { ascending: false, nullsFirst: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1)

  if (error) throw new Error(error.message ?? 'Failed to fetch listings')

  const rows = Array.isArray(data) ? data : []
  const listings: MarketplaceListing[] = rows.map((row: Record<string, unknown>) => {
    const auctions = row.auctions
    const auction = Array.isArray(auctions) ? (auctions[0] as Record<string, unknown>) : auctions as Record<string, unknown> | null
    return mapListing(row, auction ?? null)
  })

  return {
    data: listings,
    total: typeof count === 'number' ? count : 0,
  }
}

export async function fetchSuggestions(q: string): Promise<SuggestResult[]> {
  if (!q?.trim() || q.trim().length < 2) return []

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, identifier, location')
    .or(`title.ilike.%${q.trim()}%,identifier.ilike.%${q.trim()}%,location.ilike.%${q.trim()}%`)
    .in('status', ['approved', 'scheduled', 'live'])
    .limit(10)

  if (error) return []

  const rows = Array.isArray(data) ? data : []
  const results: SuggestResult[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    const title = row.title != null ? String(row.title) : ''
    if (title && !seen.has(`title:${title}`)) {
      seen.add(`title:${title}`)
      results.push({ id: `t-${row.id}`, type: 'keyword', text: title, listingId: String(row.id ?? '') })
    }
    const identifier = row.identifier != null ? String(row.identifier) : ''
    if (identifier && !seen.has(`id:${identifier}`)) {
      seen.add(`id:${identifier}`)
      results.push({ id: `i-${row.id}`, type: 'identifier', text: identifier, listingId: String(row.id ?? '') })
    }
    const location = row.location != null ? String(row.location) : ''
    if (location && !seen.has(`loc:${location}`)) {
      seen.add(`loc:${location}`)
      results.push({ id: `l-${row.id}-${location}`, type: 'location', text: location })
    }
  }

  return results.slice(0, 10)
}

export async function toggleWatch(listingId: string): Promise<{ watching: boolean }> {
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

export async function getWatchStatus(listingIds: string[]): Promise<Record<string, boolean>> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId || listingIds.length === 0) return {}

  const { data } = await supabase
    .from('watchlists')
    .select('listing_id')
    .eq('buyer_id', buyerId)
    .in('listing_id', listingIds)

  const rows = Array.isArray(data) ? data : []
  const out: Record<string, boolean> = {}
  for (const id of listingIds) out[id] = false
  for (const row of rows) {
    const lid = row?.listing_id != null ? String(row.listing_id) : ''
    if (lid) out[lid] = true
  }
  return out
}

export async function checkSubscriptionActive(): Promise<boolean> {
  const buyerId = await getOrCreateBuyerId()
  if (!buyerId) return false

  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('buyer_id', buyerId)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  return data?.id != null
}
