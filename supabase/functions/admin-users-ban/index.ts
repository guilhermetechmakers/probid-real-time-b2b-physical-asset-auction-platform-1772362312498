/**
 * Admin Users Ban - Ban a user. Creates user_bans record and audit log.
 * Requires admin or ops role.
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

    const { data: { user: caller } } = await supabaseAuth.auth.getUser()
    if (!caller?.id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const role = (caller.user_metadata?.role as string) ?? 'buyer'
    if (role !== 'admin' && role !== 'ops') {
      return new Response(JSON.stringify({ error: 'Admin or ops role required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const body = await req.json().catch(() => ({}))
    const id = typeof body?.id === 'string' ? body.id.trim() : ''
    const reason = typeof body?.reason === 'string' ? body.reason.trim() : 'Policy violation'
    const endAt = typeof body?.endAt === 'string' ? body.endAt : (typeof body?.end_at === 'string' ? body.end_at : undefined)

    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: ban, error: banErr } = await supabase
      .from('user_bans')
      .insert({
        user_id: id,
        reason,
        end_at: endAt || null,
        active: true,
        created_by: caller.id,
      })
      .select('id')
      .single()

    if (banErr) {
      return new Response(JSON.stringify({ success: false, error: banErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('audit_logs').insert({
      actor_id: caller.id,
      action: 'user_banned',
      target_type: 'user',
      target_id: id,
      user_id: id,
      metadata: { reason, end_at: endAt, ban_id: ban?.id },
      immutable: true,
    })

    return new Response(JSON.stringify({ success: true }), {
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
