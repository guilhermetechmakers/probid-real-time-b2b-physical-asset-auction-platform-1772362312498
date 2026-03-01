/**
 * RBAC Management - Roles, permissions, user assignments.
 */
import { useQuery } from '@tanstack/react-query'
import { Shield, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchRoles } from '@/api/admin'

export function RbacManagement() {
  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: fetchRoles,
  })

  return (
    <div className="space-y-6 animate-in-up">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Roles & Permissions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            System roles and their permission scopes. User assignment is managed via admin tools.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : (roles ?? []).length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No roles defined</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(roles ?? []).map((role) => (
                <Card key={role.id} className="border-[rgb(var(--border))]">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">ID: {role.id}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions ?? []).map((p: string) => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Role Assignment
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Assign roles to users via the admin API or user management tools. Role changes are audited.
          </p>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use POST /api/admin/rbac/users/:userId/assign-role with roleId to assign roles.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
