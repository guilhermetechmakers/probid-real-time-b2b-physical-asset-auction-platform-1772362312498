/**
 * Settings API Keys Regenerate - Regenerate key (returns new key once).
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { encode as b64Encode } from 'https://deno.land/std@0.208.0/encoding/base64.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function generateKey(): string {
  const arr = new Uint8Array(32)
  crypto.getRandomValues(arr)
  return 'pk_live_' + b64Encode(arr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function hashKey(key: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(key)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return b64Encode(new Uint8Array(hash))
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
    const id = body.id ?? body.keyId
    if (!id) {
      return new Response(JSON.stringify({ error: 'id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: existing } = await supabase
      .from('api_keys')
      .select('id, name, scopes')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return new Response(JSON.stringify({ error: 'Key not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const key = generateKey()
    const keyHash = await hashKey(key)

    const { error } = await supabase
      .from('api_keys')
      .update({ key_hash: keyHash, last_used_at: null })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) throw error

    return new Response(
      JSON.stringify({
        id: existing.id,
        name: existing.name,
        key,
        scopes: existing.scopes ?? [],
        createdAt: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
