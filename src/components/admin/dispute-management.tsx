/**
 * Dispute Management Center - Open disputes, resolution actions.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchAdminDisputes, resolveDispute } from '@/api/admin'
import type { AdminDispute } from '@/types/admin'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { useState } from 'react'

export function DisputeManagement() {
  const [resolveId, setResolveId] = useState<string | null>(null)
  const [resolution, setResolution] = useState('')
  const [notes, setNotes] = useState('')
  const queryClient = useQueryClient()

  const { data: rawDisputes, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: () => fetchAdminDisputes(),
  })
  const disputes: AdminDispute[] = Array.isArray(rawDisputes) ? rawDisputes : (rawDisputes ?? [])

  const resolveMutation = useMutation({
    mutationFn: ({ id, r, n }: { id: string; r: string; n?: string }) =>
      resolveDispute(id, r, n),
    onSuccess: (res) => {
      if (res.success) {
        toast.success('Dispute resolved')
        setResolveId(null)
        setResolution('')
        setNotes('')
      } else toast.error(res.error)
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
      queryClient.invalidateQueries({ queryKey: ['admin-metrics'] })
    },
    onError: () => toast.error('Failed to resolve'),
  })

  const openDisputes = (disputes ?? []).filter(
    (d) => d.status === 'initiated' || d.status === 'under_review'
  )

  const handleResolve = async () => {
    if (!resolveId || !resolution.trim()) return false
    const res = await resolveMutation.mutateAsync({
      id: resolveId,
      r: resolution,
      n: notes || undefined,
    })
    return res.success
  }

  return (
    <div className="space-y-6 animate-in-up">
      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : (disputes ?? []).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="mb-2 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">No disputes found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(openDisputes ?? []).map((d) => (
              <Card key={d.id} className="transition-all duration-200 hover:shadow-card-hover">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">
                      Dispute #{d.id.slice(0, 8)} — {d.reason}
                    </CardTitle>
                    <Badge
                      variant={
                        d.status === 'resolved'
                          ? 'success'
                          : d.status === 'rejected'
                            ? 'destructive'
                            : 'warning'
                      }
                    >
                      {d.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {d.description ?? d.caseNotes ?? 'No notes'}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      setResolveId(d.id)
                      setResolution('')
                      setNotes('')
                    }}
                    disabled={d.status === 'resolved'}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Resolve
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {(disputes ?? []).filter((d) => d.status === 'resolved').length > 0 && (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Resolved
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(disputes ?? [])
                  .filter((d) => d.status === 'resolved')
                  .map((d) => (
                    <Card key={d.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <CardTitle className="text-base">
                            Dispute #{d.id.slice(0, 8)} — {d.reason}
                          </CardTitle>
                          <Badge variant="success">Resolved</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {d.description ?? d.caseNotes ?? 'No notes'}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!resolveId}
        onOpenChange={(open) => !open && setResolveId(null)}
        title="Resolve Dispute"
        description="Provide resolution details for the audit trail."
        confirmLabel="Resolve"
        onConfirm={handleResolve}
        isLoading={resolveMutation.isPending}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="resolution" className="text-sm font-medium">
              Resolution *
            </label>
            <Input
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              placeholder="Resolution summary..."
              className="mt-1 min-h-[80px]"
            />
          </div>
          <div>
            <label htmlFor="notes" className="text-sm font-medium">
              Internal Notes (optional)
            </label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Internal notes..."
              className="mt-1"
            />
          </div>
        </div>
      </ConfirmDialog>
    </div>
  )
}
