/**
 * Admin Users - List users for User Management admin page.
 * Aggregates from auth.users, user_profiles, buyers, sellers, users_roles, subscriptions, user_bans, user_restrictions.
 * Requires admin or ops role.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function ensureAdmin(supabaseAuth: ReturnType<typeof createClient>) {
  return async () => {
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user?.id) throw new Error('Unauthorized')
    const role = (user.user_metadata?.role as string) ?? 'buyer'
    if (role !== 'admin' && role !== 'ops') throw new Error('Admin or ops role required')
    return user.id
  }
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

    await ensureAdmin(supabaseAuth)()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const body = await req.json().catch(() => ({}))
    const search = typeof body?.search === 'string' ? body.search.trim().toLowerCase() : undefined
    const roleFilter = typeof body?.role === 'string' ? body.role.trim() : undefined
    const kycFilter = typeof body?.kyc === 'string' ? body.kyc.trim() : undefined
    const subscriptionFilter = typeof body?.subscription === 'string' ? body.subscription.trim() : undefined
    const page = Math.max(0, Number(body?.page ?? 0))
    const limit = Math.min(100, Math.max(10, Number(body?.limit ?? 50)))

    const users: Record<string, unknown>[] = []

    const { data: buyerRows } = await supabase
      .from('buyers')
      .select('id, user_id, kyc_status, verification_status, admin_approved, created_at, updated_at')
      .order('created_at', { ascending: false })
      .limit(500)

    const { data: sellerRows } = await supabase
      .from('sellers')
      .select('id, name, email, created_at, updated_at')
      .limit(500)

    const { data: profileRows } = await supabase
      .from('user_profiles')
      .select('user_id, name, email')
      .limit(1000)

    const { data: roleRows } = await supabase
      .from('users_roles')
      .select('user_id, role_id')

    const profilesByUser = new Map<string, { name?: string; email?: string }>()
    for (const p of profileRows ?? []) {
      const uid = String((p as Record<string, unknown>).user_id ?? '')
      if (uid) profilesByUser.set(uid, {
        name: (p as Record<string, unknown>).name as string | undefined,
        email: (p as Record<string, unknown>).email as string | undefined,
      })
    }

    const rolesByUser = new Map<string, string>()
    for (const r of roleRows ?? []) {
      const uid = String((r as Record<string, unknown>).user_id ?? '')
      const rid = String((r as Record<string, unknown>).role_id ?? '')
      if (uid && rid) rolesByUser.set(uid, rid)
    }

    const seen = new Set<string>()

    for (const b of buyerRows ?? []) {
      const row = b as Record<string, unknown>
      const uid = String(row.user_id ?? '')
      if (!uid || seen.has(uid)) continue
      seen.add(uid)
      const profile = profilesByUser.get(uid)
      const email = (profile?.email ?? '').toLowerCase() || ''
      const name = profile?.name ?? ''
      if (search && !email.includes(search) && !name.toLowerCase().includes(search) && !uid.includes(search)) continue
      if (roleFilter && roleFilter !== 'buyer') continue
      if (kycFilter && row.kyc_status !== kycFilter) continue

      const { data: subRows } = await supabase
        .from('subscriptions')
        .select('status, plan_id')
        .eq('buyer_id', row.id)
        .limit(1)

      const sub = (subRows ?? [])[0] as Record<string, unknown> | undefined
      const { data: banRows } = await supabase
        .from('user_bans')
        .select('id')
        .eq('user_id', uid)
        .eq('active', true)
        .limit(1)

      const { data: restRows } = await supabase
        .from('user_restrictions')
        .select('id')
        .eq('user_id', uid)
        .eq('active', true)
        .limit(1)

      const subStatus = subscriptionFilter ? (sub?.status ?? 'none') : undefined
      if (subscriptionFilter && subStatus !== subscriptionFilter) continue

      users.push({
        id: uid,
        user_id: uid,
        email: profile?.email ?? '',
        name: profile?.name ?? '',
        role: 'buyer',
        status: 'active',
        kyc_status: row.kyc_status ?? 'pending',
        subscription_plan: sub?.plan_id,
        subscription_status: sub?.status ?? 'none',
        is_banned: (banRows ?? []).length > 0,
        has_restrictions: (restRows ?? []).length > 0,
        last_active: row.updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        buyer_id: row.id,
      })
    }

    for (const s of sellerRows ?? []) {
      const row = s as Record<string, unknown>
      const uid = String(row.id ?? '')
      if (!uid || seen.has(uid)) continue
      seen.add(uid)
      const profile = profilesByUser.get(uid)
      const email = (profile?.email ?? (row.email as string) ?? '').toLowerCase()
      const name = (profile?.name ?? (row.name as string) ?? '').toLowerCase()
      if (search && !email.includes(search) && !name.includes(search) && !uid.includes(search)) continue
      if (roleFilter && roleFilter !== 'seller') continue

      const { data: banRows } = await supabase
        .from('user_bans')
        .select('id')
        .eq('user_id', uid)
        .eq('active', true)
        .limit(1)

      const { data: restRows } = await supabase
        .from('user_restrictions')
        .select('id')
        .eq('user_id', uid)
        .eq('active', true)
        .limit(1)

      users.push({
        id: uid,
        user_id: uid,
        email: profile?.email ?? row.email ?? '',
        name: profile?.name ?? row.name ?? '',
        role: rolesByUser.get(uid) === 'admin' || rolesByUser.get(uid) === 'ops' ? rolesByUser.get(uid) : 'seller',
        status: 'active',
        kyc_status: 'none',
        subscription_plan: undefined,
        subscription_status: 'none',
        is_banned: (banRows ?? []).length > 0,
        has_restrictions: (restRows ?? []).length > 0,
        last_active: row.updated_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        seller_id: row.id,
      })
    }

    for (const [uid, rid] of rolesByUser) {
      if ((rid === 'admin' || rid === 'ops') && !seen.has(uid)) {
        seen.add(uid)
        const profile = profilesByUser.get(uid)
        const email = (profile?.email ?? '').toLowerCase()
        const name = (profile?.name ?? '').toLowerCase()
        if (search && !email.includes(search) && !name.includes(search) && !uid.includes(search)) continue
        if (roleFilter && roleFilter !== rid) continue

        const { data: banRows } = await supabase
          .from('user_bans')
          .select('id')
          .eq('user_id', uid)
          .eq('active', true)
          .limit(1)

        const { data: restRows } = await supabase
          .from('user_restrictions')
          .select('id')
          .eq('user_id', uid)
          .eq('active', true)
          .limit(1)

        users.push({
          id: uid,
          user_id: uid,
          email: profile?.email ?? '',
          name: profile?.name ?? '',
          role: rid,
          status: 'active',
          kyc_status: 'none',
          subscription_plan: undefined,
          subscription_status: 'none',
          is_banned: (banRows ?? []).length > 0,
          has_restrictions: (restRows ?? []).length > 0,
          last_active: undefined,
          created_at: undefined,
          updated_at: undefined,
        })
      }
    }

    const total = users.length
    const paginated = users.slice(page * limit, page * limit + limit)

    return new Response(JSON.stringify({ users: paginated, total }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    const status = msg === 'Unauthorized' ? 401 : msg === 'Admin or ops role required' ? 403 : 500
    return new Response(JSON.stringify({ error: msg }), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
