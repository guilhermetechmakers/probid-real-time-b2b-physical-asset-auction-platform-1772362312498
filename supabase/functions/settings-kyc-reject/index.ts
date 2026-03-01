/**
 * Settings KYC Reject - Admin rejects KYC for current user.
 * Requires admin or ops role. Uses service role to bypass RLS.
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

    const body = await req.json().catch(() => ({})) as { notes?: string }
    const notes = typeof body.notes === 'string' ? body.notes : undefined

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { data: buyer } = await supabase
      .from('buyers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!buyer?.id) {
      return new Response(JSON.stringify({ error: 'Buyer record not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: kycRow } = await supabase
      .from('kyc_records')
      .select('id')
      .eq('buyer_id', buyer.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (kycRow?.id) {
      const updatePayload: Record<string, unknown> = {
        status: 'rejected',
        admin_review_status: 'rejected',
        updated_at: new Date().toISOString(),
      }
      if (notes) {
        const { data: existing } = await supabase.from('kyc_records').select('evidence').eq('id', kycRow.id).single()
        const evidence = (existing?.evidence as Record<string, unknown>) ?? {}
        updatePayload.evidence = { ...evidence, rejection_notes: notes }
      }
      await supabase.from('kyc_records').update(updatePayload).eq('id', kycRow.id)
    }

    await supabase
      .from('buyers')
      .update({ kyc_status: 'rejected', verification_status: 'rejected', admin_approved: false, updated_at: new Date().toISOString() })
      .eq('id', buyer.id)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
