/**
 * IntakeWizardContainer - Orchestrates 6-step intake wizard, state, autosave.
 */

import { useEffect, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Save } from 'lucide-react'
import { StepIdentifierEntry } from './step-identifier-entry'
import { StepEnrichmentPrefill } from './step-enrichment-prefill'
import { StepPhotoUpload } from './step-photo-upload'
import { StepAIVisionQA } from './step-ai-vision-qa'
import { StepAdditionalDetails } from './step-additional-details'
import { StepSubmitReview } from './step-submit-review'
import {
  useCreateOrGetDraft,
  useDraft,
  useUpdateDraft,
  useTriggerEnrichment,
  useUploadDraftPhotos,
  useTriggerQA,
  useSubmitDraft,
} from '@/hooks/use-intake'
import { useDebouncedCallback } from '@/hooks/use-debounce'
import type { DraftData } from '@/types'
import { ensureArray } from '@/lib/safe-utils'

const STEPS = [
  { id: 1, title: 'Identifier', description: 'Enter asset identifier (SN/VIN)' },
  { id: 2, title: 'Enrichment Prefill', description: 'Review and edit prefilled specs' },
  { id: 3, title: 'Photo Upload', description: 'Upload 15–25 images with required angles' },
  { id: 4, title: 'AI Vision QA', description: 'Review enrichment and validation' },
  { id: 5, title: 'Additional Details', description: 'Pricing, location, auction preferences' },
  { id: 6, title: 'Submit for Ops Review', description: 'Confirm and submit' },
]

export function IntakeWizardContainer() {
  const navigate = useNavigate()
  const [draftId, setDraftId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [localData, setLocalData] = useState<DraftData>({})

  const createDraft = useCreateOrGetDraft()
  const { data: draft, isLoading: draftLoading } = useDraft(draftId)
  const updateDraft = useUpdateDraft()
  const triggerEnrichment = useTriggerEnrichment()
  const uploadPhotos = useUploadDraftPhotos()
  const triggerQA = useTriggerQA()
  const submitDraft = useSubmitDraft()

  useEffect(() => {
    if (!draftId) {
      createDraft.mutateAsync().then(({ draftId: id }) => setDraftId(id))
    }
  }, [draftId])

  useEffect(() => {
    if (draft?.data) {
      setLocalData(draft.data)
    }
    if (draft?.step) {
      setStep(draft.step)
    }
  }, [draft?.data, draft?.step])

  const debouncedSave = useDebouncedCallback(
    useCallback(() => {
      if (!draftId || !localData) return
      updateDraft.mutate(
        { draftId, payload: { data: localData } },
        {
          onSuccess: () => toast.success('Draft saved'),
          onError: () => toast.error('Failed to save draft'),
        }
      )
    }, [draftId, localData, updateDraft]),
    30000
  )

  useEffect(() => {
    debouncedSave()
  }, [localData, debouncedSave])

  const handleDataChange = useCallback((partial: Partial<DraftData>) => {
    setLocalData((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleSaveDraft = useCallback(() => {
    if (!draftId) return
    updateDraft.mutate(
      { draftId, payload: { data: localData, step } },
      {
        onSuccess: () => toast.success('Draft saved'),
        onError: () => toast.error('Failed to save draft'),
      }
    )
  }, [draftId, localData, step, updateDraft])

  const handleEnrich = useCallback(() => {
    if (!draftId || !localData.identifier?.trim()) return
    triggerEnrichment.mutate(
      { draftId, identifier: localData.identifier.trim() },
      {
        onSuccess: (result) => {
          setLocalData((prev) => ({
            ...prev,
            enrichment: result.enrichment,
            enrichmentStatus: result.status,
            specs: result.enrichment as Record<string, unknown>,
          }))
        },
        onError: () => toast.error('Enrichment failed'),
      }
    )
  }, [draftId, localData.identifier, triggerEnrichment])

  const handlePhotoUpload = useCallback(
    async (files: Array<{ file: File; angle: string }>) => {
      if (!draftId) return
      await uploadPhotos.mutateAsync({ draftId, files })
    },
    [draftId, uploadPhotos]
  )

  const handlePhotosChange = useCallback(
    (photos: DraftData['photos']) => {
      setLocalData((prev) => ({ ...prev, photos: photos ?? [] }))
      if (draftId) {
        updateDraft.mutate({ draftId, payload: { data: { ...localData, photos: photos ?? [] } } })
      }
    },
    [draftId, localData, updateDraft]
  )

  const handleRunQA = useCallback(() => {
    if (!draftId) return
    triggerQA.mutate(draftId, {
      onSuccess: (qa) => {
        setLocalData((prev) => ({ ...prev, qa }))
      },
      onError: () => toast.error('QA failed'),
    })
  }, [draftId, triggerQA])

  const handleSubmit = useCallback(() => {
    if (!draftId) return
    submitDraft.mutate(draftId, {
      onSuccess: (result) => {
        toast.success('Listing submitted for review')
        navigate(`/dashboard/seller/listings/${result.listingId}/edit`)
      },
      onError: () => toast.error('Submission failed'),
    })
  }, [draftId, submitDraft, navigate])

  const progress = (step / STEPS.length) * 100
  const currentStep = STEPS[step - 1]
  const photos = ensureArray(localData.photos ?? [])

  if (draftLoading && !draftId) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 rounded bg-[rgb(var(--muted))]" />
        <div className="h-4 w-full rounded bg-[rgb(var(--muted))]" />
        <div className="h-64 rounded-xl bg-[rgb(var(--muted))]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Create Listing</h1>
          <p className="text-muted-foreground">
            Multi-step intake with AI enrichment and validation
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          disabled={updateDraft.isPending}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Draft
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {step} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="rounded-xl shadow-card border-[rgb(var(--border))]">
        <CardHeader>
          <CardTitle>{currentStep?.title}</CardTitle>
          <CardDescription>{currentStep?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <StepIdentifierEntry
              identifier={localData.identifier ?? ''}
              onIdentifierChange={(v) => handleDataChange({ identifier: v })}
              enrichmentStatus={localData.enrichmentStatus}
              onEnrich={handleEnrich}
              isEnriching={triggerEnrichment.isPending}
              onNext={() => {
                setStep(2)
                updateDraft.mutate({ draftId: draftId!, payload: { step: 2 } })
              }}
              onBack={undefined}
              canProceed={Boolean(localData.identifier?.trim())}
            />
          )}

          {step === 2 && (
            <StepEnrichmentPrefill
              data={localData}
              onDataChange={handleDataChange}
              enrichmentStatus={localData.enrichmentStatus}
              onNext={() => {
                setStep(3)
                updateDraft.mutate({ draftId: draftId!, payload: { step: 3 } })
              }}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepPhotoUpload
              photos={photos}
              onPhotosChange={handlePhotosChange}
              onUpload={handlePhotoUpload}
              isUploading={uploadPhotos.isPending}
              onNext={() => {
                setStep(4)
                updateDraft.mutate({ draftId: draftId!, payload: { step: 4 } })
              }}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <StepAIVisionQA
              qa={localData.qa}
              isRunning={triggerQA.isPending}
              onRunQA={handleRunQA}
              onNext={() => {
                setStep(5)
                updateDraft.mutate({ draftId: draftId!, payload: { step: 5 } })
              }}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <StepAdditionalDetails
              data={localData}
              onDataChange={handleDataChange}
              onNext={() => {
                setStep(6)
                updateDraft.mutate({ draftId: draftId!, payload: { step: 6 } })
              }}
              onBack={() => setStep(4)}
            />
          )}

          {step === 6 && (
            <StepSubmitReview
              data={localData}
              qa={localData.qa}
              onSubmit={handleSubmit}
              isSubmitting={submitDraft.isPending}
              onBack={() => setStep(5)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
