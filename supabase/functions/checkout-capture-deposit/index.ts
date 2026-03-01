/**
 * Checkout Capture Deposit - Captures held deposit for an invoice.
 * Idempotent; guards against repeated captures.
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
    const invoiceId = typeof body?.invoiceId === 'string' ? body.invoiceId.trim() : ''
    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'invoiceId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('id, buyer_id')
      .eq('id', invoiceId)
      .single()

    if (!invoice || invoice.buyer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: deposit } = await supabase
      .from('deposits')
      .select('id, status')
      .eq('invoice_id', invoiceId)
      .eq('status', 'HELD')
      .maybeSingle()

    if (!deposit) {
      return new Response(
        JSON.stringify({ success: true, message: 'No deposit to capture' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await supabase
      .from('deposits')
      .update({
        status: 'CAPTURED',
        captured_at: new Date().toISOString(),
      })
      .eq('id', deposit.id)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
