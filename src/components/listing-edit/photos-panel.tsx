/**
 * PhotosPanel - Thumbnail grid with replace, delete, reorder, and QA re-run.
 */

import { useState, useCallback, useRef } from 'react'
import { Trash2, RefreshCw, Upload, ImagePlus, ChevronUp, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/safe-utils'
import type { ListingPhotoEdit } from '@/types/listing-edit'

export interface PhotosPanelProps {
  photos: ListingPhotoEdit[]
  onReplace?: (idx: number, file?: File) => void
  onDelete?: (idx: number) => void
  onReorder?: (fromIdx: number, toIdx: number) => void
  onQAUpdate?: (photoIds?: string[]) => void
  isQARunning?: boolean
  isReplacing?: number | null
}

export function PhotosPanel({
  photos,
  onReplace,
  onDelete,
  onReorder,
  onQAUpdate,
  isQARunning = false,
  isReplacing = null,
}: PhotosPanelProps) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null)
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null)
  const fileInputRefs = useRef<Map<number, HTMLInputElement>>(new Map())

  const safePhotos = ensureArray(photos)

  const handleReplaceClick = useCallback(
    (idx: number) => {
      const input = fileInputRefs.current.get(idx)
      input?.click()
    },
    []
  )

  const handleFileChange = useCallback(
    (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file && onReplace) onReplace(idx, file)
      e.target.value = ''
    },
    [onReplace]
  )

  const handleDragStart = useCallback((idx: number) => setDraggedIdx(idx), [])
  const handleDragOver = useCallback(
    (e: React.DragEvent, idx: number) => {
      e.preventDefault()
      setDragOverIdx(idx)
    },
    []
  )
  const handleDragLeave = useCallback(() => setDragOverIdx(null), [])
  const handleDrop = useCallback(
    (e: React.DragEvent, toIdx: number) => {
      e.preventDefault()
      setDragOverIdx(null)
      if (draggedIdx != null && onReorder && draggedIdx !== toIdx) {
        onReorder(draggedIdx, toIdx)
      }
      setDraggedIdx(null)
    },
    [draggedIdx, onReorder]
  )
  const handleDragEnd = useCallback(() => setDraggedIdx(null), [])

  const moveUp = useCallback(
    (idx: number) => {
      if (idx > 0 && onReorder) onReorder(idx, idx - 1)
    },
    [onReorder]
  )
  const moveDown = useCallback(
    (idx: number) => {
      if (idx < safePhotos.length - 1 && onReorder) onReorder(idx, idx + 1)
    },
    [onReorder, safePhotos.length]
  )

  const photoIds = safePhotos.map((p) => p.id).filter(Boolean)

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Photos ({safePhotos.length})</CardTitle>
        <div className="flex gap-2">
          {onQAUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onQAUpdate(photoIds.length > 0 ? photoIds : undefined)}
              disabled={isQARunning || safePhotos.length === 0}
              className="gap-2"
            >
              <RefreshCw
                className={cn('h-4 w-4', isQARunning && 'animate-spin')}
              />
              Re-run AI QA
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {safePhotos.map((p, idx) => (
            <div
              key={p.id}
              draggable={!!onReorder}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))] transition-all duration-200',
                draggedIdx === idx && 'opacity-50',
                dragOverIdx === idx && 'ring-2 ring-primary'
              )}
            >
              <img
                src={p.url}
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white">
                {p.angle ?? `Photo ${idx + 1}`}
              </div>

              <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {onReorder && (
                  <>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => moveDown(idx)}
                      disabled={idx === safePhotos.length - 1}
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {onReplace && (
                  <>
                    <input
                      ref={(el) => {
                        if (el) fileInputRefs.current.set(idx, el)
                      }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleFileChange(idx, e)}
                    />
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleReplaceClick(idx)}
                      disabled={isReplacing === idx}
                      aria-label="Replace"
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {onDelete && (
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => onDelete(idx)}
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {safePhotos.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[rgb(var(--border))] py-12 text-center">
            <ImagePlus className="h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              No photos yet. Add photos via the Create Listing flow.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
