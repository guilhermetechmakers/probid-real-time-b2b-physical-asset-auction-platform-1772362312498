/**
 * Deposits Capture - Captures a deposit hold (payment method must be attached).
 * Integrates with Stripe API.
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
    const depositId = typeof body?.depositId === 'string' ? body.depositId.trim() : ''

    if (!depositId) {
      return new Response(
        JSON.stringify({ error: 'depositId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: deposit, error: fetchErr } = await supabase
      .from('deposit_holds')
      .select('*')
      .eq('id', depositId)
      .eq('buyer_id', user.id)
      .single()

    if (fetchErr || !deposit) {
      return new Response(
        JSON.stringify({ success: false, error: 'Deposit not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (deposit.status !== 'holding') {
      return new Response(
        JSON.stringify({ success: false, error: `Deposit status is ${deposit.status}, cannot capture` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripePaymentIntentId = deposit.stripe_payment_intent_id
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (stripeKey && stripePaymentIntentId) {
      const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
      await stripe.paymentIntents.capture(stripePaymentIntentId)
    }

    const now = new Date().toISOString()
    const { error: updateErr } = await supabase
      .from('deposit_holds')
      .update({
        status: 'captured',
        captured_at: now,
        updated_at: now,
      })
      .eq('id', depositId)
      .eq('buyer_id', user.id)

    if (updateErr) {
      return new Response(
        JSON.stringify({ success: false, error: updateErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.from('deposit_events').insert({
      deposit_id: depositId,
      event_type: 'captured',
      payload: {},
      actor_id: user.id,
    })

    await supabase.from('deposit_audit_logs').insert({
      event_type: 'captured',
      deposit_id: depositId,
      actor_id: user.id,
      payload: {},
    })

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
