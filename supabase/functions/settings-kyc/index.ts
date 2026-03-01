/**
 * Settings KYC - GET KYC status.
 * Integrates with kyc_records and buyers.
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
      .select('id, kyc_status, verification_status, admin_approved')
      .eq('user_id', user.id)
      .single()

    const { data: kycRow } = await supabase
      .from('kyc_records')
      .select('*')
      .eq('buyer_id', buyer?.id ?? '')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const statusMap: Record<string, string> = {
      pending: 'pending',
      submitted: 'in_review',
      approved: 'verified',
      rejected: 'rejected',
    }
    const status =
      statusMap[kycRow?.status ?? buyer?.kyc_status ?? 'pending'] ?? 'pending'

    const kyc = {
      status,
      submitted_at: kycRow?.submitted_at ?? null,
      reviewed_at: kycRow?.updated_at ?? null,
      reviewed_by: null,
      notes: kycRow?.evidence != null ? 'Documents submitted' : null,
      required_actions:
        status === 'pending'
          ? ['Submit identity verification documents']
          : status === 'rejected'
            ? ['Review feedback and resubmit']
            : [],
    }

    return new Response(JSON.stringify({ kyc }), {
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
