import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { UploadManager } from './upload-manager'
import { AIEnrichmentPanel } from './ai-enrichment-panel'
import { useCreateListing, useUpdateListing, useUploadListingPhotos } from '@/hooks/use-seller-dashboard'
import { toast } from 'sonner'

const STEPS = [
  { id: 1, title: 'Identifier', description: 'Enter asset identifier (SN/VIN)' },
  { id: 2, title: 'Details', description: 'Specs and description' },
  { id: 3, title: 'Photos', description: 'Upload 15–25 images' },
  { id: 4, title: 'Pricing', description: 'Reserve and starting price' },
  { id: 5, title: 'Review', description: 'Submit for ops review' },
]

export function DraftIntakeFlow() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [listingId, setListingId] = useState<string | null>(null)
  const [uploadedPhotos, setUploadedPhotos] = useState<Array<{ url: string; order: number }>>([])

  const createListing = useCreateListing()
  const updateListing = useUpdateListing()
  const uploadPhotos = useUploadListingPhotos()

  const progress = (step / STEPS.length) * 100

  const handleCreateDraft = async () => {
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }
    try {
      const res = await createListing.mutateAsync({
        identifier: identifier.trim() || undefined,
        title: title.trim(),
        description: description.trim() || undefined,
        status: 'draft',
      })
      setListingId(res.id)
      toast.success('Draft created')
    } catch {
      toast.error('Failed to create draft')
    }
  }

  const handlePhotosComplete = async (
    files: Array<{ url: string; order: number; width?: number; height?: number }>
  ) => {
    if (!listingId) return
    try {
      await uploadPhotos.mutateAsync({ listingId, photos: files })
      setUploadedPhotos(files.map((f, i) => ({ url: f.url, order: i })))
      toast.success('Photos uploaded')
    } catch {
      toast.error('Failed to upload photos')
    }
  }

  const handleSubmit = async () => {
    let id = listingId
    if (!id) {
      try {
        const res = await createListing.mutateAsync({
          identifier: identifier.trim() || undefined,
          title: title.trim(),
          description: description.trim() || undefined,
          status: 'draft',
        })
        id = res.id
        setListingId(id)
      } catch {
        toast.error('Failed to create listing')
        return
      }
    }
    try {
      await updateListing.mutateAsync({
        id,
        payload: {
          title: title.trim(),
          description: description.trim() || undefined,
          status: 'pending_review',
          reservePrice: reservePrice ? Number(reservePrice) : undefined,
          startingPrice: startingPrice ? Number(startingPrice) : undefined,
        },
      })
      toast.success('Submitted for review')
      navigate('/dashboard/seller')
    } catch {
      toast.error('Failed to submit')
    }
  }

  const currentStep = STEPS[step - 1]

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>
            Step {step} of {STEPS.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{currentStep?.title}</CardTitle>
          <CardDescription>{currentStep?.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier">Asset Identifier (SN/VIN)</Label>
                <Input
                  id="identifier"
                  placeholder="e.g. ABC123456"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              {listingId && (
                <AIEnrichmentPanel
                  listingId={listingId}
                  onAccept={() => toast.success('Enrichment accepted')}
                  onFlag={() => toast.info('Flagged for review')}
                />
              )}
              <p className="text-sm text-muted-foreground">
                Enrichment will run asynchronously after you continue.
              </p>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Asset title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[120px] w-full rounded-lg border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm"
                  placeholder="Describe the asset..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <UploadManager
                existingCount={uploadedPhotos.length}
                onUploadComplete={handlePhotosComplete}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="starting">Starting Price ($)</Label>
                <Input
                  id="starting"
                  type="number"
                  placeholder="0"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reserve">Reserve Price ($)</Label>
                <Input
                  id="reserve"
                  type="number"
                  placeholder="0"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Review your listing and submit for ops review. You can save as draft at any time.
              </p>
              <div className="rounded-lg border border-[rgb(var(--border))] p-4 text-sm">
                <p><strong>Title:</strong> {title || '—'}</p>
                <p className="mt-1"><strong>Identifier:</strong> {identifier || '—'}</p>
                <p className="mt-1"><strong>Photos:</strong> {uploadedPhotos.length}</p>
                <p className="mt-1"><strong>Starting:</strong> ${startingPrice || '0'}</p>
                <p className="mt-1"><strong>Reserve:</strong> ${reservePrice || '0'}</p>
              </div>
              <Button
                onClick={handleSubmit}
                disabled={createListing.isPending || !title.trim()}
              >
                {createListing.isPending ? 'Submitting…' : 'Submit for Review'}
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < 5 && (
              <Button
                onClick={async () => {
                  if (step === 2 && !listingId && title.trim()) {
                    await handleCreateDraft()
                  }
                  setStep((s) => s + 1)
                }}
              >
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
