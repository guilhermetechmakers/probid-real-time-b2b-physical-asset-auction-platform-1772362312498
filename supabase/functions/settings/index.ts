/**
 * Settings Edge Function - Profile, notifications, subscription, KYC, integrations, API keys, sessions.
 * Routes by action field; integrates with user_profiles, notification_preferences, integrations, api_keys, user_sessions.
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function errorResponse(message: string, status = 400) {
  return jsonResponse({ error: message } as { error: string }, status)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return errorResponse('Unauthorized', 401)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) {
      return errorResponse('Not authenticated', 401)
    }

    const body = await req.json().catch(() => ({}))
    const action = body?.action as string

    if (!action) {
      return errorResponse('Missing action')
    }

    switch (action) {
      case 'getProfile': {
        const { data: row } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()
        const profile = row ?? { user_id: user.id, email: user.email }
        return jsonResponse({ data: { profile: profile ?? {} } })
      }

      case 'patchProfile': {
        const payload = body?.payload ?? {}
        const { data: existing } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single()

        const update = {
          name: payload.name,
          company: payload.company,
          contact_phone: payload.contactPhone ?? payload.contact_phone,
          tax_vat: payload.taxVat ?? payload.tax_vat,
          payout_account_id: payload.payoutAccountId ?? payload.payout_account_id,
          updated_at: new Date().toISOString(),
        }
        Object.keys(update).forEach((k) => {
          if ((update as Record<string, unknown>)[k] === undefined) delete (update as Record<string, unknown>)[k]
        })

        if (existing?.id) {
          const { data: updated } = await supabase
            .from('user_profiles')
            .update(update)
            .eq('user_id', user.id)
            .select()
            .single()
          return jsonResponse({ data: { profile: updated ?? {} } })
        }
        const { data: inserted } = await supabase
          .from('user_profiles')
          .insert({ user_id: user.id, ...update })
          .select()
          .single()
        return jsonResponse({ data: { profile: inserted ?? {} } })
      }

      case 'getNotifications': {
        const { data: row } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
        const prefs = row ?? {}
        return jsonResponse({
          data: {
            preferences: {
              emailEnabled: prefs.email_enabled ?? true,
              smsEnabled: prefs.sms_enabled ?? false,
              pushEnabled: prefs.push_enabled ?? false,
              outbid: prefs.outbid ?? true,
              auctionStart: prefs.auction_start ?? true,
              inspectionScheduling: prefs.inspection_scheduling ?? true,
            },
          },
        })
      }

      case 'patchNotifications': {
        const payload = body?.payload ?? {}
        const { data: existing } = await supabase
          .from('notification_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single()

        const update = {
          email_enabled: payload.emailEnabled ?? payload.email_enabled,
          sms_enabled: payload.smsEnabled ?? payload.sms_enabled,
          push_enabled: payload.pushEnabled ?? payload.push_enabled,
          outbid: payload.outbid,
          auction_start: payload.auctionStart ?? payload.auction_start,
          inspection_scheduling: payload.inspectionScheduling ?? payload.inspection_scheduling,
          updated_at: new Date().toISOString(),
        }
        Object.keys(update).forEach((k) => {
          if ((update as Record<string, unknown>)[k] === undefined) delete (update as Record<string, unknown>)[k]
        })

        if (existing?.id) {
          await supabase
            .from('notification_preferences')
            .update(update)
            .eq('user_id', user.id)
        } else {
          await supabase
            .from('notification_preferences')
            .insert({ user_id: user.id, ...update })
        }
        const { data: row } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single()
        const prefs = row ?? {}
        return jsonResponse({
          data: {
            preferences: {
              emailEnabled: prefs.email_enabled ?? true,
              smsEnabled: prefs.sms_enabled ?? false,
              pushEnabled: prefs.push_enabled ?? false,
              outbid: prefs.outbid ?? true,
              auctionStart: prefs.auction_start ?? true,
              inspectionScheduling: prefs.inspection_scheduling ?? true,
            },
          },
        })
      }

      case 'getSubscription': {
        const { data: buyer } = await supabase
          .from('buyers')
          .select('id, subscription_id')
          .eq('user_id', user.id)
          .single()
        if (!buyer?.subscription_id) {
          return jsonResponse({ data: { subscription: null } })
        }
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('id', buyer.subscription_id)
          .single()
        if (!sub) return jsonResponse({ data: { subscription: null } })
        return jsonResponse({
          data: {
            subscription: {
              id: sub.id,
              planId: sub.plan_id,
              planName: sub.plan_name ?? 'Basic',
              status: sub.status,
              currentPeriodStart: sub.current_period_start,
              currentPeriodEnd: sub.current_period_end,
              nextBillingDate: sub.next_billing_date,
              nextBillingAmount: sub.next_billing_amount,
              currency: sub.currency ?? 'USD',
            },
          },
        })
      }

      case 'getInvoices': {
        const { data: rows } = await supabase
          .from('subscription_invoices')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50)
        const list = Array.isArray(rows) ? rows : []
        return jsonResponse({ data: { invoices: list } })
      }

      case 'getKyc': {
        const { data: buyer } = await supabase
          .from('buyers')
          .select('id')
          .eq('user_id', user.id)
          .single()
        if (!buyer?.id) {
          return jsonResponse({ data: { kyc: { id: '', status: 'pending', requiredActions: ['Complete your profile to submit KYC'] } } })
        }
        const { data: kyc } = await supabase
          .from('kyc_records')
          .select('*')
          .eq('buyer_id', buyer.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        const k = kyc ?? {}
        const statusMap: Record<string, string> = {
          pending: 'pending',
          submitted: 'in_review',
          approved: 'verified',
          rejected: 'rejected',
        }
        return jsonResponse({
          data: {
            kyc: {
              id: k.id ?? '',
              status: statusMap[k.status as string] ?? 'pending',
              submittedAt: k.submitted_at,
              reviewedAt: k.reviewed_at,
              reviewerId: k.reviewer_id,
              notes: k.notes,
              requiredActions: k.status === 'rejected' ? ['Please resubmit your documents'] : k.status === 'pending' ? ['Submit documents for verification'] : undefined,
            },
          },
        })
      }

      case 'getIntegrations': {
        const { data: rows } = await supabase
          .from('integrations')
          .select('*')
          .eq('user_id', user.id)
        const list = Array.isArray(rows) ? rows : []
        const types = ['enrichment', 'identity_check', 'ai_vision']
        for (const t of types) {
          if (!list.some((r: Record<string, unknown>) => r.type === t)) {
            const { data: inserted } = await supabase
              .from('integrations')
              .insert({ user_id: user.id, type: t, enabled: false })
              .select()
              .single()
            if (inserted) list.push(inserted)
          }
        }
        return jsonResponse({ data: { integrations: list.map((r: Record<string, unknown>) => ({ ...r, config: r.config_json ?? r.config })) } })
      }

      case 'patchIntegration': {
        const id = body?.id as string
        const payload = body?.payload ?? {}
        if (!id) return errorResponse('Missing integration id')
        const update: Record<string, unknown> = {
          enabled: payload.enabled,
          config_json: payload.config ?? payload.config_json,
          updated_at: new Date().toISOString(),
        }
        Object.keys(update).forEach((k) => {
          if (update[k] === undefined) delete update[k]
        })
        const { data: updated } = await supabase
          .from('integrations')
          .update(update)
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()
        return jsonResponse({ data: { integration: updated ?? {} } })
      }

      case 'getApiKeys': {
        const { data: rows } = await supabase
          .from('api_keys')
          .select('id, name, scopes, created_at, last_used_at, status')
          .eq('user_id', user.id)
          .eq('status', 'active')
        const list = Array.isArray(rows) ? rows : []
        return jsonResponse({ data: { apiKeys: list } })
      }

      case 'createApiKey': {
        const name = (body?.name ?? '') as string
        const scopes = Array.isArray(body?.scopes) ? body.scopes : (typeof body?.scopes === 'string' ? body.scopes.split(',') : [])
        if (!name?.trim()) return errorResponse('Missing key name')
        const rawKey = `pk_${crypto.randomUUID().replace(/-/g, '')}_${Date.now().toString(36)}`
        const keyHash = btoa(rawKey).slice(0, 32)
        const { data: inserted } = await supabase
          .from('api_keys')
          .insert({ user_id: user.id, name: name.trim(), key_hash: keyHash, scopes: scopes ?? [] })
          .select()
          .single()
        return jsonResponse({
          data: {
            apiKey: inserted ? { ...inserted, keyPreview: undefined } : {},
            rawKey: rawKey,
          },
        })
      }

      case 'regenerateApiKey': {
        const id = body?.id as string
        if (!id) return errorResponse('Missing key id')
        const rawKey = `pk_${crypto.randomUUID().replace(/-/g, '')}_${Date.now().toString(36)}`
        const keyHash = btoa(rawKey).slice(0, 32)
        const { data: updated } = await supabase
          .from('api_keys')
          .update({ key_hash: keyHash, last_used_at: null })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single()
        return jsonResponse({
          data: {
            apiKey: updated ?? {},
            rawKey: rawKey,
          },
        })
      }

      case 'revokeApiKey': {
        const id = body?.id as string
        if (!id) return errorResponse('Missing key id')
        await supabase
          .from('api_keys')
          .update({ status: 'revoked' })
          .eq('id', id)
          .eq('user_id', user.id)
        return jsonResponse({ data: { success: true } })
      }

      case 'getSessions': {
        const { data: rows } = await supabase
          .from('user_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('last_active', { ascending: false })
        const list = Array.isArray(rows) ? rows : []
        return jsonResponse({
          data: {
            sessions: list.map((s) => ({
              id: s.id,
              device: s.device ?? 'Unknown',
              os: s.os,
              location: s.location,
              lastActive: s.last_active,
              ip: s.ip_address,
              isCurrent: false,
            })),
          },
        })
      }

      case 'revokeSession': {
        const id = body?.id as string
        if (!id) return errorResponse('Missing session id')
        await supabase
          .from('user_sessions')
          .update({ is_active: false })
          .eq('id', id)
          .eq('user_id', user.id)
        return jsonResponse({ data: { success: true } })
      }

      case 'changePassword': {
        const currentPassword = body?.currentPassword as string
        const newPassword = body?.newPassword as string
        if (!currentPassword || !newPassword) return errorResponse('Missing password fields')
        const { error } = await supabase.auth.updateUser({ password: newPassword })
        if (error) return jsonResponse({ data: { success: false, error: error.message } })
        return jsonResponse({ data: { success: true } })
      }

      default:
        return errorResponse(`Unknown action: ${action}`)
    }
  } catch (err) {
    return jsonResponse(
      { error: err instanceof Error ? err.message : 'Internal error' },
      500
    )
  }
})
