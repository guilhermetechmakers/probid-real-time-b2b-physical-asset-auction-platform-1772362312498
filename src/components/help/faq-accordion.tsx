/**
 * FAQAccordion - Collapsible Q&A items with accessible toggling.
 */
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { FAQItem } from '@/types/help'
import { cn } from '@/lib/utils'

export interface FAQAccordionProps {
  items: FAQItem[]
  category?: 'seller' | 'buyer' | 'general'
  className?: string
}

export function FAQAccordion({ items, category, className }: FAQAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const list = Array.isArray(items) ? items : []
  const filtered = category
    ? list.filter((i) => (i.category ?? 'general') === category)
    : list

  if (filtered.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No FAQs available for this category. Please check back later.
      </p>
    )
  }

  return (
    <div className={cn('space-y-2', className)} role="list">
      {filtered.map((item) => {
        const isOpen = openId === item.id
        return (
          <div
            key={item.id}
            className="rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 overflow-hidden transition-all duration-200"
            role="listitem"
          >
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : item.id)}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${item.id}`}
              id={`faq-question-${item.id}`}
              className="flex w-full items-center gap-3 px-4 py-3 text-left font-medium text-foreground transition-colors hover:bg-[rgb(var(--secondary))]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
            >
              {isOpen ? (
                <ChevronDown className="h-5 w-5 shrink-0 text-primary" aria-hidden />
              ) : (
                <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden />
              )}
              <span>{item.question}</span>
            </button>
            <div
              id={`faq-answer-${item.id}`}
              role="region"
              aria-labelledby={`faq-question-${item.id}`}
              className={cn(
                'grid transition-all duration-200 ease-out',
                isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
              )}
            >
              <div className="overflow-hidden">
                <div className="border-t border-[rgb(var(--border))] px-4 py-3 pl-12">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.answer}</p>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
