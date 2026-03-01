/**
 * Settings API Keys - GET enterprise API keys.
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
      .from('api_keys')
      .select('id, name, scopes, created_at, last_used_at, status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const list = Array.isArray(rows) ? rows : []
    const apiKeys = list.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      scopes: Array.isArray(r.scopes) ? r.scopes : [],
      created_at: r.created_at,
      last_used_at: r.last_used_at,
      status: r.status ?? 'active',
      key_prefix: 'pk_live_••••••••',
    }))

    return new Response(JSON.stringify({ apiKeys }), {
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
