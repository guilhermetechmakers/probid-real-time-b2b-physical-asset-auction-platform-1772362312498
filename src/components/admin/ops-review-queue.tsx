/**
 * Ops Review Queue - Card-based queue with filters, approve/reject actions.
 */
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Search, Filter, Edit3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { fetchOpsListings, approveListing, rejectListing, requestListingChanges } from '@/api/admin'
import type { AdminListing } from '@/types/admin'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function OpsReviewQueue() {
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [search, setSearch] = useState('')
  const [actionListing, setActionListing] = useState<AdminListing | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request-changes'>('approve')
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['admin-listings', statusFilter],
    queryFn: () => fetchOpsListings(statusFilter || undefined),
  })

  const approveMutation = useMutation({
    mutationFn: ({ id, r }: { id: string; r: string }) => approveListing(id, r),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Listing approved')
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
        queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
      } else {
        toast.error(res.error ?? 'Failed to approve')
      }
    },
    onError: () => toast.error('Failed to approve listing'),
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, r }: { id: string; r: string }) => rejectListing(id, r),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Listing rejected')
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
        queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
      } else {
        toast.error(res.error ?? 'Failed to reject')
      }
    },
    onError: () => toast.error('Failed to reject listing'),
  })

  const requestChangesMutation = useMutation({
    mutationFn: ({ id, checklist }: { id: string; checklist: { label: string; completed: boolean }[] }) =>
      requestListingChanges(id, checklist),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Changes requested')
        queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
        queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
      } else {
        toast.error(res.error ?? 'Failed to request changes')
      }
    },
    onError: () => toast.error('Failed to request changes'),
  })

  const filtered = (listings ?? []).filter((l) =>
    !search || l.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleAction = async () => {
    if (!actionListing) return false
    if ((actionType === 'reject' || actionType === 'request-changes') && !reason.trim()) {
      toast.error(actionType === 'reject' ? 'Reason is required for rejection' : 'Please list required changes')
      return false
    }
    try {
      if (actionType === 'approve') {
        const res = await approveMutation.mutateAsync({ id: actionListing.id, r: reason })
        return res.success
      } else if (actionType === 'reject') {
        const res = await rejectMutation.mutateAsync({ id: actionListing.id, r: reason })
        return res.success
      } else {
        const checklist = reason
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean)
          .map((label) => ({ label, completed: false }))
        const res = await requestChangesMutation.mutateAsync({ id: actionListing.id, checklist })
        return res.success
      }
    } catch {
      return false
    }
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              aria-label="Search listings"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All</SelectItem>
              <SelectItem value="pending_review">Pending Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : (filtered ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No listings match your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(filtered ?? []).map((listing) => (
            <Card
              key={listing.id}
              className="transition-all duration-200 hover:shadow-card-hover"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base line-clamp-1">{listing.title}</CardTitle>
                  <Badge
                    variant={
                      listing.status === 'approved'
                        ? 'success'
                        : listing.status === 'rejected'
                          ? 'destructive'
                          : 'warning'
                    }
                  >
                    {listing.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {listing.sellerName ?? 'Unknown'} · {listing.identifier ?? '—'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserve</span>
                  <span>${Number(listing.reservePrice ?? 0).toLocaleString()}</span>
                </div>
                {listing.status === 'pending_review' && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 min-w-[80px]"
                      onClick={() => {
                        setActionListing(listing)
                        setActionType('approve')
                        setReason('')
                      }}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 min-w-[80px]"
                      onClick={() => {
                        setActionListing(listing)
                        setActionType('request-changes')
                        setReason('')
                      }}
                    >
                      <Edit3 className="mr-1 h-4 w-4" />
                      Request Changes
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 min-w-[80px]"
                      onClick={() => {
                        setActionListing(listing)
                        setActionType('reject')
                        setReason('')
                      }}
                    >
                      <X className="mr-1 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!actionListing}
        onOpenChange={(open) => !open && setActionListing(null)}
        title={
          actionType === 'approve'
            ? 'Approve Listing'
            : actionType === 'reject'
              ? 'Reject Listing'
              : 'Request Changes'
        }
        description={
          actionType === 'approve'
            ? 'Provide a reason for approval (optional but recommended for audit).'
            : actionType === 'reject'
              ? 'Provide a reason for rejection (required).'
              : 'List required changes, one per line. These will be sent to the seller.'
        }
        confirmLabel={
          actionType === 'approve' ? 'Approve' : actionType === 'reject' ? 'Reject' : 'Request Changes'
        }
        variant={actionType === 'reject' ? 'destructive' : 'default'}
        onConfirm={handleAction}
        isLoading={
          approveMutation.isPending || rejectMutation.isPending || requestChangesMutation.isPending
        }
      >
        <div className="space-y-2">
          <label htmlFor="reason" className="text-sm font-medium">
            {actionType === 'request-changes' ? 'Required changes (one per line)' : 'Reason'}
          </label>
          {actionType === 'request-changes' ? (
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={'Add missing photos\nUpdate reserve price\n...'}
              className="min-h-[120px]"
            />
          ) : (
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                actionType === 'approve' ? 'Approved after review' : 'Required changes...'
              }
              className="min-h-[80px]"
            />
          )}
        </div>
      </ConfirmDialog>
    </div>
  )
}
