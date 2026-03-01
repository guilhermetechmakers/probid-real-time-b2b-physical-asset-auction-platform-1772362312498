/**
 * Admin Buyers Approve - Approve or deny a buyer/KYC.
 * Requires admin or ops role. Creates audit log.
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

    const body = await req.json().catch(() => ({}))
    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const decision = body?.decision === 'deny' ? 'deny' : 'approve'
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : ''

    if (!id) {
      return new Response(JSON.stringify({ error: 'Buyer id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const kycStatus = decision === 'approve' ? 'approved' : 'rejected'
    const verificationStatus = decision === 'approve' ? 'approved' : 'rejected'
    const adminApproved = decision === 'approve'

    const { error: buyerErr } = await supabase
      .from('buyers')
      .update({
        kyc_status: kycStatus,
        verification_status: verificationStatus,
        admin_approved: adminApproved,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (buyerErr) {
      return new Response(JSON.stringify({ error: buyerErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: kycRow } = await supabase
      .from('kyc_records')
      .select('id')
      .eq('buyer_id', id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (kycRow?.id) {
      await supabase
        .from('kyc_records')
        .update({
          status: kycStatus,
          admin_review_status: kycStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', kycRow.id)
    }

    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: decision === 'approve' ? 'buyer_approved' : 'buyer_denied',
      target_type: 'buyer',
      target_id: id,
      metadata: notes ? { notes } : {},
      immutable: true,
    })

    return new Response(JSON.stringify({ success: true }), {
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
