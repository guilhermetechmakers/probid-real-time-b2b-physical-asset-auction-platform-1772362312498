/**
 * Help API - Docs, FAQs, onboarding guides, support tickets.
 * Uses Supabase Edge Functions when VITE_API_URL is empty.
 * All responses validated; array data guarded per runtime safety rules.
 */
import { api } from '@/lib/api'
import { supabase } from '@/lib/supabase'
import type { DocItem, FAQItem, OnboardingGuide, SupportTicketPayload, SupportTicketResponse } from '@/types/help'

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const useSupabaseFunctions = !API_BASE

/** Static fallback docs when API returns empty */
const STATIC_DOCS: DocItem[] = [
  { id: '1', title: 'Intake Guide', description: 'How to submit assets for auction with photos and metadata.', url: '/how-it-works', type: 'internal' },
  { id: '2', title: 'Photo Angle Checklist', description: 'Required photo angles for asset listings.', url: '#', type: 'external' },
  { id: '3', title: 'AI QA Explained', description: 'How our AI validates listing quality.', url: '/how-it-works', type: 'internal' },
  { id: '4', title: 'Auction Rules', description: 'Bidding rules, reserves, and anti-sniping.', url: '/how-it-works', type: 'internal' },
]

/** Static fallback FAQs when API returns empty */
const STATIC_FAQS: FAQItem[] = [
  { id: 's1', question: 'How do I list an asset for auction?', answer: 'Create an account, complete KYC verification, then use the intake flow to add your asset with photos and details. Our AI will validate the listing before it goes live.', category: 'seller' },
  { id: 's2', question: 'What photo angles are required?', answer: 'We require 15–25 photos covering all angles per our checklist: front, rear, sides, interior, engine bay, VIN/identifier, and any damage or wear.', category: 'seller' },
  { id: 's3', question: 'How long does approval take?', answer: 'Most listings are reviewed within 24–48 hours. You\'ll receive an email when your listing is approved or if changes are needed.', category: 'seller' },
  { id: 'b1', question: 'How do I place a bid?', answer: 'Browse the marketplace, select a listing, and click Bid. You can set a proxy bid to automatically increase up to your max. Bids are binding.', category: 'buyer' },
  { id: 'b2', question: 'What is a proxy bid?', answer: 'A proxy bid lets you set a maximum amount. The system will automatically outbid others in increments until your max is reached.', category: 'buyer' },
  { id: 'b3', question: 'When do I pay?', answer: 'After winning, you\'ll complete checkout within the specified window. Deposits may be required. Full payment is due per the auction terms.', category: 'buyer' },
]

/** Static fallback onboarding guides */
const STATIC_ONBOARDING: OnboardingGuide[] = [
  {
    id: 'ob-seller',
    title: 'Seller Onboarding',
    role: 'seller',
    steps: [
      'Create an account and verify your email',
      'Complete KYC verification (identity and business)',
      'Add your first listing with photos and details',
      'Submit for AI QA and ops review',
      'Once approved, set your auction schedule',
      'Manage inspections and close the sale',
    ],
  },
  {
    id: 'ob-buyer',
    title: 'Buyer Onboarding',
    role: 'buyer',
    steps: [
      'Create an account and verify your email',
      'Complete KYC verification if required for your plan',
      'Browse the marketplace and add items to your watchlist',
      'Place bids during live auctions',
      'Complete checkout and payment after winning',
      'Schedule inspections and arrange logistics',
    ],
  },
]

function mapDoc(row: Record<string, unknown>): DocItem {
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    description: typeof row.description === 'string' ? row.description : undefined,
    url: String(row.url ?? '#'),
    type: (row.type === 'internal' || row.type === 'external') ? row.type : 'external',
    downloadName: typeof row.download_name === 'string' ? row.download_name : (row.downloadName as string | undefined),
  }
}

function mapFaq(row: Record<string, unknown>): FAQItem {
  return {
    id: String(row.id ?? ''),
    question: String(row.question ?? ''),
    answer: String(row.answer ?? ''),
    category: (row.category === 'seller' || row.category === 'buyer' || row.category === 'general') ? row.category : undefined,
  }
}

function mapOnboarding(row: Record<string, unknown>): OnboardingGuide {
  const steps = row.steps ?? []
  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    steps: Array.isArray(steps) ? steps.map(String) : [],
    role: (row.role === 'seller' || row.role === 'buyer') ? row.role : 'buyer',
    downloadUrl: typeof row.download_url === 'string' ? row.download_url : (row.downloadUrl as string | undefined),
  }
}

export async function fetchDocs(): Promise<DocItem[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ docs?: Record<string, unknown>[] }>('help-docs', { body: {} })
      if (error) throw error
      const list = data?.docs ?? []
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapDoc)
      }
      return STATIC_DOCS
    }
    const data = await api.get<{ docs?: Record<string, unknown>[] }>('/api/help/docs')
    const list = data?.docs ?? []
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapDoc)
    }
    return STATIC_DOCS
  } catch {
    return STATIC_DOCS
  }
}

export async function fetchFaqs(): Promise<FAQItem[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ faqs?: Record<string, unknown>[] }>('help-faqs', { body: {} })
      if (error) throw error
      const list = data?.faqs ?? []
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapFaq)
      }
      return STATIC_FAQS
    }
    const data = await api.get<{ faqs?: Record<string, unknown>[] }>('/api/help/faqs')
    const list = data?.faqs ?? []
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapFaq)
    }
    return STATIC_FAQS
  } catch {
    return STATIC_FAQS
  }
}

export async function fetchOnboarding(): Promise<OnboardingGuide[]> {
  try {
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<{ guides?: Record<string, unknown>[] }>('help-onboarding', { body: {} })
      if (error) throw error
      const list = data?.guides ?? []
      if (Array.isArray(list) && list.length > 0) {
        return list.map(mapOnboarding)
      }
      return STATIC_ONBOARDING
    }
    const data = await api.get<{ guides?: Record<string, unknown>[] }>('/api/help/onboarding')
    const list = data?.guides ?? []
    if (Array.isArray(list) && list.length > 0) {
      return list.map(mapOnboarding)
    }
    return STATIC_ONBOARDING
  } catch {
    return STATIC_ONBOARDING
  }
}

export async function submitTicket(payload: SupportTicketPayload): Promise<SupportTicketResponse> {
  try {
    const body: Record<string, unknown> = {
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    }
    if (useSupabaseFunctions) {
      const { data, error } = await supabase.functions.invoke<SupportTicketResponse>('help-tickets', {
        body,
      })
      if (error) return { ticketId: '', success: false, error: error.message }
      return {
        ticketId: data?.ticketId ?? '',
        success: data?.success ?? false,
        error: data?.error,
      }
    }
    const data = await api.post<SupportTicketResponse>('/api/help/tickets', body)
    return {
      ticketId: data?.ticketId ?? '',
      success: data?.success ?? false,
      error: data?.error,
    }
  } catch (e) {
    const err = e as { message?: string }
    return { ticketId: '', success: false, error: err?.message ?? 'Failed to submit ticket' }
  }
}
