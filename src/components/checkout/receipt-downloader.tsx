/**
 * ReceiptDownloader - Download links for invoice and receipt; optional email.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, Mail, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ReceiptDownloaderProps {
  invoicePdfUrl?: string | null
  receiptPdfUrl?: string | null
  /** Fallback when receiptPdfUrl is not available */
  downloadUrl?: string | null
  onEmailReceipt?: () => void
  isEmailing?: boolean
  className?: string
}

export function ReceiptDownloader({
  invoicePdfUrl,
  receiptPdfUrl,
  downloadUrl,
  onEmailReceipt,
  isEmailing = false,
  className,
}: ReceiptDownloaderProps) {
  const hasInvoice = Boolean(invoicePdfUrl?.trim())
  const receiptUrl = receiptPdfUrl?.trim() || downloadUrl?.trim()
  const hasReceipt = Boolean(receiptUrl)
  const hasAny = hasInvoice || hasReceipt

  return (
    <Card
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-all duration-300',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold uppercase tracking-wide">
          Receipts & Invoices
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasAny ? (
          <>
            {hasInvoice && (
              <a
                href={invoicePdfUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-xl border border-[rgb(var(--border))] p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Invoice (PDF)</span>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            {hasReceipt && (
              <a
                href={receiptUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-between rounded-xl border border-[rgb(var(--border))] p-4 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium">Receipt (PDF)</span>
                </div>
                <Download className="h-4 w-4 text-muted-foreground" />
              </a>
            )}
            {onEmailReceipt != null && (
              <Button
                variant="outline"
                className="w-full"
                onClick={onEmailReceipt}
                disabled={isEmailing}
              >
                <Mail className="mr-2 h-4 w-4" />
                {isEmailing ? 'Sending…' : 'Email receipt'}
              </Button>
            )}
          </>
        ) : (
          <p className="rounded-lg bg-[rgb(var(--secondary))] p-4 text-sm text-muted-foreground">
            Receipts and invoices will be available after payment is complete.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
