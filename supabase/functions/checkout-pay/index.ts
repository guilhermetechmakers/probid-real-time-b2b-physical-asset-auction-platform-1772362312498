/**
 * Checkout Pay - Confirms Stripe PaymentIntent and updates invoice status.
 * Idempotent via idempotency_key.
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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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
    const paymentMethodId = typeof body?.paymentMethodId === 'string' ? body.paymentMethodId.trim() : ''
    const idempotencyKey = typeof body?.idempotencyKey === 'string' ? body.idempotencyKey : crypto.randomUUID()

    if (!auctionId || !paymentMethodId) {
      return new Response(
        JSON.stringify({ error: 'auctionId and paymentMethodId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, amount, fees, tax, status')
      .eq('auction_id', auctionId)
      .eq('buyer_id', user.id)
      .single()

    if (!invoice || invoice.status === 'PAID') {
      return new Response(
        JSON.stringify({
          paymentStatus: invoice?.status === 'PAID' ? 'succeeded' : 'failed',
          invoiceId: invoice?.id ?? '',
          invoiceStatus: invoice?.status,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const totalAmount = Number(invoice.amount ?? 0) + Number(invoice.fees ?? 0) + Number(invoice.tax ?? 0)
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

    if (!stripeKey || totalAmount <= 0) {
      await supabase
        .from('invoices')
        .update({ status: 'PAID', updated_at: new Date().toISOString() })
        .eq('id', invoice.id)
      return new Response(
        JSON.stringify({
          paymentStatus: 'succeeded',
          invoiceId: invoice.id,
          invoiceStatus: 'PAID',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2024-11-20.acacia' })
    const pi = await stripe.paymentIntents.create(
      {
        amount: Math.round(totalAmount * 100),
        currency: 'usd',
        payment_method: paymentMethodId,
        confirm: true,
        metadata: { invoiceId: invoice.id, auctionId },
      },
      { idempotencyKey }
    )

    const status = pi.status === 'succeeded' ? 'succeeded' : pi.status === 'requires_action' ? 'requires_action' : pi.status === 'requires_payment_method' ? 'requires_payment_method' : 'failed'

    if (pi.status === 'succeeded') {
      await supabase
        .from('invoices')
        .update({ status: 'PAID', updated_at: new Date().toISOString() })
        .eq('id', invoice.id)

      await supabase.from('payments').insert({
        invoice_id: invoice.id,
        stripe_payment_intent_id: pi.id,
        amount: totalAmount,
        currency: 'usd',
        status: 'succeeded',
        method_id: paymentMethodId,
        idempotency_key: idempotencyKey,
      })
    }

    return new Response(
      JSON.stringify({
        paymentStatus: status,
        invoiceId: invoice.id,
        invoiceStatus: pi.status === 'succeeded' ? 'PAID' : invoice.status,
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
