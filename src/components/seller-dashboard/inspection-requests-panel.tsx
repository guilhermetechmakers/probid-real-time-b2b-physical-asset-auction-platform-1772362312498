import { ClipboardCheck, Calendar, User } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useSellerInspections } from '@/hooks/use-seller-dashboard'
import { formatDateTime } from '@/lib/utils'

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'success'> = {
  scheduled: 'secondary',
  in_progress: 'default',
  completed: 'success',
}

export function InspectionRequestsPanel() {
  const { data: inspections, isLoading, error } = useSellerInspections()

  const list = Array.isArray(inspections) ? inspections : []

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Failed to load inspections.</p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    )
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <ClipboardCheck className="h-16 w-16 text-muted-foreground" />
          <h3 className="mt-4 font-semibold">No inspection requests</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Inspections will appear here when scheduled
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Inspection Requests</h2>
      <div className="space-y-4">
        {list.map((inspection) => (
          <Card
            key={inspection.id}
            className="transition-all duration-300 hover:shadow-card-hover"
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {formatDateTime(inspection.scheduledAt)}
                  </span>
                </div>
                {inspection.inspectorName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    {inspection.inspectorName}
                  </div>
                )}
                {inspection.notes && (
                  <p className="text-sm text-muted-foreground">{inspection.notes}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={STATUS_VARIANT[inspection.status] ?? 'secondary'}>
                  {inspection.status.replace('_', ' ')}
                </Badge>
                {['scheduled', 'in_progress'].includes(inspection.status) && (
                  <Button variant="outline" size="sm">
                    Reschedule
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
