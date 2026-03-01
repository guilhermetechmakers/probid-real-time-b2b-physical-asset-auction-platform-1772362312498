/**
 * SpecsPanel - Collapsible panels for specs, provenance, VIN-like identifier.
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SpecsPanelProps {
  specs?: Record<string, unknown>
  identifier?: string
  provenance?: string
  description?: string
  location?: string
  className?: string
}

function SpecRow({ label, value }: { label: string; value: string | number | boolean }) {
  if (value == null || value === '') return null
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{String(value)}</span>
    </div>
  )
}

export function SpecsPanel({
  specs = {},
  identifier,
  provenance,
  description,
  location,
  className,
}: SpecsPanelProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    specs: true,
    provenance: true,
    details: false,
  })

  const toggle = (key: string) => {
    setExpanded((p) => ({ ...p, [key]: !p[key] }))
  }

  const specEntries = Object.entries(specs ?? {}).filter(
    ([, v]) => v != null && v !== '' && typeof v !== 'object'
  )

  return (
    <Card className={cn('transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Specifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {identifier != null && (
          <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-4 py-3">
            <p className="text-xs text-muted-foreground">Identifier</p>
            <p className="font-mono text-sm font-semibold">{identifier}</p>
          </div>
        )}
        {location != null && (
          <SpecRow label="Location" value={location} />
        )}

        {specEntries.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => toggle('specs')}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium transition-colors hover:bg-[rgb(var(--secondary))]"
            >
              {expanded.specs ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Specs ({specEntries.length})
            </button>
            {expanded.specs && (
              <div className="mt-2 space-y-0 border-t border-[rgb(var(--border))] pt-2">
                {specEntries.map(([k, v]) => (
                  <SpecRow key={k} label={k} value={v as string | number | boolean} />
                ))}
              </div>
            )}
          </section>
        )}

        {provenance != null && provenance !== '' && (
          <section>
            <button
              type="button"
              onClick={() => toggle('provenance')}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium transition-colors hover:bg-[rgb(var(--secondary))]"
            >
              {expanded.provenance ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Provenance
            </button>
            {expanded.provenance && (
              <p className="mt-2 border-t border-[rgb(var(--border))] pt-2 text-sm text-muted-foreground">
                {provenance}
              </p>
            )}
          </section>
        )}

        {description != null && description !== '' && (
          <section>
            <button
              type="button"
              onClick={() => toggle('details')}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-medium transition-colors hover:bg-[rgb(var(--secondary))]"
            >
              {expanded.details ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Description
            </button>
            {expanded.details && (
              <p className="mt-2 border-t border-[rgb(var(--border))] pt-2 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </section>
        )}

        {specEntries.length === 0 && !identifier && !provenance && !description && (
          <p className="text-sm text-muted-foreground">No specifications available.</p>
        )}
      </CardContent>
    </Card>
  )
}
