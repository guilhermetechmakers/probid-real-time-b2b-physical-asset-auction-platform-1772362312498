/**
 * Settings Subscription - GET subscription details.
 * Integrates with subscriptions table (buyers).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: buyer } = await supabase
      .from('buyers')
      .select('id, subscription_id')
      .eq('user_id', user.id)
      .single()

    if (!buyer?.subscription_id) {
      return new Response(JSON.stringify({ subscription: null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', buyer.subscription_id)
      .single()

    const subscription = sub
      ? {
          id: sub.id,
          plan_id: sub.plan_id,
          plan_name: sub.plan_id === 'pro' ? 'Pro' : sub.plan_id === 'enterprise' ? 'Enterprise' : sub.plan_id,
          status: sub.status,
          current_period_start: sub.current_period_start,
          current_period_end: sub.current_period_end,
          next_billing_date: sub.next_billing_date ?? sub.current_period_end,
          next_billing_amount: null,
          currency: 'USD',
        }
      : null

    return new Response(JSON.stringify({ subscription }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
