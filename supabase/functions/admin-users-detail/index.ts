/**
 * Admin Users Detail - Get single user with KYC docs, bans, restrictions, activity.
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

    if (!id) {
      return new Response(JSON.stringify({ error: 'User ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const [profileRes, buyerRes, sellerRes, roleRes, banRes, restRes, auditRes] = await Promise.all([
      supabase.from('user_profiles').select('*').eq('user_id', id).single(),
      supabase.from('buyers').select('*').eq('user_id', id).single(),
      supabase.from('sellers').select('*').eq('id', id).single(),
      supabase.from('users_roles').select('role_id').eq('user_id', id),
      supabase.from('user_bans').select('*').eq('user_id', id).eq('active', true),
      supabase.from('user_restrictions').select('*').eq('user_id', id).eq('active', true),
      supabase.from('audit_logs').select('*').eq('target_type', 'user').eq('target_id', id).order('timestamp', { ascending: false }).limit(20),
    ])

    const buyerId = (buyerRes.data as Record<string, unknown> | null)?.id as string | undefined
    const [kycRes, subRes] = await Promise.all([
      buyerId ? supabase.from('kyc_records').select('*').eq('buyer_id', buyerId).limit(5) : { data: [] },
      buyerId ? supabase.from('subscriptions').select('*').eq('buyer_id', buyerId).limit(1) : { data: [] },
    ])

    const profile = profileRes.data as Record<string, unknown> | null
    const buyer = buyerRes.data as Record<string, unknown> | null
    const seller = sellerRes.data as Record<string, unknown> | null
    const roles = (roleRes.data ?? []) as Record<string, unknown>[]
    const bans = (banRes.data ?? []) as Record<string, unknown>[]
    const restrictions = (restRes.data ?? []) as Record<string, unknown>[]
    const kycRecords = (kycRes.data ?? []) as Record<string, unknown>[]
    const subs = (subRes.data ?? []) as Record<string, unknown>[]
    const auditRows = (auditRes.data ?? []) as Record<string, unknown>[]

    const primaryRole = roles[0]?.role_id ?? (buyer ? 'buyer' : seller ? 'seller' : 'buyer')
    const sub = subs[0]

    const user = {
      id,
      user_id: id,
      email: profile?.email ?? (buyer?.email as string) ?? (seller?.email as string) ?? '',
      name: profile?.name ?? seller?.name ?? '',
      role: primaryRole,
      status: 'active',
      kyc_status: buyer?.kyc_status ?? 'pending',
      subscription_plan: sub?.plan_id,
      subscription_status: sub?.status ?? 'none',
      is_banned: bans.length > 0,
      has_restrictions: restrictions.length > 0,
      last_active: profile?.updated_at ?? buyer?.updated_at ?? seller?.updated_at,
      created_at: buyer?.created_at ?? seller?.created_at ?? profile?.created_at,
      updated_at: profile?.updated_at ?? buyer?.updated_at ?? seller?.updated_at,
      buyer_id: buyer?.id,
      seller_id: seller?.id,
      kyc_documents: kycRecords.map((k) => ({
        type: k.evidence ? 'document' : 'id',
        url: typeof k.evidence === 'object' && k.evidence && 'url' in k.evidence ? (k.evidence as Record<string, unknown>).url : '',
        status: k.status ?? k.admin_review_status,
      })),
      bans: bans.map((b) => ({
        id: b.id,
        reason: b.reason,
        start_at: b.start_at,
        end_at: b.end_at,
        active: b.active,
      })),
      restrictions: restrictions.map((r) => ({
        id: r.id,
        type: r.type,
        reasons: r.reasons ?? [],
        expires_at: r.expires_at,
        active: r.active,
      })),
      recent_activity: auditRows.map((a) => ({
        id: a.id,
        action: a.action,
        entity_type: a.target_type,
        entity_id: a.target_id,
        actor_id: a.actor_id,
        metadata: a.metadata,
        timestamp: a.timestamp,
        immutable: a.immutable ?? true,
      })),
      financial_holds: [],
    }

    return new Response(JSON.stringify({ user }), {
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
