/**
 * FooterNote - Small legal/copy privacy notes aligned to design system.
 */
import { cn } from '@/lib/utils'

export interface FooterNoteProps {
  children: React.ReactNode
  className?: string
}

export function FooterNote({ children, className }: FooterNoteProps) {
  return (
    <p className={cn('text-xs text-muted-foreground', className)}>
      {children}
    </p>
  )
}
