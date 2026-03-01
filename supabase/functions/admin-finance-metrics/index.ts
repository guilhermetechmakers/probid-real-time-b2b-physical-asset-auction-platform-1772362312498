/**
 * Admin Finance Metrics - Returns finance metrics for admin panel.
 * Requires admin or ops role.
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

    const supabaseAuth = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user?.id) {
      return new Response(JSON.stringify({ error: 'Not authenticated' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const role = (user.user_metadata?.role as string) ?? 'buyer'
    if (role !== 'admin' && role !== 'ops') {
      return new Response(JSON.stringify({ error: 'Admin or ops role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const [invoicesRes, disputesRes, payoutsRes] = await Promise.all([
      supabase.from('invoices').select('amount, status').in('status', ['PAID', 'COMPLETE']),
      supabase.from('disputes').select('id', { count: 'exact', head: true }).in('status', ['initiated', 'under_review']),
      supabase.from('payouts').select('amount, status').eq('status', 'PENDING'),
    ])

    const invoices = Array.isArray(invoicesRes.data) ? invoicesRes.data : []
    const totalRevenue = invoices.reduce((sum: number, inv: { amount?: number }) => sum + (Number(inv?.amount ?? 0)), 0)
    const subscriptionRevenue = totalRevenue * 0.7
    const transactionalFees = totalRevenue * 0.03
    const openDisputes = disputesRes.count ?? 0
    const payouts = Array.isArray(payoutsRes.data) ? payoutsRes.data : []
    const pendingPayouts = payouts.reduce((sum: number, p: { amount?: number }) => sum + (Number(p?.amount ?? 0)), 0)

    return new Response(
      JSON.stringify({
        metrics: {
          totalRevenue,
          subscriptionRevenue,
          transactionalFees,
          openDisputes,
          pendingPayouts,
        },
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
