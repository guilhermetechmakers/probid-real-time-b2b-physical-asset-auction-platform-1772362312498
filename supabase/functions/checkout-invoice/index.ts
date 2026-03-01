/**
 * Checkout Invoice - Fetches invoice details for an auction.
 * Returns invoice with deposit info for the authenticated buyer.
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
    const auctionId = url.searchParams.get('auctionId') ?? ''
    const body = await req.json().catch(() => ({}))
    const auctionIdFromBody = typeof body?.auctionId === 'string' ? body.auctionId.trim() : ''
    const resolvedAuctionId = auctionId || auctionIdFromBody

    if (!resolvedAuctionId) {
      return new Response(
        JSON.stringify({ error: 'auctionId required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('auction_id', resolvedAuctionId)
      .eq('buyer_id', user.id)
      .maybeSingle()

    if (invErr || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: depositRows } = await supabase
      .from('deposits')
      .select('id, amount, status, hold_until, captured_at, released_at')
      .eq('invoice_id', invoice.id)
      .limit(1)

    const deposit = Array.isArray(depositRows) && depositRows.length > 0 ? depositRows[0] : null

    const invoiceResponse = {
      id: invoice.id,
      auctionId: invoice.auction_id,
      listingId: invoice.listing_id,
      buyerId: invoice.buyer_id,
      sellerId: invoice.seller_id,
      amount: Number(invoice.amount ?? 0),
      currency: String(invoice.currency ?? 'USD'),
      status: invoice.status,
      dueDate: invoice.due_date,
      tax: Number(invoice.tax ?? 0),
      fees: Number(invoice.fees ?? 0),
      discount: Number(invoice.discount ?? 0),
      depositRequired: Boolean(invoice.deposit_required),
      depositAmount: Number(invoice.deposit_amount ?? 0),
      payoutInstructionsId: invoice.payout_instructions_id ?? undefined,
      invoicePdfUrl: invoice.invoice_pdf_url ?? null,
      receiptPdfUrl: invoice.receipt_pdf_url ?? null,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
    }

    const depositResponse = deposit
      ? {
          id: deposit.id,
          invoiceId: invoice.id,
          amount: Number(deposit.amount ?? 0),
          status: deposit.status,
          holdUntil: deposit.hold_until ?? null,
          capturedAt: deposit.captured_at ?? null,
          releasedAt: deposit.released_at ?? null,
        }
      : null

    return new Response(
      JSON.stringify({
        invoice: invoiceResponse,
        deposit: depositResponse,
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
