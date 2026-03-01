/**
 * Help Tickets - POST support ticket submission.
 * Accepts name, email, subject, message. Optional attachment URLs if client uploads to Storage first.
 * Public endpoint; rate limiting recommended in production.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function validatePayload(body: unknown): { name: string; email: string; subject: string; message: string; attachmentUrls?: string[] } | null {
  if (!body || typeof body !== 'object') return null
  const b = body as Record<string, unknown>
  const name = typeof b.name === 'string' ? b.name.trim() : ''
  const email = typeof b.email === 'string' ? b.email.trim() : ''
  const subject = typeof b.subject === 'string' ? b.subject.trim() : ''
  const message = typeof b.message === 'string' ? b.message.trim() : ''
  if (!name || !email || !subject || !message) return null
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return null
  const attachmentUrls = Array.isArray(b.attachmentUrls) ? b.attachmentUrls.filter((u): u is string => typeof u === 'string') : undefined
  return { name, email, subject, message, attachmentUrls }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json().catch(() => null)
    const payload = validatePayload(body)
    if (!payload) {
      return new Response(JSON.stringify({ success: false, error: 'Invalid payload: name, email, subject, and message are required.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? supabaseAnonKey

    const authHeader = req.headers.get('Authorization')
    let userId: string | null = null
    if (authHeader) {
      const authClient = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } },
      })
      const { data: { user } } = await authClient.auth.getUser()
      userId = user?.id ?? null
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    const ticketId = crypto.randomUUID()
    const { error } = await supabase.from('help_tickets').insert({
      id: ticketId,
      user_id: userId,
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      attachment_urls: payload.attachmentUrls ?? [],
      status: 'open',
      created_at: new Date().toISOString(),
    })

    if (error) {
      return new Response(JSON.stringify({ success: false, error: 'Unable to save ticket. Please try again.' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ ticketId, success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err instanceof Error ? err.message : 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
