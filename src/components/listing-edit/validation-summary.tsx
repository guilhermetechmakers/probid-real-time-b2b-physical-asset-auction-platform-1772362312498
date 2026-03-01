/**
 * ValidationSummary - Concise list of issues preventing submission with links to fields.
 */

import { AlertTriangle } from 'lucide-react'
import type { ValidationError } from '@/types/listing-edit'
import { ensureArray } from '@/lib/safe-utils'
import { cn } from '@/lib/utils'

export interface ValidationSummaryProps {
  validationErrors?: ValidationError[]
  warnings?: ValidationError[]
  onNavigateToField?: (field: string) => void
  className?: string
}

export function ValidationSummary({
  validationErrors = [],
  warnings = [],
  onNavigateToField,
  className,
}: ValidationSummaryProps) {
  const errors = ensureArray(validationErrors ?? [])
  const warnList = ensureArray(warnings ?? [])

  if (errors.length === 0 && warnList.length === 0) return null

  return (
    <div
      className={cn(
        'rounded-xl border border-destructive/30 bg-destructive/5 p-4',
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <h4 className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <AlertTriangle className="h-4 w-4" />
        Issues to fix
      </h4>
      <ul className="mt-2 space-y-1">
        {errors.map((e) => (
          <li key={e.field} className="flex items-center gap-2 text-sm">
            <span>{e.message}</span>
            {onNavigateToField && (
              <button
                type="button"
                onClick={() => onNavigateToField(e.field)}
                className="font-medium text-primary hover:underline"
              >
                Go to {e.field}
              </button>
            )}
          </li>
        ))}
        {warnList.map((e) => (
          <li key={e.field} className="flex items-center gap-2 text-sm text-amber-600">
            <span>{e.message}</span>
            {onNavigateToField && (
              <button
                type="button"
                onClick={() => onNavigateToField(e.field)}
                className="font-medium text-primary hover:underline"
              >
                Go to {e.field}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
