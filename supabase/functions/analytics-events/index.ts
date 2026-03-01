/**
 * Analytics Events - Returns filtered analytics events.
 * GET /analytics/events equivalent via invoke with body params.
 * Requires admin or ops role.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function toDate(d: string | undefined): Date {
  if (!d) return new Date()
  const parsed = new Date(d)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
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

    const body = await req.json().catch(() => ({})) as Record<string, unknown>
    const endDate = toDate(body.endDate as string | undefined)
    const startDate = toDate(body.startDate as string | undefined)
    const start = startDate < endDate ? startDate : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate
    const eventType = typeof body.eventType === 'string' ? body.eventType : undefined

    const startStr = toIsoDate(start)
    const endStr = toIsoDate(end)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    let query = supabase
      .from('analytics_events')
      .select('id, type, payload, timestamp, user_id, auction_id, listing_id, category')
      .gte('timestamp', startStr)
      .lte('timestamp', endStr + 'T23:59:59')
      .order('timestamp', { ascending: false })
      .limit(500)

    if (eventType) {
      query = query.eq('type', eventType)
    }

    const { data, error } = await query

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const events = Array.isArray(data) ? data : []

    return new Response(JSON.stringify({ events }), {
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
