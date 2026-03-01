/**
 * Settings Integrations - GET user integrations.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const DEFAULT_INTEGRATIONS = [
  { type: 'external_enrichment', name: 'External Enrichment', enabled: false },
  { type: 'third_party_checks', name: '3rd-Party Checks', enabled: false },
  { type: 'ai_vision', name: 'AI Vision Services', enabled: false },
]

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

    const { data: rows } = await supabase
      .from('integrations')
      .select('*')
      .eq('user_id', user.id)

    const list = Array.isArray(rows) ? rows : []
    const byType = new Map(list.map((r: Record<string, unknown>) => [String(r.type), r]))

    const integrations = DEFAULT_INTEGRATIONS.map((d) => {
      const r = byType.get(d.type) as Record<string, unknown> | undefined
      return r
        ? {
            id: r.id,
            type: r.type ?? d.type,
            name: r.type ?? d.name,
            enabled: Boolean(r.enabled ?? false),
            config: r.config_json ?? {},
            created_at: r.created_at,
            updated_at: r.updated_at,
          }
        : {
            id: d.type,
            type: d.type,
            name: d.name,
            enabled: d.enabled,
            config: {},
            created_at: null,
            updated_at: null,
          }
    })

    return new Response(JSON.stringify({ integrations }), {
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
