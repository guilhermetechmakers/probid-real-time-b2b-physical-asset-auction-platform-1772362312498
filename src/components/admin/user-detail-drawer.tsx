/**
 * UserDetailDrawer - Per-user detail modal with profile, KYC, activity, actions.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  User,
  Mail,
  FileText,
  CreditCard,
  RefreshCw,
  ExternalLink,
} from 'lucide-react'
import {
  fetchAdminUserDetail,
  banUser,
  unbanUser,
  changeUserSubscription,
  resendUserKyc,
} from '@/api/admin'
import type { AdminUserDetail } from '@/types/admin'
import { KYCStatusBadge } from './kyc-status-badge'
import { SubscriptionStatusBadge } from './subscription-status-badge'
import { BanRestrictionToggle } from './ban-restriction-toggle'
import { AuditLogInlinePanel } from './audit-log-inline-panel'
import { toast } from 'sonner'
import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface UserDetailDrawerProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function UserDetailDrawer({ userId, open, onOpenChange, onSuccess }: UserDetailDrawerProps) {
  const queryClient = useQueryClient()
  const [planId, setPlanId] = useState('')
  const [showPlanInput, setShowPlanInput] = useState(false)

  const { data: user, isLoading } = useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: () => (userId ? fetchAdminUserDetail(userId) : null),
    enabled: !!userId && open,
  })

  const banMutation = useMutation({
    mutationFn: ({ reason, endAt }: { reason: string; endAt?: string }) =>
      userId ? banUser(userId, { reason, endAt }) : Promise.resolve({ success: false }),
    onSuccess: (res) => {
      if (res?.success) {
        toast.success('User banned')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        onSuccess?.()
      } else {
        toast.error((res as { error?: string }).error ?? 'Failed to ban')
      }
    },
  })

  const unbanMutation = useMutation({
    mutationFn: () => (userId ? unbanUser(userId) : Promise.resolve({ success: false })),
    onSuccess: (res) => {
      if (res?.success) {
        toast.success('User unbanned')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        onSuccess?.()
      } else {
        toast.error((res as { error?: string }).error ?? 'Failed to unban')
      }
    },
  })

  const subscriptionMutation = useMutation({
    mutationFn: (pId: string) => (userId ? changeUserSubscription(userId, pId) : Promise.resolve({ success: false })),
    onSuccess: (res) => {
      if (res?.success) {
        toast.success('Subscription updated')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        queryClient.invalidateQueries({ queryKey: ['admin-users'] })
        setShowPlanInput(false)
        setPlanId('')
        onSuccess?.()
      } else {
        toast.error((res as { error?: string }).error ?? 'Failed to update subscription')
      }
    },
  })

  const resendKycMutation = useMutation({
    mutationFn: () => (userId ? resendUserKyc(userId) : Promise.resolve({ success: false })),
    onSuccess: (res) => {
      if (res?.success) {
        toast.success('KYC resend triggered')
        queryClient.invalidateQueries({ queryKey: ['admin-user-detail', userId] })
        onSuccess?.()
      } else {
        toast.error((res as { error?: string }).error ?? 'Failed to resend KYC')
      }
    },
  })

  const u = user as AdminUserDetail | null | undefined
  const isBanned = u?.isBanned ?? (u?.bans ?? []).some((b) => b.active)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose={true}
        className="max-h-[90vh] max-w-2xl overflow-hidden p-0 sm:max-w-2xl"
      >
        <DialogHeader className="border-b border-[rgb(var(--border))] px-6 py-4">
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(90vh-4rem)] overflow-y-auto">
          <div className="space-y-6 px-6 py-4">
            {isLoading || !u ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <>
                <Card className="rounded-xl border-[rgb(var(--border))] shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <User className="h-4 w-4" />
                      Profile
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{u.email}</span>
                    </div>
                    {u.name && (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{u.name}</span>
                      </div>
                    )}
                    <div className="mt-2 flex flex-wrap gap-2">
                      <KYCStatusBadge status={u.kycStatus} />
                      <SubscriptionStatusBadge
                        status={u.subscriptionStatus ?? 'none'}
                        plan={u.subscriptionPlan}
                      />
                      {isBanned && (
                        <span className="rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                          Banned
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {(u.kycDocuments ?? []).length > 0 && (
                  <Card className="rounded-xl border-[rgb(var(--border))] shadow-card">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <FileText className="h-4 w-4" />
                        KYC Documents
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1 text-sm">
                        {(u.kycDocuments ?? []).map((d, i) => (
                          <li key={i} className="flex items-center justify-between">
                            <span>{d.type}</span>
                            {d.url && (
                              <a
                                href={d.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card className="rounded-xl border-[rgb(var(--border))] shadow-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <BanRestrictionToggle
                      isBanned={isBanned}
                      onBan={async (reason, endAt) => {
                        await banMutation.mutateAsync({ reason, endAt })
                      }}
                      onUnban={async () => {
                        await unbanMutation.mutateAsync()
                      }}
                      isLoading={banMutation.isPending || unbanMutation.isPending}
                    />
                    {u.buyerId && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendKycMutation.mutate()}
                          disabled={resendKycMutation.isPending}
                        >
                          <RefreshCw className="mr-1 h-4 w-4" />
                          Resend KYC
                        </Button>
                        {showPlanInput ? (
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Plan ID"
                              value={planId}
                              onChange={(e) => setPlanId(e.target.value)}
                              className="w-32"
                            />
                            <Button
                              size="sm"
                              onClick={() => planId && subscriptionMutation.mutate(planId)}
                              disabled={!planId || subscriptionMutation.isPending}
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
                            size="sm"
                            variant="outline"
                            onClick={() => setShowPlanInput(true)}
                          >
                            <CreditCard className="mr-1 h-4 w-4" />
                            Change subscription
                          </Button>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>

                {userId && (
                  <AuditLogInlinePanel userId={userId} />
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
