/**
 * Settings Sessions - GET active sessions.
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
      .from('user_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('last_active', { ascending: false })
      .limit(10)

    const list = Array.isArray(rows) ? rows : []
    const sessions = list.map((r: Record<string, unknown>, i: number) => ({
      id: r.id,
      device: r.device ?? 'Unknown device',
      os: r.os,
      location: r.location,
      last_active: r.last_active,
      ip_address: r.ip_address,
      is_active: r.is_active ?? true,
      is_current: i === 0,
    }))

    if (sessions.length === 0) {
      sessions.push({
        id: 'current',
        device: 'Current session',
        os: null,
        location: null,
        last_active: new Date().toISOString(),
        ip_address: null,
        is_active: true,
        is_current: true,
      })
    }

    return new Response(JSON.stringify({ sessions }), {
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
