import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

interface LegalLinksProps {
  className?: string
  layout?: 'row' | 'stack'
}

export function LegalLinks({ className, layout = 'row' }: LegalLinksProps) {
  const linkClass =
    'text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded'

  return (
    <nav
      className={cn(
        'flex flex-wrap gap-x-4 gap-y-1',
        layout === 'stack' && 'flex-col',
        className
      )}
      aria-label="Legal and support links"
    >
      <Link to="/terms" className={linkClass}>
        Terms
      </Link>
      <Link to="/privacy" className={linkClass}>
        Privacy
      </Link>
      <Link to="/contact" className={linkClass}>
        Contact Support
      </Link>
    </nav>
  )
}
