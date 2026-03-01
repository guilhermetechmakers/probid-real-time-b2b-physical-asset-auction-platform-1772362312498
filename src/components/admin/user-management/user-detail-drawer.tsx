/**
 * UserDetailDrawer - Modal with profile, KYC, activity, ban controls.
 */
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ExternalLink, RefreshCw, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import {
  fetchAdminUserById,
  banUser,
  unbanUser,
  resendKycRequest,
  changeUserSubscription,
  addUserRestriction,
  removeUserRestriction,
} from '@/api/admin'
import { KYCStatusBadge } from './kyc-status-badge'
import { SubscriptionStatusBadge } from './subscription-status-badge'
import { BanRestrictionToggle } from './ban-restriction-toggle'
import { AuditLogInlinePanel } from './audit-log-inline-panel'

interface UserDetailDrawerProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailDrawer({ userId, open, onOpenChange }: UserDetailDrawerProps) {
  const queryClient = useQueryClient()
  const [planId, setPlanId] = useState('')
  const [showPlanInput, setShowPlanInput] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => (userId ? fetchAdminUserById(userId) : null),
    enabled: open && !!userId,
  })

  const banMutation = useMutation({
    mutationFn: ({ id, reason, endAt }: { id: string; reason: string; endAt?: string }) =>
      banUser(id, { reason, endAt }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('User banned')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      } else if ('error' in res && res.error) toast.error(res.error)
    },
    onError: () => toast.error('Failed to ban user'),
  })

  const unbanMutation = useMutation({
    mutationFn: (id: string) => unbanUser(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('User unbanned')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      } else if ('error' in res && res.error) toast.error(res.error)
    },
    onError: () => toast.error('Failed to unban user'),
  })

  const resendKycMutation = useMutation({
    mutationFn: (id: string) => resendKycRequest(id),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('KYC resend requested')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
      } else if ('error' in res && res.error) toast.error(res.error)
    },
    onError: () => toast.error('Failed to resend KYC'),
  })

  const changeSubMutation = useMutation({
    mutationFn: ({ id, planId: pId }: { id: string; planId: string }) =>
      changeUserSubscription(id, pId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Subscription updated')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        setShowPlanInput(false)
        setPlanId('')
      } else if ('error' in res && res.error) toast.error(res.error)
    },
    onError: () => toast.error('Failed to change subscription'),
  })

  const restrictMutation = useMutation({
    mutationFn: ({
      id,
      type,
      reasons,
      expiresAt,
    }: {
      id: string
      type: 'bidding' | 'listing' | 'withdrawal' | 'custom'
      reasons: string[]
      expiresAt?: string
    }) => addUserRestriction(id, { type, reasons, expiresAt }),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Restriction added')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      } else if ('error' in res && res.error) toast.error(res.error)
    },
    onError: () => toast.error('Failed to add restriction'),
  })

  const removeRestrictMutation = useMutation({
    mutationFn: ({ userId: uid, restrictionId }: { userId: string; restrictionId: string }) =>
      removeUserRestriction(uid, restrictionId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Restriction removed')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      } else if ('error' in res && res.error) toast.error(res.error)
    },
    onError: () => toast.error('Failed to remove restriction'),
  })

  if (!userId) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !user ? (
          <p className="py-8 text-center text-muted-foreground">User not found</p>
        ) : (
          <div className="space-y-6 animate-in-up">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold">{user.name}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <KYCStatusBadge status={user.kycStatus} />
                  <SubscriptionStatusBadge
                    status={user.subscriptionStatus ?? 'none'}
                    plan={user.subscriptionPlan}
                  />
                  <span className="rounded-full border bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize">
                    {String(user.role)}
                  </span>
                </div>
              </div>
              {(user.role as string) === 'buyer' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => resendKycMutation.mutate(user.id)}
                  disabled={resendKycMutation.isPending}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Resend KYC
                </Button>
              )}
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="kyc">KYC</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="audit">Audit</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-[rgb(var(--border))] p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Last Active</p>
                    <p className="mt-1 text-sm">{user.lastActive ? new Date(user.lastActive).toLocaleString() : '—'}</p>
                  </div>
                  <div className="rounded-xl border border-[rgb(var(--border))] p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Created</p>
                    <p className="mt-1 text-sm">{new Date(user.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {(user.financialHolds ?? []).length > 0 && (
                  <div>
                    <h4 className="font-medium">Financial Holds</h4>
                    <ul className="mt-2 space-y-2">
                      {(user.financialHolds ?? []).map((h, i) => (
                        <li key={i} className="rounded-lg bg-amber-500/10 px-4 py-2 text-sm">
                          ${h.amount.toFixed(2)} — {h.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="kyc" className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  KYC documents and verification status
                </p>
                {(user.kycDocuments ?? []).length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">No KYC documents</p>
                ) : (
                  <ul className="space-y-2">
                    {(user.kycDocuments ?? []).map((d, i) => (
                      <li key={i} className="flex items-center justify-between rounded-xl border border-[rgb(var(--border))] px-4 py-3">
                        <span className="capitalize">{d.type}</span>
                        {d.url ? (
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-probid-accent hover:underline"
                          >
                            <ExternalLink className="inline h-4 w-4" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="actions" className="space-y-4">
                <BanRestrictionToggle
                  userId={user.id}
                  isBanned={user.isBanned}
                  hasRestrictions={user.hasRestrictions}
                  restrictions={user.restrictions}
                  onBan={(reason, endAt) => banMutation.mutate({ id: user.id, reason, endAt })}
                  onUnban={() => unbanMutation.mutate(user.id)}
                  onAddRestriction={(type, reasons, expiresAt) =>
                    restrictMutation.mutate({ id: user.id, type, reasons, expiresAt })
                  }
                  onRemoveRestriction={(restrictionId) =>
                    removeRestrictMutation.mutate({ userId: user.id, restrictionId })
                  }
                  disabled={banMutation.isPending || unbanMutation.isPending || restrictMutation.isPending}
                />
                {(user.role as string) === 'buyer' && (
                  <div className="rounded-xl border border-[rgb(var(--border))] p-4">
                    <p className="text-sm font-medium">Change subscription</p>
                    {showPlanInput ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Input
                          placeholder="Plan ID (e.g. premium)"
                          value={planId}
                          onChange={(e) => setPlanId(e.target.value)}
                          className="w-40"
                        />
                        <Button
                          size="sm"
                          onClick={() => planId && changeSubMutation.mutate({ id: user.id, planId })}
                          disabled={!planId || changeSubMutation.isPending}
                        >
                          Apply
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setShowPlanInput(false)
                            setPlanId('')
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => setShowPlanInput(true)}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Change plan
                      </Button>
                    )}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="audit">
                <AuditLogInlinePanel userId={user.id} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
