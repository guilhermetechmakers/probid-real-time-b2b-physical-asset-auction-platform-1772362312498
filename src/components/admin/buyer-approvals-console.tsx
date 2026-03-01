/**
 * Buyer Approvals Console - KYC status list, approve/deny actions.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAdminBuyers, approveBuyer } from '@/api/admin'
import type { AdminBuyer } from '@/types/admin'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'

export function BuyerApprovalsConsole() {
  const [search, setSearch] = useState('')
  const [actionBuyer, setActionBuyer] = useState<AdminBuyer | null>(null)
  const [decision, setDecision] = useState<'approve' | 'deny'>('approve')
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()

  const { data: rawBuyers, isLoading } = useQuery({
    queryKey: ['admin-buyers'],
    queryFn: () => fetchAdminBuyers(),
  })
  const buyers: AdminBuyer[] = Array.isArray(rawBuyers) ? rawBuyers : (rawBuyers ?? [])

  const approveMutation = useMutation({
    mutationFn: ({ id, d, n }: { id: string; d: 'approve' | 'deny'; n?: string }) =>
      approveBuyer(id, d, n),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(decision === 'approve' ? 'Buyer approved' : 'Buyer denied')
        setActionBuyer(null)
        setNotes('')
        queryClient.invalidateQueries({ queryKey: ['admin-buyers'] })
        queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
      } else {
        toast.error(res.error ?? 'Failed')
      }
    },
    onError: () => toast.error('Failed to process'),
  })

  const filtered = (buyers ?? []).filter(
    (b) =>
      !search ||
      (b.email ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (b.name ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const handleConfirm = () => {
    if (!actionBuyer) return
    approveMutation.mutate({ id: actionBuyer.id, d: decision, n: notes || undefined })
  }

  return (
    <div className="space-y-6 animate-in-up">
      <div className="flex flex-1 gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            aria-label="Search buyers"
          />
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (filtered ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No buyers found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[rgb(var(--border))]">
                <th className="pb-3 font-medium">Email</th>
                <th className="pb-3 font-medium">Name</th>
                <th className="pb-3 font-medium">KYC Status</th>
                <th className="pb-3 font-medium">Submitted</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(filtered ?? []).map((buyer) => (
                <tr
                  key={buyer.id}
                  className="border-b border-[rgb(var(--border))] transition-colors hover:bg-secondary/50"
                >
                  <td className="py-3">{buyer.email ?? '—'}</td>
                  <td className="py-3">{buyer.name ?? '—'}</td>
                  <td className="py-3">
                    <Badge
                      variant={
                        buyer.kycStatus === 'approved'
                          ? 'success'
                          : buyer.kycStatus === 'rejected'
                            ? 'destructive'
                            : 'warning'
                      }
                    >
                      {buyer.kycStatus}
                    </Badge>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {buyer.submittedAt
                      ? new Date(buyer.submittedAt).toLocaleDateString()
                      : '—'}
                  </td>
                  <td className="py-3 text-right">
                    {(buyer.kycStatus === 'pending' || buyer.kycStatus === 'submitted') && (
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setActionBuyer(buyer)
                            setDecision('approve')
                            setNotes('')
                          }}
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setActionBuyer(buyer)
                            setDecision('deny')
                            setNotes('')
                          }}
                        >
                          <X className="mr-1 h-4 w-4" />
                          Deny
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!actionBuyer}
        onOpenChange={(open) => !open && setActionBuyer(null)}
        title={decision === 'approve' ? 'Approve Buyer' : 'Deny Buyer'}
        description={
          decision === 'approve'
            ? 'Approve this buyer for KYC verification.'
            : 'Deny this buyer. Provide notes for the user.'
        }
        confirmLabel={decision === 'approve' ? 'Approve' : 'Deny'}
        variant={decision === 'approve' ? 'default' : 'destructive'}
        onConfirm={handleConfirm}
        isLoading={approveMutation.isPending}
      >
        <div className="space-y-2">
          <label htmlFor="notes" className="text-sm font-medium">
            Notes (optional)
          </label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Internal notes for audit..."
          />
        </div>
      </ConfirmDialog>
    </div>
  )
}
