/**
 * Dispute Initiate - Creates a new dispute for a transaction.
 * Creates audit trail entry on success.
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
    const transactionId = typeof body?.transactionId === 'string' ? body.transactionId.trim() : ''
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : ''
    const description = typeof body?.description === 'string' ? body.description.trim() : ''
    const attachmentUrls = Array.isArray(body?.attachmentUrls) ? body.attachmentUrls : []

    if (!transactionId || !reason) {
      return new Response(
        JSON.stringify({ error: 'transactionId and reason required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, buyer_id')
      .eq('id', transactionId)
      .eq('buyer_id', user.id)
      .single()

    if (!invoice?.id) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found or access denied' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: existingDispute } = await supabase
      .from('disputes')
      .select('id')
      .eq('transaction_id', transactionId)
      .maybeSingle()

    if (existingDispute?.id) {
      return new Response(
        JSON.stringify({ error: 'Dispute already exists for this transaction' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: dispute, error: dispErr } = await supabase
      .from('disputes')
      .insert({
        transaction_id: transactionId,
        initiator_id: user.id,
        status: 'initiated',
        reason,
        description: description || null,
      })
      .select('id, status, created_at')
      .single()

    if (dispErr || !dispute?.id) {
      return new Response(
        JSON.stringify({ error: dispErr?.message ?? 'Failed to create dispute' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase.from('audit_trails').insert({
      entity_type: 'dispute',
      entity_id: dispute.id,
      action: 'dispute_initiated',
      actor_id: user.id,
      notes: `Dispute created: ${reason}`,
    })

    for (const url of attachmentUrls) {
      if (typeof url === 'string' && url.startsWith('http')) {
        await supabase.from('evidences').insert({
          dispute_id: dispute.id,
          type: url.match(/\.pdf$/i) ? 'pdf' : 'image',
          url,
          uploaded_by: user.id,
        })
      }
    }

    return new Response(
      JSON.stringify({
        dispute: {
          id: dispute.id,
          status: dispute.status,
          createdAt: dispute.created_at,
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
