/**
 * useHelp - Data fetching for Help/About page with null-safe patterns.
 */
import { useQuery } from '@tanstack/react-query'
import { fetchDocs, fetchFaqs, fetchOnboarding } from '@/api/help'

export function useHelpDocs() {
  return useQuery({
    queryKey: ['help', 'docs'],
    queryFn: fetchDocs,
    staleTime: 5 * 60 * 1000,
  })
}

export function useHelpFaqs() {
  return useQuery({
    queryKey: ['help', 'faqs'],
    queryFn: fetchFaqs,
    staleTime: 5 * 60 * 1000,
  })
}

export function useHelpOnboarding() {
  return useQuery({
    queryKey: ['help', 'onboarding'],
    queryFn: fetchOnboarding,
    staleTime: 5 * 60 * 1000,
  })
}
