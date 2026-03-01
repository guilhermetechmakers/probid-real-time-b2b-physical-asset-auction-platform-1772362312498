/**
 * Step 6: Submit for Ops Review - Summary, terms, submit action.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { DraftData, IntakeQAResult } from '@/types'
import { ensureArray } from '@/lib/safe-utils'

interface StepSubmitReviewProps {
  data: DraftData
  qa: IntakeQAResult | null | undefined
  onSubmit: () => void
  isSubmitting: boolean
  onBack: () => void
}

export function StepSubmitReview({
  data,
  qa,
  onSubmit,
  isSubmitting,
  onBack,
}: StepSubmitReviewProps) {
  const [termsAccepted, setTermsAccepted] = useState(false)

  const photos = ensureArray(data.photos ?? [])
  const hardFails = ensureArray(qa?.hardFails ?? [])
  const canSubmit = termsAccepted && hardFails.length === 0

  return (
    <div className="space-y-6 animate-in">
      <div className="rounded-xl border border-[rgb(var(--border))] p-6 space-y-4">
        <h3 className="font-semibold">Listing Summary</h3>
        <dl className="grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Title</dt>
            <dd>{data.title ?? data.identifier ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Identifier</dt>
            <dd>{data.identifier ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Photos</dt>
            <dd>{photos.length} images</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Reserve Price</dt>
            <dd>{data.reservePrice != null ? `$${data.reservePrice}` : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Est. Value</dt>
            <dd>{data.estimatedValue != null ? `$${data.estimatedValue}` : '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Pickup Location</dt>
            <dd>{data.pickupLocation ?? '—'}</dd>
          </div>
        </dl>
      </div>

      {qa && (
        <div className="rounded-xl border border-[rgb(var(--border))] p-4">
          <p className="font-medium mb-2">QA Snapshot</p>
          <div className="flex items-center gap-2">
            {qa.pass ? (
              <CheckCircle className="h-5 w-5 text-success" />
            ) : (
              <span className="text-amber-600 text-sm">Issues found</span>
            )}
            <span className="text-sm text-muted-foreground">
              Score: {qa.overallScore ?? 0}% · Confidence: {((qa.confidence ?? 0) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {hardFails.length > 0 && (
        <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-4">
          <p className="text-sm font-medium text-destructive">
            Please fix {hardFails.length} hard failure(s) before submitting.
          </p>
          <Link to="/dashboard/seller/create">
            <Button variant="outline" size="sm" className="mt-2">
              Go back to fix
            </Button>
          </Link>
        </div>
      )}

      <div className="flex items-start gap-3">
        <Checkbox
          id="terms"
          checked={termsAccepted}
          onCheckedChange={(checked) => setTermsAccepted(checked === true)}
          aria-describedby="terms-desc"
        />
        <div className="flex-1">
          <label
            htmlFor="terms"
            className="text-sm font-medium cursor-pointer"
          >
            I accept the terms of service and listing agreement
          </label>
          <p id="terms-desc" className="text-xs text-muted-foreground mt-1">
            By submitting, you agree to ProBid&apos;s terms and confirm the accuracy of your listing.
          </p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} type="button">
          Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || isSubmitting}
          className="hover:scale-[1.02] transition-transform"
        >
          {isSubmitting ? 'Submitting…' : 'Submit for Review'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        After submission, you can manage your listing from the{' '}
        <Link
          to="/dashboard/seller/listings"
          className="text-primary underline underline-offset-2"
        >
          Listings
        </Link>{' '}
        page.
      </p>
    </div>
  )
}
