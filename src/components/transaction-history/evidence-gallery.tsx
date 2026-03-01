/**
 * EvidenceGallery - Image/video thumbnails, drag-and-drop uploads, validation.
 */
import { useCallback, useState } from 'react'
import { cn } from '@/lib/utils'
import { ImagePlus, X, FileText } from 'lucide-react'
import type { EvidenceRef } from '@/types/transaction-history'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']

export interface EvidenceGalleryProps {
  evidenceList: EvidenceRef[]
  onUpload?: (file: File) => Promise<string | null>
  onRemove?: (id: string) => void
  readOnly?: boolean
  className?: string
}

export function EvidenceGallery({
  evidenceList,
  onUpload,
  onRemove,
  readOnly = false,
  className,
}: EvidenceGalleryProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const list = Array.isArray(evidenceList) ? evidenceList : []

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'File must be under 10MB'
    }
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(jpg|jpeg|png|webp|pdf)$/i)) {
      return 'Only images (JPEG, PNG, WebP) and PDFs allowed'
    }
    return null
  }, [])

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      setUploadError(null)
      if (readOnly || !onUpload) return
      const file = e.dataTransfer.files?.[0]
      if (!file) return
      const err = validateFile(file)
      if (err) {
        setUploadError(err)
        return
      }
      const url = await onUpload(file)
      if (!url) setUploadError('Upload failed')
    },
    [onUpload, readOnly, validateFile]
  )

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setUploadError(null)
      if (readOnly || !onUpload) return
      const file = e.target.files?.[0]
      if (!file) return
      const err = validateFile(file)
      if (err) {
        setUploadError(err)
        return
      }
      const url = await onUpload(file)
      if (!url) setUploadError('Upload failed')
      e.target.value = ''
    },
    [onUpload, readOnly, validateFile]
  )

  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card',
        className
      )}
    >
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">
        Evidence
      </h4>
      <div className="space-y-4">
        {!readOnly && onUpload && (
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors',
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 hover:border-primary/50'
            )}
          >
            <ImagePlus className="h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">
              Drag and drop images or PDFs, or click to browse
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileSelect}
              className="mt-2 hidden"
              id="evidence-upload"
            />
            <label
              htmlFor="evidence-upload"
              className="mt-2 cursor-pointer text-sm font-medium text-primary hover:underline"
            >
              Choose file
            </label>
            {uploadError && (
              <p className="mt-2 text-xs text-destructive">{uploadError}</p>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {list.map((ev) => (
            <div
              key={ev?.id ?? ''}
              className="group relative aspect-square overflow-hidden rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]"
            >
              {ev?.type === 'image' ? (
                <img
                  src={ev?.url ?? ''}
                  alt="Evidence"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              {!readOnly && onRemove && (
                <button
                  type="button"
                  onClick={() => onRemove(ev?.id ?? '')}
                  className="absolute right-2 top-2 rounded-full bg-destructive/90 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remove evidence"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
