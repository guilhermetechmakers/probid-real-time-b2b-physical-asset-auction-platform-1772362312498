/**
 * Dispute Audit - Fetches audit trail for a dispute.
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

    const url = new URL(req.url)
    const disputeId = url.searchParams.get('disputeId') ?? ''

    if (!disputeId?.trim()) {
      return new Response(
        JSON.stringify({ error: 'disputeId required' }),
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

    const { data: events, error } = await supabase
      .from('audit_trails')
      .select('id, action, actor_id, timestamp, notes')
      .eq('entity_type', 'dispute')
      .eq('entity_id', disputeId)
      .order('timestamp', { ascending: true })

    const list = Array.isArray(events) ? events : []
    const auditEvents = list.map((e) => ({
      id: e.id,
      action: e.action,
      actorId: e.actor_id,
      timestamp: e.timestamp,
      notes: e.notes ?? null,
    }))

    return new Response(
      JSON.stringify({ events: auditEvents }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
