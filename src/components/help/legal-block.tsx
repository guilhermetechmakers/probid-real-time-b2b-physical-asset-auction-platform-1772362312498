/**
 * LegalBlock - Display of privacy, terms, certifications with external links.
 */
import { Link } from 'react-router-dom'
import { Shield, FileText, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LegalBlock {
  id: string
  title: string
  description?: string
  url: string
  type: 'internal' | 'external'
  icon?: 'shield' | 'file' | 'award'
}

export interface LegalBlockProps {
  items?: LegalBlock[]
  className?: string
}

const DEFAULT_ITEMS: LegalBlock[] = [
  { id: 'privacy', title: 'Privacy Policy', description: 'How we collect and use your data.', url: '/privacy', type: 'internal', icon: 'shield' },
  { id: 'terms', title: 'Terms of Service', description: 'Your agreement to use ProBid.', url: '/terms', type: 'internal', icon: 'file' },
  { id: 'cookies', title: 'Cookie Policy', description: 'Cookie usage and preferences.', url: '/cookies', type: 'internal', icon: 'file' },
  { id: 'certs', title: 'Certifications', description: 'Security and compliance certifications.', url: '#', type: 'external', icon: 'award' },
]

const ICONS = {
  shield: Shield,
  file: FileText,
  award: Award,
}

export function LegalBlockComponent({ items = DEFAULT_ITEMS, className }: LegalBlockProps) {
  const list = Array.isArray(items) ? items : DEFAULT_ITEMS

  return (
    <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
      {list.map((item) => {
        const Icon = item.icon ? ICONS[item.icon] : FileText
        const content = (
          <>
            <Icon className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <div>
              <span className="font-medium text-foreground">{item.title}</span>
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
            </div>
          </>
        )

        return item.type === 'external' ? (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {content}
          </a>
        ) : (
          <Link
            key={item.id}
            to={item.url}
            className="flex items-start gap-3 rounded-xl border border-[rgb(var(--border))] bg-[rgb(var(--secondary))]/30 p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {content}
          </Link>
        )
      })}
    </div>
  )
}
