/**
 * Step 5: Additional Details & Pricing - Reserve, value, location, auction batch.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { DraftData } from '@/types'

interface StepAdditionalDetailsProps {
  data: DraftData
  onDataChange: (data: Partial<DraftData>) => void
  onNext: () => void
  onBack: () => void
}

export function StepAdditionalDetails({
  data,
  onDataChange,
  onNext,
  onBack,
}: StepAdditionalDetailsProps) {
  return (
    <div className="space-y-6 animate-in">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="reservePrice">Reserve Price ($)</Label>
          <Input
            id="reservePrice"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            value={data.reservePrice ?? ''}
            onChange={(e) =>
              onDataChange({
                reservePrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Minimum price you will accept
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="estimatedValue">Estimated Market Value ($)</Label>
          <Input
            id="estimatedValue"
            type="number"
            min={0}
            step={0.01}
            placeholder="0.00"
            value={data.estimatedValue ?? ''}
            onChange={(e) =>
              onDataChange({
                estimatedValue: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
          <p className="text-xs text-muted-foreground">
            Used as starting price if no reserve
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pickupLocation">Pickup Location</Label>
        <Input
          id="pickupLocation"
          placeholder="City, State or full address"
          value={data.pickupLocation ?? ''}
          onChange={(e) => onDataChange({ pickupLocation: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="auctionBatch">Preferred Auction Batch</Label>
        <Input
          id="auctionBatch"
          placeholder="e.g. Q2-2025"
          value={data.auctionBatch ?? ''}
          onChange={(e) => onDataChange({ auctionBatch: e.target.value || undefined })}
        />
        <p className="text-xs text-muted-foreground">
          Optional: when you would like this asset to go to auction
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="paymentTerms">Payment Terms</Label>
        <Input
          id="paymentTerms"
          placeholder="e.g. Net 30"
          value={data.paymentTerms ?? ''}
          onChange={(e) => onDataChange({ paymentTerms: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="fees">Applicable Fees ($)</Label>
        <Input
          id="fees"
          type="number"
          min={0}
          step={0.01}
          placeholder="0.00"
          value={data.fees ?? ''}
          onChange={(e) =>
            onDataChange({
              fees: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} type="button">
          Back
        </Button>
        <Button onClick={onNext} className="hover:scale-[1.02] transition-transform">
          Next
        </Button>
      </div>
    </div>
  )
}
