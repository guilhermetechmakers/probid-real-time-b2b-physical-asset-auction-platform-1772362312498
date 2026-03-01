/**
 * useDeposits - Data fetching and mutations for Cart / Deposits.
 * All array/object state initialized with proper defaults per runtime safety.
 */
import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  fetchDeposits,
  createDeposit,
  captureDeposit,
  releaseDeposit,
  extendDeposit,
  fetchDepositRequirements,
} from '@/api/deposits'
import type { CreateDepositRequest, CreateDepositResponse } from '@/types/deposits'

const DEPOSITS_QUERY_KEY = ['deposits']
const REQUIREMENTS_QUERY_KEY = ['deposits', 'requirements']

export function useDeposits() {
  return useQuery({
    queryKey: DEPOSITS_QUERY_KEY,
    queryFn: () => fetchDeposits(),
  })
}

export function useDepositRequirements() {
  return useQuery({
    queryKey: REQUIREMENTS_QUERY_KEY,
    queryFn: () => fetchDepositRequirements(),
  })
}

export function useCreateDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateDepositRequest) => createDeposit(payload) as Promise<CreateDepositResponse | null>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPOSITS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY })
    },
  })
}

export function useCaptureDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ depositId, paymentMethodId }: { depositId: string; paymentMethodId: string }) =>
      captureDeposit(depositId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPOSITS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY })
    },
  })
}

export function useReleaseDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (depositId: string) => releaseDeposit(depositId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPOSITS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY })
    },
  })
}

export function useExtendDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ depositId, extendByHours }: { depositId: string; extendByHours?: number }) =>
      extendDeposit(depositId, extendByHours),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DEPOSITS_QUERY_KEY })
    },
  })
}

/** Subscribe to Supabase Realtime for deposit_holds; invalidates query on changes. Cleanup on unmount. */
export function useDepositsRealtime() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const channel = supabase
      .channel('deposit_holds_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'deposit_holds',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: DEPOSITS_QUERY_KEY })
          queryClient.invalidateQueries({ queryKey: REQUIREMENTS_QUERY_KEY })
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
