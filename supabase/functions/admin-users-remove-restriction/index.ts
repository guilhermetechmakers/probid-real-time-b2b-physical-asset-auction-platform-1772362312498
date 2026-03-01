/**
 * Admin Users Remove Restriction - Deactivate a user restriction.
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
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : (typeof body?.user_id === 'string' ? body.user_id.trim() : '')
    const restrictionId = typeof body?.restrictionId === 'string' ? body.restrictionId.trim() : (typeof body?.restriction_id === 'string' ? body.restriction_id.trim() : '')

    if (!userId || !restrictionId) {
      return new Response(JSON.stringify({ error: 'User ID and restriction ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { error: updateErr } = await supabase
      .from('user_restrictions')
      .update({ active: false })
      .eq('id', restrictionId)
      .eq('user_id', userId)

    if (updateErr) {
      return new Response(JSON.stringify({ success: false, error: updateErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('audit_logs').insert({
      actor_id: caller.id,
      action: 'user_restriction_removed',
      target_type: 'user',
      target_id: userId,
      user_id: userId,
      metadata: { restriction_id: restrictionId },
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
