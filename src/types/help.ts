/**
 * Help / About page data types.
 * All arrays guarded with runtime safety patterns.
 */

export interface DocItem {
  id: string
  title: string
  description?: string
  url: string
  type?: 'internal' | 'external'
  downloadName?: string
}

export interface FAQItem {
  id: string
  question: string
  answer: string
  category?: 'seller' | 'buyer' | 'general'
}

export interface OnboardingGuide {
  id: string
  title: string
  steps: string[]
  role: 'seller' | 'buyer'
  downloadUrl?: string
}

export interface SupportTicketPayload {
  name: string
  email: string
  subject: string
  message: string
  attachments?: File[]
}

export interface SupportTicketResponse {
  ticketId: string
  success: boolean
  error?: string
}
