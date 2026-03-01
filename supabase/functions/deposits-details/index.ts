/**
 * Deposits Details - Fetches a single deposit hold by ID.
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
    const depositId = typeof body?.depositId === 'string' ? body.depositId.trim() : ''

    if (!depositId) {
      return new Response(
        JSON.stringify({ error: 'depositId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: deposit, error } = await supabase
      .from('deposit_holds')
      .select('*')
      .eq('id', depositId)
      .eq('buyer_id', user.id)
      .single()

    if (error || !deposit) {
      return new Response(
        JSON.stringify({ error: 'Deposit not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        id: deposit.id,
        auction_id: deposit.auction_id,
        amount: deposit.amount,
        currency: deposit.currency,
        status: deposit.status,
        expires_at: deposit.expires_at,
        created_at: deposit.created_at,
        updated_at: deposit.updated_at,
        hold_type: deposit.hold_type,
        release_rule: deposit.release_rule,
        captured_at: deposit.captured_at,
        released_at: deposit.released_at,
        payment_method_id: deposit.payment_method_id,
        stripe_payment_intent_id: deposit.stripe_payment_intent_id,
        notes: deposit.notes,
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
