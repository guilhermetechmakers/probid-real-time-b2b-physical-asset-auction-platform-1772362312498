/**
 * ListingEditForm - Editable metadata form with validation and dirty-tracking.
 */

import { useState, useCallback, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ListingEditData, ListingEditFormValues, ValidationError } from '@/types/listing-edit'
import { ensureArray } from '@/lib/safe-utils'

export interface ListingEditFormProps {
  listing: ListingEditData | null
  onChange?: (values: Partial<ListingEditFormValues>) => void
  onSave?: (values: Partial<ListingEditFormValues>) => void
  isSaving?: boolean
  validationErrors?: ValidationError[]
  onFieldFocus?: (field: string) => void
}

const defaultValues: ListingEditFormValues = {
  title: '',
  description: '',
  category: '',
  specs: {},
  identifiers: {},
  reservePrice: undefined,
  startingPrice: undefined,
  auctionWindow: null,
  pickupLocation: '',
  make: '',
  model: '',
  year: '',
}

export function ListingEditForm({
  listing,
  onChange,
  onSave,
  isSaving = false,
  validationErrors = [],
  onFieldFocus,
}: ListingEditFormProps) {
  const [values, setValues] = useState<ListingEditFormValues>(defaultValues)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (!listing) return
    const specs = listing.specs ?? {}
    setValues({
      title: listing.title ?? '',
      description: listing.description ?? '',
      category: listing.category ?? '',
      specs: specs,
      identifiers: listing.identifiers ?? {},
      reservePrice: listing.reservePrice,
      startingPrice: listing.startingPrice,
      auctionWindow: listing.auctionWindow ?? null,
      pickupLocation: (specs.pickupLocation as string) ?? '',
      make: (specs.make as string) ?? '',
      model: (specs.model as string) ?? '',
      year: (specs.year as string) ?? '',
    })
  }, [listing?.id, listing?.title, listing?.description, listing?.category, listing?.specs, listing?.identifiers, listing?.reservePrice, listing?.startingPrice, listing?.auctionWindow])

  const handleChange = useCallback(
    (updates: Partial<ListingEditFormValues>) => {
      setValues((prev: ListingEditFormValues) => {
        const next = { ...prev, ...updates }
        onChange?.(next)
        return next
      })
      setIsDirty(true)
    },
    [onChange]
  )

  const handleSave = useCallback(() => {
    onSave?.(values)
    setIsDirty(false)
  }, [onSave, values])

  const errors = ensureArray(validationErrors ?? []).map((e) => (typeof e === 'string' ? e : e.message))

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Listing Details</CardTitle>
        {isDirty && (
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="uppercase"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <ul
            className="rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-2 text-sm text-destructive"
            role="list"
            aria-live="polite"
          >
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={values.title}
              onChange={(e) => handleChange({ title: e.target.value })}
              onFocus={() => onFieldFocus?.('title')}
              placeholder="Asset title"
              maxLength={200}
              aria-invalid={errors.some((msg) => msg.toLowerCase().includes('title'))}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={values.description}
              onChange={(e) => handleChange({ description: e.target.value })}
              onFocus={() => onFieldFocus?.('description')}
              placeholder="Detailed description"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={values.category}
              onChange={(e) => handleChange({ category: e.target.value })}
              placeholder="e.g. Machinery, Vehicles"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Input
              id="make"
              value={values.make}
              onChange={(e) =>
                handleChange({
                  specs: { ...values.specs, make: e.target.value },
                  make: e.target.value,
                })
              }
              placeholder="Manufacturer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              value={values.model}
              onChange={(e) =>
                handleChange({
                  specs: { ...values.specs, model: e.target.value },
                  model: e.target.value,
                })
              }
              placeholder="Model"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Input
              id="year"
              value={values.year}
              onChange={(e) =>
                handleChange({
                  specs: { ...values.specs, year: e.target.value },
                  year: e.target.value,
                })
              }
              placeholder="Year"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservePrice">Reserve Price ($)</Label>
            <Input
              id="reservePrice"
              type="number"
              min={0}
              step={0.01}
              value={values.reservePrice ?? ''}
              onChange={(e) =>
                handleChange({
                  reservePrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="startingPrice">Starting Price ($)</Label>
            <Input
              id="startingPrice"
              type="number"
              min={0}
              step={0.01}
              value={values.startingPrice ?? ''}
              onChange={(e) =>
                handleChange({
                  startingPrice: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="pickupLocation">Pickup Location</Label>
            <Input
              id="pickupLocation"
              value={values.pickupLocation}
              onChange={(e) =>
                handleChange({
                  specs: { ...values.specs, pickupLocation: e.target.value },
                  pickupLocation: e.target.value,
                })
              }
              placeholder="City, State or full address"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
