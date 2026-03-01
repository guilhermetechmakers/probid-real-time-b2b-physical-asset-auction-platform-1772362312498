/**
 * KYCPanel - KYC status badge, guidance steps, admin actions.
 */
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, AlertCircle, CheckCircle } from 'lucide-react'
import { fetchKyc } from '@/api/settings'
import { useApproveKyc, useRejectKyc } from '@/hooks/use-settings'
import type { KycInfo } from '@/types/settings'
import { useAuth } from '@/contexts/auth-context'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const statusConfig: Record<
  KycInfo['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success'; icon: typeof ShieldCheck }
> = {
  pending: { label: 'Pending', variant: 'secondary', icon: AlertCircle },
  in_review: { label: 'In Review', variant: 'default', icon: ShieldCheck },
  verified: { label: 'Verified', variant: 'success', icon: CheckCircle },
  rejected: { label: 'Rejected', variant: 'destructive', icon: AlertCircle },
}

export function KYCPanel() {
  const { user } = useAuth()
  const [kyc, setKyc] = useState<KycInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectNotes, setRejectNotes] = useState('')
  const approveKyc = useApproveKyc()
  const rejectKyc = useRejectKyc()

  const isAdmin = user?.role === 'admin' || user?.role === 'ops'

  useEffect(() => {
    let cancelled = false
    fetchKyc().then((k) => {
      if (cancelled) return
      setKyc(k)
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card">
        <CardHeader>
          <div className="h-6 w-24 animate-pulse rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 w-48 animate-pulse rounded bg-[rgb(var(--muted))]" />
        </CardHeader>
        <CardContent>
          <div className="h-16 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />
        </CardContent>
      </Card>
    )
  }

  const status = kyc?.status ?? 'pending'
  const config = statusConfig[status] ?? statusConfig.pending
  const Icon = config.icon
  const requiredActions = kyc?.requiredActions ?? []

  return (
    <>
    <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>KYC Verification</CardTitle>
        <CardDescription>
          Identity verification required for bidding
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                status === 'verified'
                  ? 'bg-[rgb(var(--success))]/20 text-[rgb(var(--success))]'
                  : status === 'rejected'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-[rgb(var(--secondary))] text-muted-foreground'
              }`}
            >
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <Badge variant={config.variant}>{config.label}</Badge>
              {kyc?.reviewedAt && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Reviewed {new Date(kyc.reviewedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          {isAdmin && (status === 'in_review' || status === 'pending') && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setRejectOpen(true)}
              >
                Request changes
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => {
                  setRejectNotes('')
                  setRejectOpen(true)
                }}
              >
                Reject
              </Button>
              <Button
                size="sm"
                className="bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90"
                onClick={() => approveKyc.mutate()}
                disabled={approveKyc.isPending}
              >
                {approveKyc.isPending ? 'Approving…' : 'Approve'}
              </Button>
            </div>
          )}
        </div>

        {requiredActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Next steps</p>
            <ul className="space-y-2">
              {requiredActions.map((action, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-probid-accent" />
                  {action}
                </li>
              ))}
            </ul>
            {status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Submit documents
              </Button>
            )}
          </div>
        )}

        {status === 'verified' && (
          <p className="text-sm text-[rgb(var(--success))]">
            Your identity has been verified. You can participate in auctions.
          </p>
        )}
      </CardContent>
    </Card>

    <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject KYC</DialogTitle>
          <DialogDescription>
            Provide feedback for the user. They will need to resubmit with corrections.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor="reject-notes">Notes (optional)</Label>
          <Input
            id="reject-notes"
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
            placeholder="e.g. Please resubmit with a clearer photo of your ID"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setRejectOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              rejectKyc.mutate(rejectNotes.trim() || undefined)
              setRejectOpen(false)
              setRejectNotes('')
            }}
            disabled={rejectKyc.isPending}
          >
            {rejectKyc.isPending ? 'Rejecting…' : 'Reject'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  )
}
