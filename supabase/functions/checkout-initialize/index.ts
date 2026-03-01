/**
 * Checkout Initialize - Creates invoice and Stripe PaymentIntent for post-auction checkout.
 * Integrates with Stripe API. Requires STRIPE_SECRET_KEY in secrets.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

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
    const auctionId = typeof body?.auctionId === 'string' ? body.auctionId.trim() : ''
    if (!auctionId) {
      return new Response(
        JSON.stringify({ error: 'auctionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: auction } = await supabase
      .from('auctions')
      .select('id, listing_id, current_bid, status')
      .eq('id', auctionId)
      .single()

    if (!auction || auction.status !== 'ended') {
      return new Response(
        JSON.stringify({ error: 'Auction not found or not ended' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: listing } = await supabase
      .from('listings')
      .select('id, seller_id')
      .eq('id', auction.listing_id)
      .single()

    if (!listing) {
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: topBid } = await supabase
      .from('bids')
      .select('bidder_id, amount')
      .eq('auction_id', auctionId)
      .order('amount', { ascending: false })
      .limit(1)
      .maybeSingle()

    const winnerId = topBid?.bidder_id ?? user.id
    if (winnerId !== user.id) {
      return new Response(
        JSON.stringify({ error: 'You are not the winning bidder' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const saleAmount = Number(auction.current_bid ?? topBid?.amount ?? 0)
    const platformFeePercent = 0.05
    const fees = Math.round(saleAmount * platformFeePercent * 100) / 100
    const tax = 0
    const totalDue = saleAmount + fees + tax
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 7)

    const { data: existingInvoice } = await supabase
      .from('invoices')
      .select('id, status')
      .eq('auction_id', auctionId)
      .eq('buyer_id', user.id)
      .maybeSingle()

    let invoiceId: string
    if (existingInvoice?.id) {
      invoiceId = existingInvoice.id
    } else {
      const { data: newInvoice, error: invErr } = await supabase
        .from('invoices')
        .insert({
          auction_id: auctionId,
          listing_id: listing.id,
          buyer_id: user.id,
          seller_id: listing.seller_id,
          amount: saleAmount,
          currency: 'USD',
          status: 'PENDING',
          due_date: dueDate.toISOString(),
          tax,
          fees,
          deposit_required: false,
          deposit_amount: 0,
        })
        .select('id')
        .single()

      if (invErr || !newInvoice?.id) {
        return new Response(
          JSON.stringify({ error: invErr?.message ?? 'Failed to create invoice' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      invoiceId = newInvoice.id
    }

    let clientSecret: string | undefined
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (stripeKey && totalDue > 0) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(totalDue * 100),
        currency: 'usd',
        metadata: { invoiceId, auctionId },
      })
      clientSecret = pi.client_secret ?? undefined
    }

    return new Response(
      JSON.stringify({
        invoiceId,
        dueAmount: totalDue,
        currency: 'USD',
        clientSecret,
        depositInfo: { required: false, amount: 0 },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
