/**
 * Admin Users Restrict - Add a restriction to a user.
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
    const type = typeof body?.type === 'string' ? body.type : 'custom'
    const reasons = Array.isArray(body?.reasons) ? body.reasons.map(String) : (typeof body?.reasons === 'string' ? [body.reasons] : [])
    const expiresAt = typeof body?.expiresAt === 'string' ? body.expiresAt : (typeof body?.expires_at === 'string' ? body.expires_at : undefined)

    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const validTypes = ['bidding', 'listing', 'withdrawal', 'custom']
    const restrictionType = validTypes.includes(type) ? type : 'custom'

    const { error: insertErr } = await supabase
      .from('user_restrictions')
      .insert({
        user_id: id,
        type: restrictionType,
        reasons: reasons.length > 0 ? reasons : ['Admin imposed'],
        expires_at: expiresAt || null,
        active: true,
        created_by: caller.id,
      })

    if (insertErr) {
      return new Response(JSON.stringify({ success: false, error: insertErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('audit_logs').insert({
      actor_id: caller.id,
      action: 'user_restricted',
      target_type: 'user',
      target_id: id,
      user_id: id,
      metadata: { type: restrictionType, reasons, expires_at: expiresAt },
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
