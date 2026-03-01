/**
 * CartDepositsPage - Centralized deposit holds for buyers.
 * Deposit requirements, cart list, checkout, real-time updates.
 * Runtime safety: (deposits ?? []).map; Array.isArray checks.
 */
import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  useDeposits,
  useDepositRequirements,
  useCaptureDeposit,
  useReleaseDeposit,
  useExtendDeposit,
  useCreateDeposit,
  useDepositsRealtime,
} from '@/hooks/use-deposits'
import {
  DepositCartList,
  DepositRequirementsPanel,
  RealTimeStatusTicker,
  CheckoutModal,
} from '@/components/cart-deposits'
import { DataVisualBar } from '@/components/shared/data-visual-bar'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/utils'
import type { DepositHold } from '@/types/deposits'

export function CartDepositsPage() {
  const [checkoutDeposit, setCheckoutDeposit] = useState<DepositHold | null>(null)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [extendingId, setExtendingId] = useState<string | null>(null)
  const [releasingId, setReleasingId] = useState<string | null>(null)
  const [creatingAuctionId, setCreatingAuctionId] = useState<string | null>(null)

  const { data: depositsData, isLoading: depositsLoading } = useDeposits()
  const { data: requirementsData } = useDepositRequirements()
  useDepositsRealtime()

  const [searchParams, setSearchParams] = useSearchParams()
  const captureMutation = useCaptureDeposit()
  const releaseMutation = useReleaseDeposit()
  const extendMutation = useExtendDeposit()
  const createMutation = useCreateDeposit()

  useEffect(() => {
    const depositId = searchParams.get('depositId')
    const redirectStatus = searchParams.get('redirect_status')
    if (depositId && redirectStatus === 'succeeded') {
      setSearchParams({}, { replace: true })
      captureMutation.mutate(
        { depositId, paymentMethodId: '' },
        {
          onSuccess: () => toast.success('Deposit captured'),
          onError: (err) => toast.error(err instanceof Error ? err.message : 'Capture failed'),
        }
      )
    }
  }, [searchParams, setSearchParams, captureMutation])

  const deposits = Array.isArray(depositsData) ? depositsData : []
  const requirements = Array.isArray(requirementsData) ? requirementsData : []

  const pendingTotal = (deposits ?? [])
    .filter((d) => (d?.status ?? '') === 'holding')
    .reduce((sum, d) => sum + (Number(d?.amount) ?? 0), 0)

  const holdingCount = (deposits ?? []).filter((d) => (d?.status ?? '') === 'holding').length

  const handleCheckout = useCallback((deposit: DepositHold) => {
    setCheckoutDeposit(deposit)
    setCheckoutOpen(true)
  }, [])

  const handleRelease = useCallback(
    (id: string) => {
      setReleasingId(id)
      releaseMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Hold released')
          setReleasingId(null)
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Release failed')
          setReleasingId(null)
        },
      })
    },
    [releaseMutation]
  )

  const handleExtend = useCallback(
    (id: string) => {
      setExtendingId(id)
      extendMutation.mutate({ depositId: id, extendByHours: 24 }, {
        onSuccess: () => {
          toast.success('Hold extended by 24 hours')
          setExtendingId(null)
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : 'Extend failed')
          setExtendingId(null)
        },
      })
    },
    [extendMutation]
  )

  const handleCheckoutSuccess = useCallback(() => {
    toast.success('Deposit captured')
    setCheckoutDeposit(null)
    setCheckoutOpen(false)
  }, [])

  const handleAddHold = useCallback(
    (auctionId: string, amount: number, currency: string) => {
      setCreatingAuctionId(auctionId)
      createMutation.mutate(
        { auctionId, amount, currency, holdFor: 24 },
        {
          onSuccess: (res) => {
            if (res) toast.success('Hold created')
            else toast.error('Failed to add hold')
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : 'Failed to create hold')
          },
          onSettled: () => setCreatingAuctionId(null),
        }
      )
    },
    [createMutation]
  )

  const handleCapture = useCallback(
    async (depositId: string, paymentMethodId: string) => {
      return captureMutation.mutateAsync({ depositId, paymentMethodId })
    },
    [captureMutation]
  )

  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold">Cart / Deposits</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your deposit holds for auctions. Add, extend, release, or capture deposits.
        </p>
      </div>

      <RealTimeStatusTicker deposits={deposits} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Your Holds</h2>
            {depositsLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
              </div>
            ) : (
              <DepositCartList
                deposits={deposits}
                onExtend={handleExtend}
                onRelease={handleRelease}
                onCheckout={handleCheckout}
                extendingId={extendingId}
                releasingId={releasingId}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="mb-4 text-lg font-semibold">Summary</h2>
            <div className="rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pending holds</span>
                  <span className="font-medium">{holdingCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total exposure</span>
                  <span className="font-semibold">{formatCurrency(pendingTotal, 'USD')}</span>
                </div>
              </div>
              {holdingCount > 0 && (
                <DataVisualBar
                  value={holdingCount}
                  max={Math.max(holdingCount, 1)}
                  label="Active holds"
                  showActive={true}
                  className="mt-4"
                />
              )}
            </div>
          </div>

          <DepositRequirementsPanel
            requirements={requirements}
            onCreateHold={handleAddHold}
            isCreating={createMutation.isPending}
            creatingAuctionId={creatingAuctionId}
          />
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={(open) => {
          setCheckoutOpen(open)
          if (!open) setCheckoutDeposit(null)
        }}
        deposit={checkoutDeposit}
        onCapture={handleCapture}
        onSuccess={handleCheckoutSuccess}
      />
    </div>
  )
}
