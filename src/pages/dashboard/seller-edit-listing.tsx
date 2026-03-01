/**
 * Edit / Manage Listing - View metadata, re-run QA, view ops notes, resubmit or schedule.
 */

import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useListingForEdit, useRerunQA } from '@/hooks/use-intake'
import { ensureArray } from '@/lib/safe-utils'
import { toast } from 'sonner'

export function SellerEditListingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: listing, isLoading, error } = useListingForEdit(id ?? null)
  const rerunQA = useRerunQA()

  if (isLoading || !id) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Listing not found.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard/seller/listings')}>
          Back to Listings
        </Button>
      </div>
    )
  }

  const photos = ensureArray(listing.photos ?? [])
  const opsNotes = ensureArray(listing.opsNotes ?? [])
  const qa = listing.qaResults

  const handleRerunQA = () => {
    rerunQA.mutate(id, {
      onSuccess: () => toast.success('QA re-run complete'),
      onError: () => toast.error('QA re-run failed'),
    })
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard/seller/listings')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Listings
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <p className="text-muted-foreground">{listing.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Listing Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Identifier</dt>
              <dd>{listing.identifier}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd>{listing.status}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Reserve Price</dt>
              <dd>{listing.reservePrice != null ? `$${listing.reservePrice}` : '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Starting Price</dt>
              <dd>{listing.startingPrice != null ? `$${listing.startingPrice}` : '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {qa && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>AI Vision QA</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRerunQA}
              disabled={rerunQA.isPending}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${rerunQA.isPending ? 'animate-spin' : ''}`} />
              Re-run QA
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                Confidence: {((qa.confidence ?? 0) * 100).toFixed(0)}% •{' '}
                {qa.pass ? (
                  <span className="text-success">Passed</span>
                ) : (
                  <span className="text-amber-600">Issues</span>
                )}
              </p>
              {ensureArray(qa.warnings).length > 0 && (
                <ul className="list-disc pl-4 text-sm text-amber-600">
                  {qa.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {opsNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Ops Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {opsNotes.map((n) => (
                <li
                  key={n.id}
                  className="rounded-lg border border-[rgb(var(--border))] p-3 text-sm"
                >
                  {n.note}
                  <p className="mt-1 text-xs text-muted-foreground">{n.createdAt}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {photos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Photos ({photos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {photos.map((p, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))]"
                >
                  <img src={p.url} alt="" className="h-full w-full object-cover" />
                  {p.angle && (
                    <div className="bg-black/60 px-2 py-1 text-xs text-white">{p.angle}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
