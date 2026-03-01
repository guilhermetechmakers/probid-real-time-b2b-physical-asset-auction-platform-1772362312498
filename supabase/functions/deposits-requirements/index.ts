/**
 * Deposits Requirements - Fetches deposit requirements per auction.
 * Returns required amounts per auction for the authenticated buyer.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_DEPOSIT_PERCENT = 0.05
const DEFAULT_EXPIRY_HOURS = 24

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json().catch(() => ({}))
    const auctionId = typeof body?.auctionId === 'string' ? body.auctionId.trim() : ''
    const auctionIdFilter = auctionId || undefined

    let auctions: Record<string, unknown>[] = []
    if (auctionIdFilter) {
      const { data: single } = await supabase
        .from('auctions')
        .select('id, listing_id, current_bid, starting_price, reserve_price, status')
        .eq('id', auctionIdFilter)
        .single()
      auctions = single ? [single] : []
    } else {
      const { data } = await supabase
        .from('auctions')
        .select('id, listing_id, current_bid, starting_price, reserve_price, status')
        .in('status', ['scheduled', 'live'])
      auctions = Array.isArray(data) ? data : []
    }

    const list = Array.isArray(auctions) ? auctions : []
    const listingIds = [...new Set(list.map((a: Record<string, unknown>) => a.listing_id).filter(Boolean))]
    const listingTitleMap = new Map<string, string>()
    if (listingIds.length > 0) {
      const { data: listings } = await supabase
        .from('listings')
        .select('id, title')
        .in('id', listingIds)
      for (const l of Array.isArray(listings) ? listings : []) {
        listingTitleMap.set(String(l.id), String(l.title ?? ''))
      }
    }
    const { data: existingHolds } = await supabase
      .from('deposit_holds')
      .select('id, auction_id, status')
      .eq('buyer_id', user.id)
      .eq('status', 'holding')

    const holdsByAuction = new Map<string, { id: string }>()
    for (const h of Array.isArray(existingHolds) ? existingHolds : []) {
      holdsByAuction.set(String(h.auction_id), { id: String(h.id ?? '') })
    }

    const requirements = list.map((a: Record<string, unknown>) => {
      const basePrice = Number(a.current_bid ?? a.starting_price ?? a.reserve_price ?? 0)
      const requiredAmount = Math.max(100, basePrice * DEFAULT_DEPOSIT_PERCENT)
      const hold = holdsByAuction.get(String(a.id))
      const hasActiveHold = Boolean(hold)
      const activeHoldId = hold?.id ?? null
      const listingId = a.listing_id ? String(a.listing_id) : undefined
      const auctionTitle = listingId ? (listingTitleMap.get(listingId) ?? undefined) : undefined
      return {
        auctionId: a.id,
        auctionTitle,
        listingId,
        requiredAmount: Math.round(requiredAmount * 100) / 100,
        currency: 'USD',
        expiryHours: DEFAULT_EXPIRY_HOURS,
        releaseConditions: 'Released when auction ends or bid is cancelled',
        hasActiveHold,
        activeHoldId,
      }
    })

    return new Response(
      JSON.stringify({ requirements }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
