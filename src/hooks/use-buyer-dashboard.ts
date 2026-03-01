/**
 * useBuyerDashboard - Fetches and subscribes to buyer dashboard data.
 * Integrates Supabase Realtime for live bid updates.
 */

import { useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { fetchBuyerDashboard } from '@/api/buyer'

const QUERY_KEY = ['buyer', 'dashboard']

export function useBuyerDashboard() {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchBuyerDashboard,
    staleTime: 30_000,
  })

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY })
  }, [queryClient])

  useEffect(() => {
    const channel = supabase
      .channel('buyer-dashboard-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'auctions',
          filter: 'status=eq.live',
        },
        () => {
          invalidate()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
        },
        () => {
          invalidate()
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Reconnect handled by Supabase client
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [invalidate])

  return {
    data: query.data ?? null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    invalidate,
  }
}
