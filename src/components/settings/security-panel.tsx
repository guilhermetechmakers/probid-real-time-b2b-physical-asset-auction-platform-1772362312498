/**
 * SecurityPanel - Password change, 2FA, active sessions.
 */
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import { Shield, Smartphone, Monitor } from 'lucide-react'
import { useSessions, useRevokeSession, useChangePassword } from '@/hooks/use-settings'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateTime } from '@/lib/utils'

export function SecurityPanel() {
  const { data: sessions = [], isLoading } = useSessions()
  const revokeSession = useRevokeSession()
  const changePassword = useChangePassword()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [revokeId, setRevokeId] = useState<string | null>(null)

  const list = Array.isArray(sessions) ? sessions : []
  const passwordMatch = newPassword === confirmPassword
  const passwordValid = newPassword.length >= 8

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !passwordMatch || !passwordValid) return
    const result = await changePassword.mutateAsync({ currentPassword, newPassword })
    if (result.success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card">
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="rounded-2xl border border-[rgb(var(--border))] bg-card shadow-card transition-shadow duration-200 hover:shadow-card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Password, 2FA, and active sessions
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Change password</h4>
            <div className="grid gap-4 sm:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <PasswordInput
                  id="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <PasswordInput
                  id="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {newPassword && !passwordValid && (
                  <p className="text-xs text-destructive">At least 8 characters required</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <PasswordInput
                  id="confirm-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
                {confirmPassword && !passwordMatch && (
                  <p className="text-xs text-destructive">Passwords do not match</p>
                )}
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={
                changePassword.isPending ||
                !currentPassword ||
                !newPassword ||
                !passwordMatch ||
                !passwordValid
              }
              className="bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90"
            >
              {changePassword.isPending ? 'Updating…' : 'Update password'}
            </Button>
          </div>

          <div className="border-t border-[rgb(var(--border))] pt-4">
            <h4 className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Smartphone className="h-4 w-4" />
              2FA
            </h4>
            <p className="mb-4 text-sm text-muted-foreground">
              Two-factor authentication adds an extra layer of security.
            </p>
            <Button variant="outline" size="sm">
              Enable 2FA
            </Button>
          </div>

          <div className="border-t border-[rgb(var(--border))] pt-4">
            <h4 className="mb-4 flex items-center gap-2 text-sm font-medium">
              <Monitor className="h-4 w-4" />
              Active sessions
            </h4>
            {list.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active sessions</p>
            ) : (
              <div className="space-y-2">
                {list.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-[rgb(var(--border))] p-4"
                  >
                    <div>
                      <p className="font-medium">{s.device ?? 'Unknown device'}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.location ?? 'Unknown location'} · Last active{' '}
                        {formatDateTime(s.lastActive)}
                      </p>
                    </div>
                    {!s.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRevokeId(s.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!revokeId}
        onOpenChange={(o) => !o && setRevokeId(null)}
        title="Revoke session"
        description="This device will be signed out immediately."
        confirmLabel="Revoke"
        onConfirm={async () => {
          if (revokeId) await revokeSession.mutateAsync(revokeId)
        }}
        isLoading={revokeSession.isPending}
      />
    </>
  )
}
