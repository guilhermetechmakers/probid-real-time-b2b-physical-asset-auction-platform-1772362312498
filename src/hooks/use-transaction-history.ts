/**
 * useTransactionHistory - Data fetching and mutations for Order/Transaction History.
 * All array state initialized with proper defaults per runtime safety.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchTransactionHistory,
  initiateDispute,
  addDisputeEvidence,
  fetchDisputeAudit,
} from '@/api/transaction-history'
import type {
  TransactionHistoryFilters,
  InitiateDisputePayload,
} from '@/types/transaction-history'

export function useTransactionHistory(
  role: 'buyer' | 'seller',
  filters?: TransactionHistoryFilters
) {
  return useQuery({
    queryKey: ['transaction-history', role, filters],
    queryFn: () => fetchTransactionHistory(role, filters),
    enabled: Boolean(role),
  })
}

export function useDisputeInitiate(transactionId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: InitiateDisputePayload) =>
      initiateDispute(transactionId ?? '', payload),
    onSuccess: (res) => {
      if (res?.disputeId) {
        toast.success('Dispute initiated')
        queryClient.invalidateQueries({ queryKey: ['transaction-history'] })
      } else if (res?.error) {
        toast.error(res.error)
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Failed to initiate dispute')
    },
  })
}

export function useDisputeEvidence(disputeId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ url, type }: { url: string; type?: 'image' | 'pdf' | 'notes' }) =>
      addDisputeEvidence(disputeId ?? '', url, type ?? 'image'),
    onSuccess: (res) => {
      if (res?.evidence) {
        toast.success('Evidence added')
        queryClient.invalidateQueries({ queryKey: ['transaction-history'] })
        queryClient.invalidateQueries({ queryKey: ['dispute-audit', disputeId] })
      } else if (res?.error) {
        toast.error(res.error)
      }
    },
    onError: (err: Error) => {
      toast.error(err?.message ?? 'Failed to add evidence')
    },
  })
}

export function useDisputeAudit(disputeId: string | undefined) {
  return useQuery({
    queryKey: ['dispute-audit', disputeId],
    queryFn: () => fetchDisputeAudit(disputeId ?? ''),
    enabled: Boolean(disputeId?.trim()),
  })
}
