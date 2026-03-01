import { InspectionRequestsPanel } from '@/components/seller-dashboard'

export function SellerInspectionsPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold">Inspections</h1>
        <p className="text-muted-foreground">
          Manage inspection requests and schedules
        </p>
      </div>
      <InspectionRequestsPanel />
    </div>
  )
}
