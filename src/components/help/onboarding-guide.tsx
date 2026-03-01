/**
 * OnboardingGuide - Structured steps with optional downloadable assets.
 */
import { CheckCircle2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { OnboardingGuide } from '@/types/help'
import { cn } from '@/lib/utils'

export interface OnboardingGuideProps {
  guide: OnboardingGuide
  className?: string
}

export function OnboardingGuideCard({ guide, className }: OnboardingGuideProps) {
  const steps = Array.isArray(guide.steps) ? guide.steps : []

  return (
    <div
      className={cn(
        'rounded-2xl border border-[rgb(var(--border))] bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <h4 className="text-lg font-semibold text-foreground">{guide.title}</h4>
      <p className="mt-1 text-sm text-muted-foreground capitalize">
        For {guide.role}s
      </p>
      <ol className="mt-4 space-y-3" role="list">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span className="text-sm text-foreground">{step}</span>
          </li>
        ))}
      </ol>
      {guide.downloadUrl && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          asChild
        >
          <a href={guide.downloadUrl} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4" />
            Download Guide
          </a>
        </Button>
      )}
    </div>
  )
}
