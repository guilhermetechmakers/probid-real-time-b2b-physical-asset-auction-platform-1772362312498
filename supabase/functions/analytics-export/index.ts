/**
 * Analytics Export - Generates CSV/Excel export from analytics data.
 * POST /analytics/export - accepts { format, startDate, endDate, filters }
 * Returns { url, fileName } - for now returns a placeholder; full implementation
 * would generate file, upload to storage, return signed URL.
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

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>
    const format = body.format === 'xlsx' ? 'xlsx' : 'csv'
    const endDate = toDate(body.endDate as string | undefined)
    const startDate = toDate(body.startDate as string | undefined)
    const start = startDate < endDate ? startDate : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000)
    const end = endDate

    const startStr = toIsoDate(start)
    const endStr = toIsoDate(end)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { data: events } = await supabase
      .from('analytics_events')
      .select('id, type, payload, timestamp, user_id, auction_id, listing_id, category')
      .gte('timestamp', startStr)
      .lte('timestamp', endStr + 'T23:59:59')
      .order('timestamp', { ascending: false })
      .limit(5000)

    const rows = Array.isArray(events) ? events : []

    const ext = format === 'xlsx' ? 'xlsx' : 'csv'
    const fileName = `probid-analytics-${startStr}-${endStr}.${ext}`

    {
      const headers = ['id', 'type', 'timestamp', 'user_id', 'auction_id', 'listing_id', 'category']
      const lines = [headers.join(',')]
      for (const r of rows) {
        const vals = headers.map((h) => {
          const v = (r as Record<string, unknown>)[h === 'user_id' ? 'user_id' : h === 'auction_id' ? 'auction_id' : h === 'listing_id' ? 'listing_id' : h]
          const s = String(v ?? '')
          return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
        })
        lines.push(vals.join(','))
      }
      const csv = lines.join('\n')

      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
      const bucket = 'exports'
      try {
        const { data: upload } = await supabase.storage
          .from(bucket)
          .upload(fileName, new Blob([csv]), { contentType: 'text/csv', upsert: true })
        if (upload?.path) {
          const { data: urlData } = supabase.storage.from(bucket).createSignedUrl(upload.path, 3600)
          return new Response(
            JSON.stringify({ url: urlData?.signedUrl ?? '', fileName }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      } catch {
        // Storage may not be configured; return data URL or placeholder
      }

      const dataUrl = `data:text/csv;base64,${btoa(csv)}`
      return new Response(
        JSON.stringify({ url: dataUrl, fileName: format === 'xlsx' ? fileName.replace('.xlsx', '.csv') : fileName }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
