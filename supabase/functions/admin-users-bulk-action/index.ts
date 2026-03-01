/**
 * Admin Users Bulk Action - Perform bulk actions (ban, resend KYC, change plan, etc.).
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
    const userIds = Array.isArray(body?.userIds) ? body.userIds.filter((u: unknown) => typeof u === 'string').map((u: string) => u.trim()) : []
    const action = typeof body?.action === 'string' ? body.action : ''
    const payload = body?.payload != null && typeof body.payload === 'object' ? body.payload : {}

    if (userIds.length === 0 || !action) {
      return new Response(JSON.stringify({ success: false, error: 'User IDs and action required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const results: { userId: string; success: boolean; error?: string }[] = []

    for (const uid of userIds) {
      try {
        if (action === 'ban') {
          const reason = (payload?.reason as string) ?? 'Bulk ban'
          const { error } = await supabase.from('user_bans').insert({
            user_id: uid,
            reason,
            active: true,
            created_by: caller.id,
          })
          if (error) throw new Error(error.message)
          await supabase.from('audit_logs').insert({
            actor_id: caller.id,
            action: 'user_banned',
            target_type: 'user',
            target_id: uid,
            user_id: uid,
            metadata: { reason, bulk: true },
            immutable: true,
          })
        } else if (action === 'resend_kyc') {
          const { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', uid).single()
          const buyerId = (buyer as Record<string, unknown> | null)?.id
          if (buyerId) {
            await supabase.from('kyc_records').update({ admin_review_status: 'pending', status: 'pending' }).eq('buyer_id', buyerId)
          }
          await supabase.from('audit_logs').insert({
            actor_id: caller.id,
            action: 'kyc_resend_requested',
            target_type: 'user',
            target_id: uid,
            user_id: uid,
            metadata: { bulk: true },
            immutable: true,
          })
        } else if (action === 'change_plan') {
          const planId = (payload?.planId ?? payload?.plan_id) as string
          if (!planId) {
            results.push({ userId: uid, success: false, error: 'Plan ID required' })
            continue
          }
          const { data: buyer } = await supabase.from('buyers').select('id').eq('user_id', uid).single()
          const buyerId = (buyer as Record<string, unknown> | null)?.id
          if (buyerId) {
            const { data: existing } = await supabase.from('subscriptions').select('id').eq('buyer_id', buyerId).single()
            if (existing) {
              await supabase.from('subscriptions').update({ plan_id: planId, status: 'active' }).eq('buyer_id', buyerId)
            } else {
              await supabase.from('subscriptions').insert({ buyer_id: buyerId, plan_id: planId, status: 'active' })
            }
          }
          await supabase.from('audit_logs').insert({
            actor_id: caller.id,
            action: 'subscription_changed',
            target_type: 'user',
            target_id: uid,
            user_id: uid,
            metadata: { plan_id: planId, bulk: true },
            immutable: true,
          })
        }
        results.push({ userId: uid, success: true })
      } catch (e) {
        results.push({ userId: uid, success: false, error: e instanceof Error ? e.message : 'Unknown error' })
      }
    }

    const success = results.every((r) => r.success)

    return new Response(JSON.stringify({ success, results }), {
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
