/**
 * Deposits Webhook Stripe - Idempotent Stripe webhook handler for deposit events.
 * Verifies signature, maps payment_intent events to deposit hold state.
 * Requires STRIPE_WEBHOOK_SECRET. Emits audit logs.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
  if (!webhookSecret) {
    return new Response(JSON.stringify({ error: 'Webhook secret not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response(JSON.stringify({ error: 'Missing stripe-signature' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let body: string
  try {
    body = await req.text()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let event: Stripe.Event
  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', { apiVersion: '2024-11-20.acacia' })
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret) as Stripe.Event
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Signature verification failed' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  const eventId = event.id ?? ''
  const { data: existing } = await supabase
    .from('webhooks_log')
    .select('id')
    .eq('event_id', eventId)
    .maybeSingle()

  if (existing) {
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  await supabase.from('webhooks_log').insert({
    event_id: eventId,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
    status: 'PROCESSED',
  })

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data?.object as Stripe.PaymentIntent
    const piId = pi?.id ?? ''
    if (piId) {
      const { data: holds } = await supabase
        .from('deposit_holds')
        .select('id, buyer_id')
        .eq('stripe_payment_intent_id', piId)
        .eq('status', 'holding')
        .limit(1)
      const hold = Array.isArray(holds) && holds.length > 0 ? holds[0] : null
      if (hold) {
        const now = new Date().toISOString()
        await supabase
          .from('deposit_holds')
          .update({ status: 'captured', captured_at: now, updated_at: now })
          .eq('id', hold.id)
        await supabase.from('deposit_audit_logs').insert({
          event_type: 'webhook_processed',
          deposit_id: hold.id,
          actor_id: hold.buyer_id,
          payload: { stripeEvent: event.type, paymentIntentId: piId },
        })
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
