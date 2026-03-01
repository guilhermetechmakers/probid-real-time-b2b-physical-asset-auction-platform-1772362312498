/**
 * SectionCard - Reusable card with title, body, optional actions.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface SectionCardProps {
  title: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  id?: string
}

export function SectionCard({ title, children, className, actions, id }: SectionCardProps) {
  return (
    <Card id={id} className={cn('transition-all duration-300 hover:shadow-card-hover', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        {actions}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
