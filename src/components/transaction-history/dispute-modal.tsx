/**
 * DisputeModal - Step-based form: Initiate dispute, add evidence, review, submit.
 */
import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { AlertCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import type { Transaction } from '@/types/transaction-history'

const DISPUTE_REASONS = [
  'Item not as described',
  'Damaged in shipping',
  'Wrong item received',
  'Quality issues',
  'Missing parts',
  'Other',
]

export interface DisputeModalProps {
  transaction: Transaction | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmitDispute: (payload: { reason: string; description?: string; attachmentUrls?: string[] }) => Promise<void>
  onAddEvidence?: (url: string) => Promise<void>
  isSubmitting?: boolean
}

const STEPS = ['Reason', 'Evidence', 'Review'] as const

export function DisputeModal({
  transaction,
  open,
  onOpenChange,
  onSubmitDispute,
  onAddEvidence,
  isSubmitting = false,
}: DisputeModalProps) {
  const [step, setStep] = useState(0)
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [description, setDescription] = useState('')
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [attachmentUrls, setAttachmentUrls] = useState<string[]>([])

  const resolvedReason = reason === 'Other' ? customReason : reason

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1)
  }, [step])

  const handleAddEvidence = useCallback(async () => {
    const url = evidenceUrl?.trim()
    if (!url || !url.startsWith('http')) return
    if (onAddEvidence) {
      await onAddEvidence(url)
    }
    setAttachmentUrls((prev) => [...prev, url])
    setEvidenceUrl('')
  }, [evidenceUrl, onAddEvidence])

  const handleSubmit = useCallback(async () => {
    if (!resolvedReason?.trim()) return
    try {
      await onSubmitDispute({
        reason: resolvedReason,
        description: description?.trim() || undefined,
        attachmentUrls: attachmentUrls.length > 0 ? attachmentUrls : undefined,
      })
      onOpenChange(false)
      setStep(0)
      setReason('')
      setCustomReason('')
      setDescription('')
      setAttachmentUrls([])
    } catch {
      // Error handled by mutation
    }
  }, [resolvedReason, description, attachmentUrls, onSubmitDispute, onOpenChange])

  const canProceed = step === 0 ? resolvedReason?.trim() : true
  const isLastStep = step === STEPS.length - 1

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" showClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Initiate Dispute{transaction?.assetName ? `: ${transaction.assetName}` : ''}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s}
                className={cn(
                  'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium',
                  i === step ? 'bg-primary text-primary-foreground' : 'bg-[rgb(var(--secondary))] text-muted-foreground'
                )}
              >
                {i + 1}. {s}
              </div>
            ))}
          </div>

          {step === 0 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Reason</Label>
                <select
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-2 w-full rounded-lg border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Select a reason</option>
                  {DISPUTE_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {reason === 'Other' && (
                <div>
                  <Label htmlFor="custom-reason">Please specify</Label>
                  <Input
                    id="custom-reason"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Describe the reason"
                    className="mt-2"
                  />
                </div>
              )}
              <div>
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional details..."
                  rows={3}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="evidence-url">Evidence URL (optional)</Label>
                <p className="mb-2 text-xs text-muted-foreground">
                  Add a link to an image or document hosted elsewhere
                </p>
                <div className="flex gap-2">
                  <Input
                    id="evidence-url"
                    type="url"
                    value={evidenceUrl}
                    onChange={(e) => setEvidenceUrl(e.target.value)}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddEvidence}
                    disabled={!evidenceUrl?.trim()?.startsWith('http')}
                  >
                    Add
                  </Button>
                </div>
              </div>
              {attachmentUrls.length > 0 && (
                <ul className="space-y-1 text-sm">
                  {attachmentUrls.map((u, i) => (
                    <li key={i} className="truncate text-muted-foreground">
                      {u}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-2 rounded-lg bg-[rgb(var(--secondary))] p-4">
              <p>
                <span className="text-muted-foreground">Reason:</span> {resolvedReason}
              </p>
              {description && (
                <p>
                  <span className="text-muted-foreground">Description:</span> {description}
                </p>
              )}
              {attachmentUrls.length > 0 && (
                <p>
                  <span className="text-muted-foreground">Evidence:</span> {attachmentUrls.length} link(s)
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {isLastStep ? (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed || isSubmitting}
              className="gap-1"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Dispute'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!canProceed} className="gap-1">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
