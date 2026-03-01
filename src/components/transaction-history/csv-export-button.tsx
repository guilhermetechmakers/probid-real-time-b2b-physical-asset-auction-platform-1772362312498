/**
 * CSVExportButton - Exports filtered transaction data to CSV.
 */
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { exportTransactionsToCsv } from '@/api/transaction-history'
import type { Transaction } from '@/types/transaction-history'
import { cn } from '@/lib/utils'

export interface CSVExportButtonProps {
  data: Transaction[]
  columns?: { key: keyof Transaction | string; label: string }[]
  className?: string
  disabled?: boolean
}

const DEFAULT_COLUMNS: { key: keyof Transaction | string; label: string }[] = [
  { key: 'id', label: 'Transaction ID' },
  { key: 'date', label: 'Date' },
  { key: 'assetName', label: 'Asset' },
  { key: 'amount', label: 'Amount' },
  { key: 'currency', label: 'Currency' },
  { key: 'status', label: 'Status' },
  { key: 'settlementStatus', label: 'Settlement Status' },
  { key: 'dispute_status', label: 'Dispute Status' },
  { key: 'invoice_present', label: 'Invoice Present' },
  { key: 'logistics_status', label: 'Logistics Status' },
  { key: 'auctionId', label: 'Auction ID' },
]

export function CSVExportButton({
  data,
  columns = DEFAULT_COLUMNS,
  className,
  disabled = false,
}: CSVExportButtonProps) {
  const handleExport = useCallback(() => {
    const list = Array.isArray(data) ? data : []
    if (list.length === 0) {
      toast.error('No data to export')
      return
    }
    const csv = exportTransactionsToCsv(list, columns)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Export downloaded')
  }, [data, columns])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={disabled}
      className={cn(
        'gap-2 transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:shadow-[0_0_12px_rgba(239,253,45,0.2)]',
        className
      )}
      aria-label="Export to CSV"
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
