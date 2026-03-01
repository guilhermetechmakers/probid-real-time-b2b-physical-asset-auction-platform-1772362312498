/**
 * StatsMiniCard - Live stats: average bid, last extension, number of bidders.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DataVisualBar } from '@/components/shared/data-visual-bar'
import { TrendingUp, Clock } from 'lucide-react'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

export interface StatsMiniCardProps {
  averageBid?: number
  bidCount?: number
  uniqueBidders?: number
  lastExtensionTime?: string
  className?: string
}

export function StatsMiniCard({
  averageBid = 0,
  bidCount = 0,
  uniqueBidders = 0,
  lastExtensionTime,
  className,
}: StatsMiniCardProps) {
  const maxBidders = Math.max(uniqueBidders, 1)

  return (
    <Card
      className={cn(
        'transition-all duration-300 hover:shadow-card-hover',
        className
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Live stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {averageBid > 0 && (
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Avg bid</p>
              <p className="font-bold text-primary">
                {formatCurrency(averageBid)}
              </p>
            </div>
          </div>
        )}
        <DataVisualBar
          value={uniqueBidders}
          max={maxBidders}
          label="Bidders"
          showActive
        />
        {lastExtensionTime && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Last extension</p>
              <p className="text-sm font-medium">
                {formatDateTime(lastExtensionTime)}
              </p>
            </div>
          </div>
        )}
        {bidCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {bidCount} total bid{bidCount !== 1 ? 's' : ''}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
