/**
 * Analytics Log - Logs single or bulk analytics events.
 * POST /analytics/log - accepts { type, payload, timestamp, userId, auctionId } or { bulk: true, events: [...] }
 * Inserts via service role; caller must be authenticated (any role for now - events are app-generated).
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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const body = await req.json().catch(() => ({})) as Record<string, unknown>

    if (body.bulk === true && Array.isArray(body.events)) {
      const events = body.events as Record<string, unknown>[]
      const rows = events
        .filter((e) => e && typeof e.type === 'string')
        .map((e) => ({
          type: String(e.type),
          payload: e.payload != null && typeof e.payload === 'object' ? e.payload : {},
          timestamp: typeof e.timestamp === 'string' ? e.timestamp : new Date().toISOString(),
          user_id: typeof e.userId === 'string' ? e.userId : (e.user_id as string | undefined),
          auction_id: typeof e.auctionId === 'string' ? e.auctionId : (e.auction_id as string | undefined),
          listing_id: typeof e.listingId === 'string' ? e.listingId : (e.listing_id as string | undefined),
          category: typeof e.category === 'string' ? e.category : (e.category as string | undefined),
        }))

      if (rows.length === 0) {
        return new Response(JSON.stringify({ success: false, error: 'No valid events' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { data: inserted, error } = await supabase.from('analytics_events').insert(rows).select('id')

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(
        JSON.stringify({ success: true, count: Array.isArray(inserted) ? inserted.length : rows.length }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const type = body.type
    if (typeof type !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'type is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const row = {
      type: String(type),
      payload: body.payload != null && typeof body.payload === 'object' ? body.payload : {},
      timestamp: typeof body.timestamp === 'string' ? body.timestamp : new Date().toISOString(),
      user_id: typeof body.userId === 'string' ? body.userId : (body.user_id as string | undefined),
      auction_id: typeof body.auctionId === 'string' ? body.auctionId : (body.auction_id as string | undefined),
      listing_id: typeof body.listingId === 'string' ? body.listingId : (body.listing_id as string | undefined),
      category: typeof body.category === 'string' ? body.category : (body.category as string | undefined),
    }

    const { data: inserted, error } = await supabase.from('analytics_events').insert(row).select('id').single()

    if (error) {
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const id = (inserted as { id?: string })?.id ?? ''

    return new Response(JSON.stringify({ success: true, id }), {
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
