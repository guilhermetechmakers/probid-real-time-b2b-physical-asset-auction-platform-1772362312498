/**
 * Transaction History - Fetches past transactions for buyers/sellers.
 * Returns invoices with nested dispute, logistics, settlement data.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type TransactionStatus = 'paid' | 'pending' | 'disputed' | 'refunded'

function mapInvoiceStatus(status: string): TransactionStatus {
  if (status === 'PAID' || status === 'COMPLETE') return 'paid'
  if (status === 'FAILED' || status === 'CANCELLED') return 'refunded'
  return 'pending'
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
    const role = (url.searchParams.get('role') ?? 'buyer') as 'buyer' | 'seller'
    const startDate = url.searchParams.get('startDate') ?? ''
    const endDate = url.searchParams.get('endDate') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const auctionId = url.searchParams.get('auctionId') ?? ''
    const transactionId = url.searchParams.get('transactionId') ?? ''

    const col = role === 'buyer' ? 'buyer_id' : 'seller_id'
    let query = supabase
      .from('invoices')
      .select(`
        id,
        auction_id,
        listing_id,
        buyer_id,
        seller_id,
        amount,
        currency,
        status,
        due_date,
        tax,
        fees,
        invoice_pdf_url,
        receipt_pdf_url,
        created_at,
        updated_at
      `)
      .eq(col, user.id)
      .order('created_at', { ascending: false })

    if (transactionId?.trim()) {
      query = query.eq('id', transactionId.trim())
    }
    if (auctionId?.trim()) {
      query = query.eq('auction_id', auctionId.trim())
    }
    if (startDate?.trim()) {
      query = query.gte('created_at', startDate.trim())
    }
    if (endDate?.trim()) {
      query = query.lte('created_at', endDate.trim())
    }

    const { data: invoices, error: invErr } = await query

    if (invErr) {
      return new Response(
        JSON.stringify({ error: invErr.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const invoiceList = Array.isArray(invoices) ? invoices : []
    const invoiceIds = invoiceList.map((i) => i.id).filter(Boolean)

    let disputesMap: Record<string, unknown> = {}
    let logisticsMap: Record<string, unknown> = {}
    let settlementsMap: Record<string, unknown> = {}
    let listingsMap: Record<string, { title?: string; image_urls?: string[] }> = {}

    if (invoiceIds.length > 0) {
      const [disputesRes, logisticsRes, settlementsRes] = await Promise.all([
        supabase.from('disputes').select('*').in('transaction_id', invoiceIds),
        supabase.from('logistics').select('*').in('transaction_id', invoiceIds),
        supabase.from('settlements').select('*').in('transaction_id', invoiceIds),
      ])

      const disputes = Array.isArray(disputesRes?.data) ? disputesRes.data : []
      const logistics = Array.isArray(logisticsRes?.data) ? logisticsRes.data : []
      const settlements = Array.isArray(settlementsRes?.data) ? settlementsRes.data : []

      for (const d of disputes) {
        const tid = d?.transaction_id ?? ''
        if (tid) disputesMap[tid] = d
      }
      for (const l of logistics) {
        const tid = l?.transaction_id ?? ''
        if (tid) logisticsMap[tid] = l
      }
      for (const s of settlements) {
        const tid = s?.transaction_id ?? ''
        if (tid) settlementsMap[tid] = s
      }

      const listingIds = [...new Set(invoiceList.map((i) => i.listing_id).filter(Boolean))]
      if (listingIds.length > 0) {
        const { data: listings } = await supabase
          .from('listings')
          .select('id, title, image_urls')
          .in('id', listingIds)
        const list = Array.isArray(listings) ? listings : []
        for (const l of list) {
          const id = l?.id ?? ''
          if (id) listingsMap[id] = { title: l.title, image_urls: l.image_urls ?? [] }
        }
      }
    }

    const transactions = invoiceList.map((inv) => {
      const invId = inv?.id ?? ''
      const listingId = inv?.listing_id ?? ''
      const listing = listingsMap[listingId] ?? {}
      const imageUrls = Array.isArray(listing.image_urls) ? listing.image_urls : []
      const thumbnailUrl = imageUrls.length > 0 ? imageUrls[0] : null

      const dispute = disputesMap[invId] as Record<string, unknown> | undefined
      const logisticsRow = logisticsMap[invId] as Record<string, unknown> | undefined
      const settlement = settlementsMap[invId] as Record<string, unknown> | undefined

      let txStatus = mapInvoiceStatus(String(inv?.status ?? 'PENDING'))
      if (dispute?.status === 'initiated' || dispute?.status === 'under_review') {
        txStatus = 'disputed'
      }

      if (status?.trim() && txStatus !== status) {
        return null
      }

      return {
        id: invId,
        type: 'auction',
        date: inv?.created_at ?? inv?.updated_at ?? '',
        amount: Number(inv?.amount ?? 0),
        currency: String(inv?.currency ?? 'USD'),
        status: txStatus,
        settlementStatus: settlement ? String(settlement.status ?? 'PENDING') : undefined,
        auctionId: inv?.auction_id ?? null,
        assetId: listingId,
        assetName: listing?.title ?? 'Asset',
        thumbnailUrl,
        buyerId: inv?.buyer_id ?? '',
        sellerId: inv?.seller_id ?? '',
        invoice: {
          id: invId,
          pdfUrl: inv?.invoice_pdf_url ?? inv?.receipt_pdf_url ?? null,
          dueDate: inv?.due_date ?? null,
          billedAmount: Number(inv?.amount ?? 0) + Number(inv?.fees ?? 0) + Number(inv?.tax ?? 0),
        },
        dispute: dispute
          ? {
              id: dispute.id,
              status: dispute.status,
              reason: dispute.reason,
              description: dispute.description,
              createdAt: dispute.created_at,
              updatedAt: dispute.updated_at,
              resolvedAt: dispute.resolved_at,
            }
          : null,
        logistics: logisticsRow
          ? {
              id: logisticsRow.id,
              carrier: logisticsRow.carrier ?? null,
              trackingNumber: logisticsRow.tracking_number ?? null,
              status: logisticsRow.status ?? 'pending',
              shippedAt: logisticsRow.shipped_at ?? null,
              estimatedDelivery: logisticsRow.estimated_delivery ?? null,
              milestones: Array.isArray(logisticsRow.milestones) ? logisticsRow.milestones : [],
            }
          : null,
        settlement: settlement
          ? {
              id: settlement.id,
              amount: Number(settlement.amount ?? 0),
              status: settlement.status ?? 'PENDING',
              paidAt: settlement.paid_at ?? null,
              method: settlement.method ?? 'stripe',
            }
          : null,
        createdAt: inv?.created_at ?? '',
        updatedAt: inv?.updated_at ?? '',
      }
    })

    const filtered = transactions.filter((t) => t != null)

    return new Response(
      JSON.stringify({ transactions: filtered }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
