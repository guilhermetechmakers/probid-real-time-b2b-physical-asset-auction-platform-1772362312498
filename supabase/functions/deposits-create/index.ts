/**
 * Deposits Create - Creates a new deposit hold for an auction.
 * Integrates with Stripe for PaymentIntent when STRIPE_SECRET_KEY is set.
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
    const amount = Number(body?.amount ?? 0)
    const currency = (typeof body?.currency === 'string' ? body.currency : 'USD').toUpperCase()
    const holdFor = Number(body?.holdFor ?? 24)
    const releaseRule = body?.releaseRule ?? {}

    if (!auctionId) {
      return new Response(
        JSON.stringify({ error: 'auctionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'amount must be positive' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: auction } = await supabase
      .from('auctions')
      .select('id, listing_id')
      .eq('id', auctionId)
      .single()

    if (!auction) {
      return new Response(
        JSON.stringify({ error: 'Auction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + holdFor)

    let stripePaymentIntentId: string | null = null
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (stripeKey && amount > 0) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
      const pi = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        capture_method: 'manual',
        metadata: { buyerId: user.id, auctionId },
      })
      stripePaymentIntentId = pi.id ?? null
    }

    const { data: insertData, error: insertErr } = await supabase
      .from('deposit_holds')
      .insert({
        buyer_id: user.id,
        auction_id: auctionId,
        amount,
        currency,
        status: 'holding',
        expires_at: expiresAt.toISOString(),
        hold_type: 'deposit',
        release_rule: releaseRule,
        stripe_payment_intent_id: stripePaymentIntentId,
      })
      .select()
      .single()

    if (insertErr || !insertData) {
      return new Response(
        JSON.stringify({ error: insertErr?.message ?? 'Failed to create deposit' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.from('deposit_events').insert({
      deposit_id: insertData.id,
      event_type: 'created',
      payload: { amount, currency, auctionId },
      actor_id: user.id,
    })

    await supabase.from('deposit_audit_logs').insert({
      event_type: 'created',
      deposit_id: insertData.id,
      actor_id: user.id,
      payload: { amount, currency, auctionId },
    })

    let clientSecret: string | undefined
    if (stripePaymentIntentId && stripeKey) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
      const pi = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
      clientSecret = pi.client_secret ?? undefined
    }

    return new Response(
      JSON.stringify({
        id: insertData.id,
        auction_id: insertData.auction_id,
        amount: insertData.amount,
        currency: insertData.currency,
        status: insertData.status,
        expires_at: insertData.expires_at,
        created_at: insertData.created_at,
        updated_at: insertData.updated_at,
        hold_type: insertData.hold_type,
        release_rule: insertData.release_rule,
        stripe_payment_intent_id: insertData.stripe_payment_intent_id,
        clientSecret,
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
