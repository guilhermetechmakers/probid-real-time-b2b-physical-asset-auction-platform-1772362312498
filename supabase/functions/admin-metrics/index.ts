/**
 * Admin Metrics - Returns dashboard metrics for admin hub.
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

    const [listingsRes, buyersRes, auctionsRes, salesRes] = await Promise.all([
      supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
      supabase.from('buyers').select('id', { count: 'exact', head: true }).in('kyc_status', ['pending', 'submitted']),
      supabase.from('auctions').select('id', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('sales').select('sale_price'),
    ])

    let openDisputes = 0
    try {
      const disputesRes = await supabase.from('disputes').select('id', { count: 'exact', head: true }).or('status.eq.open,status.eq.in_review')
      openDisputes = disputesRes.count ?? 0
    } catch {
      // disputes table may not exist yet
    }

    const pendingListings = listingsRes.count ?? 0
    const pendingBuyerApprovals = buyersRes.count ?? 0
    const liveAuctions = auctionsRes.count ?? 0
    const sales = Array.isArray(salesRes.data) ? salesRes.data : []
    const totalRevenue = sales.reduce((sum: number, s: { sale_price?: number }) => sum + Number(s?.sale_price ?? 0), 0)

    return new Response(
      JSON.stringify({
        pendingListings,
        pendingBuyerApprovals,
        liveAuctions,
        openDisputes,
        totalRevenue,
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
