/**
 * Admin RBAC - Roles and permissions management.
 */
import { RbacManagement } from '@/components/admin'

export function AdminRbacPage() {
  return (
    <div className="space-y-6 animate-in-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">RBAC Management</h1>
        <p className="mt-1 text-muted-foreground">
          Roles and permissions — assign roles via user metadata or users_roles table
        </p>
      </div>
      <RbacManagement />
    </div>
  )
}
