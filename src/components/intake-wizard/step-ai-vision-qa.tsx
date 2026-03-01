/**
 * Step 4: AI Vision QA - Structured QA results with hard-fails, warnings, tags.
 */

import { useState } from 'react'
import { AlertTriangle, AlertCircle, CheckCircle, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { IntakeQAResult } from '@/types'
import { ensureArray } from '@/lib/safe-utils'

interface StepAIVisionQAProps {
  qa: IntakeQAResult | null | undefined
  isRunning: boolean
  onRunQA: () => void
  onNext: () => void
  onBack: () => void
}

export function StepAIVisionQA({
  qa,
  isRunning,
  onRunQA,
  onNext,
  onBack,
}: StepAIVisionQAProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('summary')

  const hardFails = ensureArray(qa?.hardFails ?? [])
  const warnings = ensureArray(qa?.warnings ?? [])
  const tags = ensureArray(qa?.tags ?? [])
  const evidenceImages = ensureArray(qa?.evidenceImages ?? [])
  const confidence = qa?.confidence ?? 0
  const overallScore = qa?.overallScore ?? 0
  const pass = qa?.pass ?? false

  return (
    <div className="space-y-6 animate-in">
      {!qa && !isRunning && (
        <div className="rounded-xl border border-[rgb(var(--border))] p-6 text-center">
          <p className="text-muted-foreground mb-4">
            Run AI Vision QA to validate your photos and metadata.
          </p>
          <Button onClick={onRunQA} disabled={isRunning} className="hover:scale-[1.02] transition-transform">
            {isRunning ? 'Running…' : 'Run QA Check'}
          </Button>
        </div>
      )}

      {isRunning && (
        <div className="rounded-xl border border-[rgb(var(--border))] p-6 flex flex-col items-center gap-4">
          <Progress value={66} className="w-full max-w-xs animate-pulse" />
          <p className="text-sm text-muted-foreground">Analyzing images…</p>
        </div>
      )}

      {qa && !isRunning && (
        <div className="space-y-4">
          {/* Summary */}
          <button
            type="button"
            onClick={() => setExpandedSection(expandedSection === 'summary' ? null : 'summary')}
            className="w-full flex items-center justify-between rounded-xl border border-[rgb(var(--border))] p-4 text-left hover:bg-[rgb(var(--secondary))]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {pass ? (
                <CheckCircle className="h-6 w-6 text-success" />
              ) : (
                <AlertCircle className="h-6 w-6 text-destructive" />
              )}
              <div>
                <p className="font-medium">
                  {pass ? 'QA Passed' : 'QA Issues Found'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Score: {overallScore}% · Confidence: {(confidence * 100).toFixed(0)}%
                </p>
              </div>
            </div>
            <span className="text-muted-foreground">
              {expandedSection === 'summary' ? '−' : '+'}
            </span>
          </button>

          {expandedSection === 'summary' && (
            <div className="rounded-xl border border-[rgb(var(--border))] p-4 bg-[rgb(var(--secondary))]/30">
              <div className="flex gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Overall QA Score</p>
                  <div className="h-2 rounded-full bg-[rgb(var(--muted))] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        pass ? 'bg-success' : 'bg-amber-500'
                      )}
                      style={{ width: `${overallScore}%` }}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium mb-2">Confidence</p>
                  <div className="h-2 rounded-full bg-[rgb(var(--muted))] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hard fails */}
          {hardFails.length > 0 && (
            <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <p className="font-medium text-destructive">Hard Failures</p>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {hardFails.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="mt-2 text-sm text-muted-foreground">
                Please address these issues before submitting.
              </p>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/50 bg-amber-500/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <p className="font-medium text-amber-700 dark:text-amber-400">Warnings</p>
              </div>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {warnings.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="rounded-xl border border-[rgb(var(--border))] p-4">
              <p className="font-medium mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="rounded-md bg-[rgb(var(--secondary))] px-2 py-1 text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Evidence images */}
          {evidenceImages.length > 0 && (
            <div className="rounded-xl border border-[rgb(var(--border))] p-4">
              <div className="flex items-center gap-2 mb-2">
                <ImageIcon className="h-5 w-5" />
                <p className="font-medium">Evidence Images</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {evidenceImages.slice(0, 6).map((url: string, i: number) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="aspect-square rounded-lg object-cover border border-[rgb(var(--border))]"
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={onRunQA}
            disabled={isRunning}
          >
            Re-run QA
          </Button>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack} type="button">
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={isRunning}
          className="hover:scale-[1.02] transition-transform"
        >
          Next
        </Button>
      </div>
    </div>
  )
}
