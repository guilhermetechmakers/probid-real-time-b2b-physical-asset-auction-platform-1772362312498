/**
 * Settings Integrations Update - PATCH integration.
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

    const body = await req.json().catch(() => ({}))
    const id = body.id ?? body.integrationId
    if (!id || typeof id !== 'string') {
      return new Response(JSON.stringify({ success: false, error: 'id required' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const updates: Record<string, unknown> = {}
    if (typeof body.enabled === 'boolean') updates.enabled = body.enabled
    if (body.config != null && typeof body.config === 'object') updates.config_json = body.config

    const { data: existing } = await supabase
      .from('integrations')
      .select('id, user_id')
      .eq('id', id)
      .single()

    if (!existing || existing.user_id !== user.id) {
      if (body.enabled !== undefined && body.type) {
        const { error: insErr } = await supabase.from('integrations').insert({
          user_id: user.id,
          type: body.type,
          enabled: Boolean(body.enabled),
          config_json: body.config ?? {},
        })
        if (insErr) throw insErr
      }
    } else if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('integrations').update(updates).eq('id', id).eq('user_id', user.id)
      if (error) throw error
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
