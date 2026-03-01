/**
 * InvoiceViewer - Inline viewer or modal for invoice PDF; download option.
 */
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InvoiceViewerProps {
  invoiceUrl?: string | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function InvoiceViewer({
  invoiceUrl,
  open = false,
  onOpenChange,
  className,
}: InvoiceViewerProps) {
  const url = typeof invoiceUrl === 'string' && invoiceUrl.startsWith('http') ? invoiceUrl : null

  const handleDownload = useCallback(() => {
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = 'invoice.pdf'
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    a.click()
  }, [url])

  const handleOpenInNewTab = useCallback(() => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [url])

  if (!url) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-8',
          className
        )}
      >
        <p className="text-sm text-muted-foreground">No invoice available</p>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl" showClose>
        <DialogHeader>
          <DialogTitle>Invoice</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
              aria-label="Download invoice"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenInNewTab}
              className="gap-2"
              aria-label="Open invoice in new tab"
            >
              <ExternalLink className="h-4 w-4" />
              Open in new tab
            </Button>
          </div>
          <div className="min-h-[400px] overflow-auto rounded-lg border border-[rgb(var(--border))] bg-white">
            <iframe
              src={url}
              title="Invoice PDF"
              className="h-[60vh] w-full"
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
