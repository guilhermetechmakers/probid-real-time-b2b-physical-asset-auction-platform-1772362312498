/**
 * MediaGallery - Image/video carousel with angle tags, lazy loading, zoom.
 */
import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, Gavel } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ListingMedia } from '@/types/listing-detail'

export interface MediaGalleryProps {
  media: ListingMedia[]
  imageUrls?: string[]
  title?: string
  className?: string
}

export function MediaGallery({
  media,
  imageUrls = [],
  title,
  className,
}: MediaGalleryProps) {
  const items = media.length > 0 ? media : imageUrls.map((url, i) => ({
    id: `img-${i}`,
    url,
    type: 'image' as const,
    position: i,
    angleTag: undefined,
  }))
  const [index, setIndex] = useState(0)
  const [zoom, setZoom] = useState(false)
  const current = items[index] ?? items[0]
  const urls = items.map((m) => m.url).filter(Boolean)

  const goPrev = useCallback(() => {
    setIndex((i) => (i <= 0 ? items.length - 1 : i - 1))
  }, [items.length])

  const goNext = useCallback(() => {
    setIndex((i) => (i >= items.length - 1 ? 0 : i + 1))
  }, [items.length])

  if (urls.length === 0) {
    return (
      <div
        className={cn(
          'relative aspect-[4/3] overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]',
          className
        )}
      >
        <div className="flex h-full w-full items-center justify-center">
          <Gavel className="h-24 w-24 text-muted-foreground" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))] shadow-card transition-all duration-300 hover:shadow-card-hover">
        <img
          src={current?.url ?? urls[0]}
          alt={title ?? current?.angleTag ?? 'Listing image'}
          className="h-full w-full object-cover transition-transform duration-300"
          loading="lazy"
          onClick={() => setZoom(!zoom)}
        />
        {current?.angleTag && (
          <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2 py-1 text-xs font-medium text-white">
            {current.angleTag}
          </span>
        )}
        <button
          type="button"
          onClick={() => setZoom(!zoom)}
          className="absolute right-3 top-3 rounded-lg bg-black/40 p-2 text-white transition-opacity hover:bg-black/60"
          aria-label="Zoom"
        >
          <ZoomIn className="h-5 w-5" />
        </button>
        {urls.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-opacity hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white transition-opacity hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {(items ?? []).map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 object-cover transition-all',
                i === index
                  ? 'border-primary shadow-accent-glow'
                  : 'border-transparent opacity-70 hover:opacity-100'
              )}
            >
              <img
                src={item.url}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
