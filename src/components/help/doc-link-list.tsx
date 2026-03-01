/**
 * DocLinkList - List of documentation items with title, description, link.
 */
import { ExternalLink, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { DocItem } from '@/types/help'
import { cn } from '@/lib/utils'

export interface DocLinkListProps {
  items: DocItem[]
  className?: string
}

export function DocLinkList({ items, className }: DocLinkListProps) {
  const list = Array.isArray(items) ? items : []

  if (list.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 px-6 py-8 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">No documentation available at the moment.</p>
        <p className="mt-1 text-xs text-muted-foreground">Please check back later.</p>
      </div>
    )
  }

  return (
    <ul className={cn('space-y-3', className)} role="list">
      {list.map((item) => {
        const isExternal = item.type === 'external' || item.url.startsWith('http')
        const content = (
          <>
            <div className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-foreground">{item.title}</span>
                {item.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            </div>
          </>
        )

        return (
          <li key={item.id}>
            {isExternal ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-[rgb(var(--secondary))]/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {content}
              </a>
            ) : (
              <Link
                to={item.url}
                className="block rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-4 transition-all duration-200 hover:border-primary/50 hover:bg-[rgb(var(--secondary))]/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                {content}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
