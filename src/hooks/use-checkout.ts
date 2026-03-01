/**
 * useCheckout - Data fetching and state for checkout flow.
 * All array/object state initialized with proper defaults per runtime safety.
 */
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  initializeCheckout,
  fetchInvoice,
  fetchInvoiceWithDeposit,
  payCheckout,
  captureDeposit,
  fetchReceipt,
  fetchPaymentMethods,
  fetchWebhookAudit,
  buildInvoiceSummary,
} from '@/api/checkout'
import type { DepositHold } from '@/types/checkout'

function generateIdempotencyKey(): string {
  return `ck_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

/** Initialize checkout session for an auction */
export function useCheckoutInitialize(auctionId: string | undefined) {
  return useQuery({
    queryKey: ['checkout', 'init', auctionId],
    queryFn: () => initializeCheckout(auctionId ?? ''),
    enabled: Boolean(auctionId?.trim()),
  })
}

/** Fetch invoice for an auction */
export function useCheckoutInvoice(auctionId: string | undefined) {
  return useQuery({
    queryKey: ['checkout', 'invoice', auctionId],
    queryFn: () => fetchInvoice(auctionId ?? ''),
    enabled: Boolean(auctionId?.trim()),
  })
}

/** Fetch deposit/hold status for an auction (uses invoice+deposit endpoint) */
export function useCheckoutDeposit(auctionId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['checkout', 'invoice-deposit', auctionId],
    queryFn: () => fetchInvoiceWithDeposit(auctionId ?? ''),
    enabled: Boolean(auctionId?.trim()),
  })
  return { data: data?.deposit ?? null, isLoading }
}

/** Pay mutation for checkout */
export function useCheckoutPay(auctionId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { paymentMethodId: string; idempotencyKey?: string }) =>
      payCheckout(auctionId ?? '', payload, payload.idempotencyKey),
    onSuccess: (res) => {
      if (res?.paymentStatus === 'succeeded') {
        queryClient.invalidateQueries({ queryKey: ['checkout', 'invoice', auctionId] })
        queryClient.invalidateQueries({ queryKey: ['checkout', 'init', auctionId] })
        queryClient.invalidateQueries({ queryKey: ['checkout', 'invoice-deposit', auctionId] })
      }
    },
  })
}

/** Capture deposit mutation */
export function useCheckoutCaptureDeposit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (invoiceId: string) => captureDeposit(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout'] })
    },
  })
}

/** Fetch receipt for an invoice */
export function useCheckoutReceipt(invoiceId: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: ['checkout', 'receipt', invoiceId],
    queryFn: () => fetchReceipt(invoiceId ?? ''),
    enabled: Boolean(invoiceId?.trim()),
  })
  return { data: data ?? null, isLoading }
}

/** Fetch saved payment methods */
export function useCheckoutPaymentMethods() {
  return useQuery({
    queryKey: ['checkout', 'payment-methods'],
    queryFn: fetchPaymentMethods,
  })
}

export function useCheckout(auctionId: string | undefined, options?: { fetchWebhooks?: boolean }) {
  const queryClient = useQueryClient()
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null)
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<
    'idle' | 'processing' | 'success' | 'error'
  >('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { data: initData, isLoading: initLoading } = useQuery({
    queryKey: ['checkout', 'init', auctionId],
    queryFn: () => initializeCheckout(auctionId ?? ''),
    enabled: Boolean(auctionId?.trim()),
  })

  const { data: invoice, isLoading: invoiceLoading } = useQuery({
    queryKey: ['checkout', 'invoice', auctionId],
    queryFn: () => fetchInvoice(auctionId ?? ''),
    enabled: Boolean(auctionId?.trim()),
  })

  const { data: methods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ['checkout', 'payment-methods'],
    queryFn: fetchPaymentMethods,
    enabled: Boolean(auctionId?.trim()),
  })

  const { data: webhookEntries = [], isLoading: webhookLoading } = useQuery({
    queryKey: ['checkout', 'webhook-audit'],
    queryFn: fetchWebhookAudit,
    enabled: options?.fetchWebhooks ?? false,
  })

  const payMutation = useMutation({
    mutationFn: (payload: { paymentMethodId: string; idempotencyKey?: string }) =>
      payCheckout(auctionId ?? '', payload, payload.idempotencyKey),
    onSuccess: (data) => {
      if (data?.paymentStatus === 'succeeded') {
        setPaymentStatus('success')
        toast.success('Payment completed successfully')
        queryClient.invalidateQueries({ queryKey: ['checkout', 'invoice', auctionId] })
        queryClient.invalidateQueries({ queryKey: ['checkout', 'init', auctionId] })
      } else if (data?.paymentStatus === 'requires_action') {
        setPaymentStatus('idle')
        toast.info('Additional authentication required')
      } else {
        setPaymentStatus('error')
        setErrorMessage('Payment could not be completed')
      }
    },
    onError: (err: { message?: string }) => {
      setPaymentStatus('error')
      setErrorMessage(err?.message ?? 'Payment failed')
      toast.error(err?.message ?? 'Payment failed')
    },
  })

  const captureMutation = useMutation({
    mutationFn: (invId: string) => captureDeposit(invId),
    onSuccess: (data) => {
      if (data?.success) {
        toast.success('Deposit captured')
        queryClient.invalidateQueries({ queryKey: ['checkout', 'invoice', auctionId] })
        queryClient.invalidateQueries({ queryKey: ['checkout', 'init', auctionId] })
      } else {
        toast.error(data?.error ?? 'Failed to capture deposit')
      }
    },
  })

  const summary = buildInvoiceSummary(invoice ?? null)
  const deposit: DepositHold | null = initData?.depositInfo
    ? {
        id: '',
        invoiceId: invoice?.id ?? '',
        amount: initData.depositInfo.amount ?? 0,
        status: 'HELD' as DepositHold['status'],
        holdUntil: initData.depositInfo.holdUntil ?? null,
      }
    : null

  const handlePay = useCallback(() => {
    if (!selectedMethodId) {
      toast.error('Please select a payment method')
      return
    }
    const key = generateIdempotencyKey()
    setPaymentStatus('processing')
    setIdempotencyKey(key)
    payMutation.mutate({ paymentMethodId: selectedMethodId, idempotencyKey: key })
  }, [selectedMethodId, payMutation])

  const handleCaptureDeposit = useCallback(() => {
    const invId = invoice?.id ?? initData?.invoiceId
    if (invId) captureMutation.mutate(invId)
  }, [invoice?.id, initData?.invoiceId, captureMutation])

  return {
    initData: initData ?? null,
    invoice: invoice ?? null,
    summary: summary ?? null,
    methods: Array.isArray(methods) ? methods : [],
    deposit,
    selectedMethodId,
    setSelectedMethodId,
    paymentStatus,
    idempotencyKey,
    errorMessage,
    handlePay,
    handleCaptureDeposit,
    isLoading: initLoading || invoiceLoading,
    methodsLoading,
    webhookEntries: Array.isArray(webhookEntries) ? webhookEntries : [],
    webhookLoading,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['checkout', 'init', auctionId] })
      queryClient.invalidateQueries({ queryKey: ['checkout', 'invoice', auctionId] })
      queryClient.invalidateQueries({ queryKey: ['checkout', 'payment-methods'] })
    },
  }
}
