/**
 * DraftIntakeFlow - Multi-step wizard: identifier, photos (15–25), specs, AI QA, review.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { UploadManager } from '@/components/seller-dashboard/upload-manager'
import { AIEnrichmentPanel } from '@/components/seller-dashboard/ai-enrichment-panel'
import { useCreateListing, useUploadListingPhotos, useUpdateListing } from '@/hooks/use-seller-dashboard'
import { toast } from 'sonner'

const STEPS = [
  { id: 1, title: 'Identifier', description: 'Enter asset identifier (SN/VIN)' },
  { id: 2, title: 'Photos', description: 'Upload 15–25 images' },
  { id: 3, title: 'Details', description: 'Specs and condition notes' },
  { id: 4, title: 'AI QA', description: 'Review enrichment and validation' },
  { id: 5, title: 'Review', description: 'Confirm and submit for ops review' },
]

export function SellerCreateListingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startingPrice, setStartingPrice] = useState('')
  const [reservePrice, setReservePrice] = useState('')
  const [listingId, setListingId] = useState<string | null>(null)
  const [photoUrls, setPhotoUrls] = useState<{ url: string; order: number }[]>([])

  const createListing = useCreateListing()
  const uploadPhotos = useUploadListingPhotos()
  const updateListing = useUpdateListing()

  const progress = (step / STEPS.length) * 100

  const handlePhotoUploadComplete = (urls: { url: string; order: number }[]) => {
    setPhotoUrls(urls)
  }

  const handleNextFromStep1 = async () => {
    if (!identifier.trim()) {
      toast.error('Please enter an identifier')
      return
    }
    try {
      const res = await createListing.mutateAsync({
        identifier: identifier.trim(),
        title: title.trim() || identifier.trim(),
        description: description.trim() || undefined,
        status: 'draft',
      })
      setListingId(res.id)
      setStep(2)
    } catch {
      toast.error('Failed to create listing')
    }
  }

  const handleNextFromStep2 = () => {
    if (photoUrls.length < 15) {
      toast.error('Please upload at least 15 photos')
      return
    }
    setStep(3)
  }

  const handleNextFromStep3 = () => {
    setStep(4)
  }

  const handleSubmit = async () => {
    if (!listingId) return
    try {
      if (photoUrls.length > 0) {
        await uploadPhotos.mutateAsync({
          listingId,
          photos: photoUrls.map((p) => ({ url: p.url, order: p.order })),
        })
      }
      await updateListing.mutateAsync({
        id: listingId,
        payload: {
          title: title || identifier,
          description: description || undefined,
          status: 'pending_review',
          reservePrice: reservePrice ? Number(reservePrice) : undefined,
          startingPrice: startingPrice ? Number(startingPrice) : undefined,
        },
      })
      toast.success('Listing submitted for review')
      navigate('/dashboard/seller/listings')
    } catch {
      toast.error('Failed to submit listing')
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create Listing</h1>
        <p className="text-muted-foreground">
          Multi-step intake with AI enrichment and validation
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Step {step} of {STEPS.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step - 1]?.title}</CardTitle>
          <CardDescription>{STEPS[step - 1]?.description}</CardDescription>
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
              <div className="space-y-2">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="Asset title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <textarea
                  id="description"
                  className="flex min-h-[120px] w-full rounded-lg border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm"
                  placeholder="Describe the asset..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Enrichment will run asynchronously after you continue.
              </p>
            </div>
          )}

          {step === 2 && (
            <UploadManager
              onUploadComplete={handlePhotoUploadComplete}
              existingCount={photoUrls.length}
            />
          )}

          {step === 3 && (
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
              <div className="space-y-2">
                <Label htmlFor="condition">Condition Notes</Label>
                <textarea
                  id="condition"
                  className="flex min-h-[80px] w-full rounded-lg border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm"
                  placeholder="Any condition notes..."
                />
              </div>
            </div>
          )}

          {step === 4 && listingId && (
            <div className="space-y-4">
              <AIEnrichmentPanel
                listingId={listingId}
                onAccept={() => setStep(5)}
                onFlag={() => toast.info('Flagged for review')}
              />
              <Button variant="outline" onClick={() => setStep(5)}>
                Continue to Review
              </Button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-lg border border-[rgb(var(--border))] p-4">
                <p className="font-medium">{title || identifier}</p>
                <p className="text-sm text-muted-foreground">{description || 'No description'}</p>
                <p className="mt-2 text-sm">{photoUrls.length} photos</p>
                {reservePrice && <p className="text-sm">Reserve: ${reservePrice}</p>}
              </div>
              <p className="text-muted-foreground">
                Review your listing and submit for ops review.
              </p>
              <Button
                onClick={handleSubmit}
                disabled={createListing.isPending || updateListing.isPending}
              >
                Submit for Review
              </Button>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Back
            </Button>
            {step === 1 && (
              <Button onClick={handleNextFromStep1} disabled={createListing.isPending}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 2 && (
              <Button onClick={handleNextFromStep2} disabled={photoUrls.length < 15}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 3 && (
              <Button onClick={handleNextFromStep3}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
            {step === 4 && !listingId && null}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
