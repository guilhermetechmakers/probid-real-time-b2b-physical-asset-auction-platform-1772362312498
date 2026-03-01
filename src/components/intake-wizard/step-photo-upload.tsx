/**
 * Step 3: Photo Upload - Drag-and-drop, angle checklist, 15–25 images.
 */

import { useCallback, useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { PhotoAngleGuideLinkCard } from './photo-angle-guide-link-card'
import { REQUIRED_PHOTO_ANGLES } from '@/types'
import type { DraftPhoto } from '@/types'
import { ensureArray } from '@/lib/safe-utils'

const MIN_PHOTOS = 15
const MAX_PHOTOS = 25
const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface UploadingFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  angle: string
  error?: string
}

interface StepPhotoUploadProps {
  photos: DraftPhoto[]
  onPhotosChange: (photos: DraftPhoto[]) => void
  onUpload: (files: Array<{ file: File; angle: string }>) => Promise<void>
  isUploading: boolean
  onNext: () => void
  onBack: () => void
}

export function StepPhotoUpload({
  photos,
  onPhotosChange,
  onUpload,
  isUploading,
  onNext,
  onBack,
}: StepPhotoUploadProps) {
  const [files, setFiles] = useState<UploadingFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [angleForNew, setAngleForNew] = useState<string>(REQUIRED_PHOTO_ANGLES[0])
  const inputRef = useRef<HTMLInputElement>(null)

  const existingPhotos = ensureArray(photos)
  const totalCount = existingPhotos.length + files.length
  const canAddMore = totalCount < MAX_PHOTOS
  const isValidCount = totalCount >= MIN_PHOTOS && totalCount <= MAX_PHOTOS

  const usedAngles = new Set([
    ...existingPhotos.map((p: DraftPhoto) => p.angle),
    ...files.map((f: UploadingFile) => f.angle),
  ])
  const missingAngles = REQUIRED_PHOTO_ANGLES.filter((a: string) => !usedAngles.has(a))

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Invalid type. Use JPEG, PNG, or WebP.`
    }
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `File too large (max ${MAX_FILE_SIZE_MB}MB).`
    }
    return null
  }, [])

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const list = Array.from(newFiles ?? [])
      const valid: UploadingFile[] = []
      const errors: string[] = []

      for (const file of list) {
        if (totalCount + valid.length >= MAX_PHOTOS) break
        const err = validateFile(file)
        if (err) {
          errors.push(`${file.name}: ${err}`)
          continue
        }
        valid.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: 'pending',
          angle: angleForNew as string,
        })
      }

      if (errors.length > 0) setUploadError(errors[0])
      else setUploadError(null)

      setFiles((prev) => {
        const combined = [...prev, ...valid]
        return combined.slice(0, MAX_PHOTOS - existingPhotos.length)
      })
    },
    [existingPhotos.length, totalCount, validateFile, angleForNew]
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id)
      const f = prev.find((p) => p.id === id)
      if (f?.preview) URL.revokeObjectURL(f.preview)
      return next
    })
  }, [])

  const removeExistingPhoto = useCallback(
    (index: number) => {
      const next = [...existingPhotos]
      next.splice(index, 1)
      onPhotosChange(next)
    },
    [existingPhotos, onPhotosChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (!canAddMore) return
      addFiles(e.dataTransfer.files)
    },
    [addFiles, canAddMore]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files
      if (selected) {
        addFiles(selected)
        e.target.value = ''
      }
    },
    [addFiles]
  )

  const handleUpload = useCallback(async () => {
    if (files.length === 0 || !isValidCount) return
    setUploadError(null)
    const toUpload = files.filter((f) => f.status === 'pending')
    if (toUpload.length === 0) {
      onNext()
      return
    }
    try {
      await onUpload(toUpload.map((f) => ({ file: f.file, angle: f.angle })))
      setFiles([])
      onNext()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed')
    }
  }, [files, isValidCount, onUpload, onNext])

  const handleProceed = useCallback(() => {
    if (files.length > 0) {
      handleUpload()
    } else {
      onNext()
    }
  }, [files.length, handleUpload, onNext])

  return (
    <div className="space-y-6 animate-in">
      <PhotoAngleGuideLinkCard />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={(e) => {
          e.preventDefault()
          setIsDragging(false)
        }}
        className={cn(
          'relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-[rgb(var(--border))]',
          !canAddMore && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={!canAddMore}
        />
        <Upload className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 font-medium">Drag and drop or click to upload</p>
        <p className="text-sm text-muted-foreground">
          {MIN_PHOTOS}–{MAX_PHOTOS} images (JPEG, PNG, WebP, max {MAX_FILE_SIZE_MB}MB each)
        </p>
        <div className="mt-2 flex items-center gap-2">
          <label htmlFor="angle-select" className="text-sm text-muted-foreground">
            Angle for new:
          </label>
          <select
            id="angle-select"
            value={angleForNew}
            onChange={(e) => setAngleForNew(e.target.value)}
            className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] px-3 py-1.5 text-sm"
          >
            {REQUIRED_PHOTO_ANGLES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={!canAddMore}
        >
          Select photos
        </Button>
      </div>

      {uploadError && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {uploadError}
        </div>
      )}

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {totalCount} / {MAX_PHOTOS} photos
          {!isValidCount && totalCount > 0 && (
            <span className="ml-2 text-amber-600">(need {MIN_PHOTOS}–{MAX_PHOTOS})</span>
          )}
        </span>
      </div>

      {missingAngles.length > 0 && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">Missing angles</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {missingAngles.map((a) => (
              <span
                key={a}
                className="rounded-md bg-amber-100 px-2 py-1 text-xs dark:bg-amber-900/20"
              >
                {a}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {existingPhotos.map((p: DraftPhoto, i: number) => (
          <div
            key={`existing-${i}`}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))]"
          >
            <img src={p.url} alt="" className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white">
              {p.angle}
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeExistingPhoto(i)}
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {files.map((f) => (
          <div
            key={f.id}
            className="group relative aspect-square overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))]"
          >
            <img src={f.preview} alt="" className="h-full w-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1 text-xs text-white">
              {f.angle}
            </div>
            {f.status === 'uploading' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <Progress value={f.progress} className="w-3/4" />
              </div>
            )}
            {f.status === 'done' && (
              <div className="absolute right-2 top-2 rounded-full bg-success p-1">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            )}
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute right-2 bottom-2 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeFile(f.id)}
              aria-label="Remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} type="button">
          Back
        </Button>
        <Button
          onClick={handleProceed}
          disabled={!isValidCount || isUploading}
          className="hover:scale-[1.02] transition-transform"
        >
          {files.length > 0 ? (isUploading ? 'Uploading…' : 'Upload & Next') : 'Next'}
        </Button>
      </div>
    </div>
  )
}
