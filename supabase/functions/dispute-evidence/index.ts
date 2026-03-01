/**
 * Dispute Evidence - Adds evidence to an existing dispute.
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
    const disputeId = typeof body?.disputeId === 'string' ? body.disputeId.trim() : ''
    const type = (typeof body?.type === 'string' ? body.type : 'image') as 'image' | 'pdf' | 'notes'
    const url = typeof body?.url === 'string' ? body.url.trim() : ''
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : ''

    if (!disputeId || !url) {
      return new Response(
        JSON.stringify({ error: 'disputeId and url required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: dispute } = await supabase
      .from('disputes')
      .select('id, transaction_id')
      .eq('id', disputeId)
      .single()

    if (!dispute?.id) {
      return new Response(
        JSON.stringify({ error: 'Dispute not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('buyer_id, seller_id')
      .eq('id', dispute.transaction_id)
      .single()

    if (!invoice || (invoice.buyer_id !== user.id && invoice.seller_id !== user.id)) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const evidenceType = type === 'notes' ? 'notes' : (url.match(/\.pdf$/i) ? 'pdf' : 'image')

    const { data: evidence, error: evErr } = await supabase
      .from('evidences')
      .insert({
        dispute_id: disputeId,
        type: evidenceType,
        url,
        uploaded_by: user.id,
      })
      .select('id, type, url, uploaded_at')
      .single()

    if (evErr || !evidence?.id) {
      return new Response(
        JSON.stringify({ error: evErr?.message ?? 'Failed to add evidence' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (notes) {
      await supabase.from('audit_trails').insert({
        entity_type: 'dispute',
        entity_id: disputeId,
        action: 'evidence_added',
        actor_id: user.id,
        notes,
      })
    }

    return new Response(
      JSON.stringify({
        evidence: {
          id: evidence.id,
          type: evidence.type,
          url: evidence.url,
          uploadedAt: evidence.uploaded_at,
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
