/**
 * QAResultsPanel - Hard-fail, warnings, tags, confidence, evidence thumbnails.
 */

import { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { ensureArray } from '@/lib/safe-utils'
import type { QAOutput } from '@/types/listing-edit'

export interface QAResultsPanelProps {
  qaOutput: QAOutput | null | undefined
  onNavigateToField?: (field: string) => void
}

export function QAResultsPanel({
  qaOutput,
  onNavigateToField,
}: QAResultsPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('hard-fail')
  const [filter, setFilter] = useState<'all' | 'hard-fail' | 'warnings' | 'tags'>('all')

  if (!qaOutput) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>AI Vision QA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No QA results yet. Run AI Vision QA on your photos to see results.
          </p>
        </CardContent>
      </Card>
    )
  }

  const hardFails = ensureArray(qaOutput.hardFails ?? [])
  const warnings = ensureArray(qaOutput.warnings ?? [])
  const tags = ensureArray(qaOutput.tags ?? [])
  const evidenceImages = ensureArray(qaOutput.evidenceImages ?? [])
  const confidence = qaOutput.confidence ?? 0
  const hasHardFail = qaOutput.hardFail ?? hardFails.length > 0

  const toggleSection = (id: string) => {
    setExpandedSection((s) => (s === id ? null : id))
  }

  const showHardFail = filter === 'all' || filter === 'hard-fail'
  const showWarnings = filter === 'all' || filter === 'warnings'
  const showTags = filter === 'all' || filter === 'tags'

  return (
    <Card className="transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {hasHardFail ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 text-success" />
          )}
          AI Vision QA
        </CardTitle>
        <div className="flex gap-2">
          {(['all', 'hard-fail', 'warnings', 'tags'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-2 py-1 text-xs font-medium uppercase transition-colors',
                filter === f
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              )}
            >
              {f.replace('-', ' ')}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Confidence</p>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-[rgb(var(--border))]">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-300',
                  confidence >= 0.8
                    ? 'bg-success'
                    : confidence >= 0.5
                      ? 'bg-amber-500'
                      : 'bg-destructive'
                )}
                style={{ width: `${Math.round(confidence * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-sm font-medium">
              {Math.round(confidence * 100)}%
            </p>
          </div>
          {qaOutput.pass != null && (
            <Badge variant={qaOutput.pass ? 'success' : 'destructive'}>
              {qaOutput.pass ? 'Passed' : 'Issues'}
            </Badge>
          )}
        </div>

        {showHardFail && hardFails.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => toggleSection('hard-fail')}
              className="flex w-full items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/5 px-4 py-3 text-left font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              {expandedSection === 'hard-fail' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Hard Fail ({hardFails.length})
            </button>
            {expandedSection === 'hard-fail' && (
              <ul className="mt-2 space-y-2 pl-6">
                {hardFails.map((item, i) => (
                  <li key={i} className="text-sm">
                    {item}
                    {onNavigateToField && (
                      <button
                        type="button"
                        onClick={() => onNavigateToField(String(i))}
                        className="ml-2 text-xs underline"
                      >
                        Go to field
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {showWarnings && warnings.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => toggleSection('warnings')}
              className="flex w-full items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/5 px-4 py-3 text-left font-medium text-amber-700 transition-colors hover:bg-amber-500/10 dark:text-amber-400"
            >
              {expandedSection === 'warnings' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Warnings ({warnings.length})
            </button>
            {expandedSection === 'warnings' && (
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-amber-700 dark:text-amber-400">
                {warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            )}
          </section>
        )}

        {showTags && tags.length > 0 && (
          <section>
            <button
              type="button"
              onClick={() => toggleSection('tags')}
              className="flex w-full items-center gap-2 rounded-lg border border-[rgb(var(--border))] px-4 py-3 text-left font-medium transition-colors hover:bg-secondary"
            >
              {expandedSection === 'tags' ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Tags ({tags.length})
            </button>
            {expandedSection === 'tags' && (
              <div className="mt-2 flex flex-wrap gap-2 pl-6">
                {tags.map((t, i) => (
                  <Badge key={i} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            )}
          </section>
        )}

        {evidenceImages.length > 0 && (
          <section>
            <p className="mb-2 text-sm font-medium">Evidence Images</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {evidenceImages.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex shrink-0 overflow-hidden rounded-lg border border-[rgb(var(--border))] transition-shadow hover:shadow-card"
                >
                  <img
                    src={url}
                    alt=""
                    className="h-20 w-20 object-cover"
                  />
                </a>
              ))}
            </div>
          </section>
        )}

        {hardFails.length === 0 && warnings.length === 0 && tags.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No issues found. QA passed.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
