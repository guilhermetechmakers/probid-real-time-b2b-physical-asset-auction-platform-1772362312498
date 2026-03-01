import { useCallback, useState, useRef } from 'react'
import { Upload, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const MIN_PHOTOS = 15
const MAX_PHOTOS = 25
const MAX_FILE_SIZE_MB = 10
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export interface UploadFile {
  id: string
  file: File
  preview: string
  progress: number
  status: 'pending' | 'uploading' | 'done' | 'error'
  error?: string
}

interface UploadManagerProps {
  onUploadComplete?: (files: Array<{ url: string; order: number; width?: number; height?: number }>) => void
  existingCount?: number
  disabled?: boolean
}

export function UploadManager({
  onUploadComplete,
  existingCount = 0,
  disabled = false,
}: UploadManagerProps) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCount = existingCount + files.length
  const canAddMore = totalCount < MAX_PHOTOS
  const isValidCount = totalCount >= MIN_PHOTOS && totalCount <= MAX_PHOTOS

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
      const valid: UploadFile[] = []
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
        })
      }

      if (errors.length > 0) setUploadError(errors[0])
      else setUploadError(null)

      setFiles((prev) => {
        const combined = [...prev, ...valid]
        return combined.slice(0, MAX_PHOTOS - existingCount)
      })
    },
    [existingCount, totalCount, validateFile]
  )

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const next = prev.filter((f) => f.id !== id)
      const f = prev.find((p) => p.id === id)
      if (f?.preview) URL.revokeObjectURL(f.preview)
      return next
    })
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled || !canAddMore) return
      addFiles(e.dataTransfer.files)
    },
    [addFiles, canAddMore, disabled]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const target = e.target
      const selected = target.files
      if (selected) {
        addFiles(selected)
        target.value = ''
      }
    },
    [addFiles]
  )

  const simulateUpload = useCallback(() => {
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending'
          ? { ...f, progress: 50, status: 'uploading' as const }
          : f
      )
    )
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading'
            ? { ...f, progress: 100, status: 'done' as const }
            : f
        )
      )
      const done = files.filter((f) => f.status === 'done' || f.status === 'uploading')
      if (onUploadComplete && done.length > 0) {
        onUploadComplete(
          done.map((d, i) => ({
            url: d.preview,
            order: i,
            width: undefined,
            height: undefined,
          }))
        )
      }
    }, 800)
  }, [files, onUploadComplete])

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-[rgb(var(--border))]',
          disabled && 'opacity-50 pointer-events-none'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled || !canAddMore}
        />
        <Upload className="h-12 w-12 text-muted-foreground" />
        <p className="mt-2 font-medium">Drag and drop or click to upload</p>
        <p className="text-sm text-muted-foreground">
          {MIN_PHOTOS}–{MAX_PHOTOS} images (JPEG, PNG, WebP, max {MAX_FILE_SIZE_MB}MB each)
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || !canAddMore}
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
            <span className="ml-2 text-amber-600">
              (need {MIN_PHOTOS}–{MAX_PHOTOS})
            </span>
          )}
        </span>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((f) => (
            <div
              key={f.id}
              className="group relative aspect-square overflow-hidden rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--muted))]"
            >
              <img
                src={f.preview}
                alt=""
                className="h-full w-full object-cover"
              />
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
      )}

      {files.length > 0 && (
        <Button
          onClick={simulateUpload}
          disabled={files.some((f) => f.status === 'uploading') || !isValidCount}
        >
          {files.some((f) => f.status === 'uploading') ? 'Uploading…' : 'Upload photos'}
        </Button>
      )}
    </div>
  )
}
