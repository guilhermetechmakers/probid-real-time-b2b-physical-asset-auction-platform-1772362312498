/**
 * Deposits List - Fetches deposit holds for the authenticated buyer.
 * Integrates with deposit_holds table.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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
    const buyerId = (body?.buyerId ?? user.id) as string
    const effectiveBuyerId = typeof buyerId === 'string' ? buyerId.trim() : user.id
    if (effectiveBuyerId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: rows, error } = await supabase
      .from('deposit_holds')
      .select('id, buyer_id, auction_id, amount, currency, status, expires_at, created_at, updated_at, hold_type, release_rule, captured_at, released_at, payment_method_id, stripe_payment_intent_id, notes')
      .eq('buyer_id', effectiveBuyerId)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const list = Array.isArray(rows) ? rows : []
    const auctionIds = [...new Set(list.map((r: Record<string, unknown>) => r.auction_id).filter(Boolean))]
    const listingMap = new Map<string, string>()
    const auctionTitleMap = new Map<string, string>()
    if (auctionIds.length > 0) {
      const { data: auctions } = await supabase
        .from('auctions')
        .select('id, listing_id')
        .in('id', auctionIds)
      const auctionList = Array.isArray(auctions) ? auctions : []
      const listingIds = [...new Set(auctionList.map((a: Record<string, unknown>) => a.listing_id).filter(Boolean))]
      if (listingIds.length > 0) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title')
          .in('id', listingIds)
        for (const l of Array.isArray(listings) ? listings : []) {
          auctionTitleMap.set(String(l.id), String(l.title ?? ''))
        }
      }
      for (const a of auctionList) {
        listingMap.set(String(a.id), String(a.listing_id ?? ''))
      }
    }

    const deposits = list.map((r: Record<string, unknown>) => {
      const listingId = listingMap.get(String(r.auction_id)) ?? null
      const auctionTitle = listingId ? (auctionTitleMap.get(String(listingId)) ?? null) : null
      return {
        id: r.id,
        buyer_id: r.buyer_id ?? effectiveBuyerId,
        auction_id: r.auction_id,
        amount: r.amount,
        currency: r.currency,
        status: r.status,
        expires_at: r.expires_at,
        created_at: r.created_at,
        updated_at: r.updated_at,
        hold_type: r.hold_type,
        release_rule: r.release_rule,
        captured_at: r.captured_at,
        released_at: r.released_at,
        payment_method_id: r.payment_method_id,
        stripe_payment_intent_id: r.stripe_payment_intent_id,
        notes: r.notes,
        listing_id: listingId,
        auction_title: auctionTitle,
      }
    })

    return new Response(
      JSON.stringify({ deposits }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
