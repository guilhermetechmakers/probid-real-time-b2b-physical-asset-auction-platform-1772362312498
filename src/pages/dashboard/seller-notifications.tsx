import { NotificationsPanel } from '@/components/seller-dashboard'

export function SellerNotificationsPage() {
  return (
    <div className="space-y-8 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">
          In-app notifications and actionable items
        </p>
      </div>
      <NotificationsPanel />
    </div>
  )
}
