/**
 * Settings Profile - GET user profile.
 * Returns user_profiles + auth.users email.
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

    const { data: row } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    const profile = row
      ? {
          id: row.id,
          user_id: user.id,
          email: row.email ?? user.email ?? '',
          name: row.name ?? user.user_metadata?.full_name ?? user.user_metadata?.name,
          company: row.company,
          contact_phone: row.contact_phone,
          tax_vat: row.tax_vat,
          payout_account_id: row.payout_account_id,
          avatar_url: row.avatar_url ?? user.user_metadata?.avatar_url,
          created_at: row.created_at,
          updated_at: row.updated_at,
        }
      : {
          id: user.id,
          user_id: user.id,
          email: user.email ?? '',
          name: user.user_metadata?.full_name ?? user.user_metadata?.name,
          company: null,
          contact_phone: null,
          tax_vat: null,
          payout_account_id: null,
          avatar_url: user.user_metadata?.avatar_url,
          created_at: null,
          updated_at: null,
        }

    return new Response(JSON.stringify({ profile }), {
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
