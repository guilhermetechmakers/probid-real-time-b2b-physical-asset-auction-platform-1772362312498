import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

const STEPS = [
  { id: 1, title: 'Identifier', description: 'Enter asset identifier (SN/VIN)' },
  { id: 2, title: 'Details', description: 'Specs and description' },
  { id: 3, title: 'Photos', description: 'Upload 15–25 images' },
  { id: 4, title: 'Pricing', description: 'Reserve and starting price' },
  { id: 5, title: 'Review', description: 'Submit for ops review' },
]

export function SellerCreateListingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [identifier, setIdentifier] = useState('')

  const progress = (step / STEPS.length) * 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Create Listing</h1>
        <p className="text-muted-foreground">
          Multi-step intake with enrichment and AI QA
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
            <div className="space-y-2">
              <Label htmlFor="identifier">Asset Identifier (SN/VIN)</Label>
              <Input
                id="identifier"
                placeholder="e.g. ABC123456"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Enrichment will run asynchronously after you continue.
              </p>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" placeholder="Asset title" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  className="flex min-h-[120px] w-full rounded-lg border-0 bg-[rgb(var(--secondary))] px-4 py-2 text-sm"
                  placeholder="Describe the asset..."
                />
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-[rgb(var(--border))]">
                <Camera className="h-10 w-10 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">Photo Upload</p>
              <p className="text-sm text-muted-foreground">
                Upload 15–25 images with angle checklist. Drag and drop or click to upload.
              </p>
              <Button variant="outline" className="mt-4">
                Select photos
              </Button>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="starting">Starting Price ($)</Label>
                <Input id="starting" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reserve">Reserve Price ($)</Label>
                <Input id="reserve" type="number" placeholder="0" />
              </div>
            </div>
          )}
          {step === 5 && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Review your listing and submit for ops review. You can save as draft at any time.
              </p>
              <Button onClick={() => navigate('/dashboard/seller')}>
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
            {step < 5 && (
              <Button onClick={() => setStep((s) => s + 1)}>
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
