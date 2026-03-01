/**
 * AiQaReportPanel - Structured JSON-driven panel with hard fails, warnings, tags, confidence, evidence.
 */
import { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { AIQAResult } from '@/types/listing-detail'
import type { QAOutput } from '@/types/listing-edit'

function toStrArray(v: unknown): string[] {
  if (v == null) return []
  if (!Array.isArray(v)) return []
  return v.map((s) => String(s))
}

export interface AiQaReportPanelProps {
  qaOutput?: AIQAResult | QAOutput | null | undefined
  /** @deprecated Use qaOutput - alias for backward compatibility */
  aiQa?: AIQAResult | QAOutput | null | undefined
  className?: string
}

function normalizeQA(qa: AIQAResult | QAOutput | null | undefined): {
  hardFails: string[]
  warnings: string[]
  tags: string[]
  confidence: number
  evidenceImages: string[]
  hasHardFail: boolean
  pass?: boolean
} {
  if (!qa) {
    return { hardFails: [], warnings: [], tags: [], confidence: 0, evidenceImages: [], hasHardFail: false }
  }
  const q = qa as unknown as Record<string, unknown>
  const hardFails = toStrArray(q.hardFails ?? q.hard_fails)
  const warnings = toStrArray(q.warnings)
  const tags = toStrArray(q.tags)
  const evidenceImages = toStrArray(q.evidenceImages ?? q.evidence_images)
  const confidence = typeof qa.confidence === 'number' ? qa.confidence : 0
  const hasHardFail = q.hardFail === true || q.hard_fail === true || hardFails.length > 0
  const pass = q.pass as boolean | undefined
  return { hardFails, warnings, tags, confidence, evidenceImages, hasHardFail, pass }
}

export function AiQaReportPanel({ qaOutput, aiQa, className }: AiQaReportPanelProps) {
  const qa = qaOutput ?? aiQa
  const [expandedSection, setExpandedSection] = useState<string | null>('hard-fail')
  const [filter, setFilter] = useState<'all' | 'hard-fail' | 'warnings' | 'tags'>('all')

  const {
    hardFails,
    warnings,
    tags,
    confidence,
    evidenceImages,
    hasHardFail,
    pass,
  } = normalizeQA(qa)

  const toggleSection = (id: string) => {
    setExpandedSection((s) => (s === id ? null : id))
  }

  const showHardFail = filter === 'all' || filter === 'hard-fail'
  const showWarnings = filter === 'all' || filter === 'warnings'
  const showTags = filter === 'all' || filter === 'tags'

  if (!qa) {
    return (
      <Card className={cn('transition-all duration-300 hover:shadow-card-hover', className)}>
        <CardHeader>
          <CardTitle>AI QA Report</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No AI QA results available for this listing.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          {hasHardFail ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle className="h-5 w-5 text-success" />
          )}
          AI QA Report
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
            <p className="mt-1 text-sm font-medium">{Math.round(confidence * 100)}%</p>
          </div>
          {pass != null && (
            <Badge variant={pass ? 'success' : 'destructive'}>
              {pass ? 'Passed' : 'Issues'}
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
                  <li key={i} className="text-sm">{item}</li>
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
          <p className="text-sm text-muted-foreground">No issues found. QA passed.</p>
        )}
      </CardContent>
    </Card>
  )
}
