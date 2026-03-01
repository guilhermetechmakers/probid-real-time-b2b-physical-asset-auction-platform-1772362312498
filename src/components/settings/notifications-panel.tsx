/**
 * NotificationsPanel - Toggles for Email, SMS, Push and per-event preferences.
 */
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Mail, MessageSquare, Bell } from 'lucide-react'
import { fetchNotifications, updateNotifications } from '@/api/settings'
import type { NotificationPreferences } from '@/types/settings'
import { toast } from 'sonner'

export function NotificationsPanel() {
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    email: true,
    sms: false,
    push: false,
    outbid: true,
    auctionStart: true,
    inspectionScheduling: true,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchNotifications().then((p) => {
      if (cancelled) return
      setPrefs(p)
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const enabledChannels = [prefs.email, prefs.sms, prefs.push].filter(Boolean).length

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    const next = { ...prefs, [key]: value }
    setPrefs(next)
    setIsSaving(true)
    try {
      const payload: Record<string, boolean> = {}
      if (key === 'email' || key === 'sms' || key === 'push') payload[key] = value
      if (key === 'outbid') payload.outbid = value
      if (key === 'auctionStart') payload.auctionStart = value
      if (key === 'inspectionScheduling') payload.inspectionScheduling = value

      const result = await updateNotifications(payload)
      if (result.success) {
        toast.success('Notification preferences updated')
      } else {
        setPrefs(prefs)
        toast.error(result.error ?? 'Failed to update')
      }
    } catch {
      setPrefs(prefs)
      toast.error('Failed to update')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card">
        <CardHeader>
          <div className="h-6 w-40 animate-pulse rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 w-56 animate-pulse rounded bg-[rgb(var(--muted))]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="h-5 w-32 animate-pulse rounded bg-[rgb(var(--muted))]" />
              <div className="h-5 w-9 animate-pulse rounded-full bg-[rgb(var(--muted))]" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </div>
        <Badge variant="secondary" className="shrink-0">
          {enabledChannels} channel{enabledChannels !== 1 ? 's' : ''} enabled
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Channels</p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notif-email" className="font-medium">Email</Label>
                  <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                </div>
              </div>
              <Switch
                id="notif-email"
                checked={prefs.email}
                onCheckedChange={(v) => handleToggle('email', v)}
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notif-sms" className="font-medium">SMS</Label>
                  <p className="text-xs text-muted-foreground">Receive text messages</p>
                </div>
              </div>
              <Switch
                id="notif-sms"
                checked={prefs.sms}
                onCheckedChange={(v) => handleToggle('sms', v)}
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[rgb(var(--border))] p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label htmlFor="notif-push" className="font-medium">Push</Label>
                  <p className="text-xs text-muted-foreground">Browser and app push notifications</p>
                </div>
              </div>
              <Switch
                id="notif-push"
                checked={prefs.push}
                onCheckedChange={(v) => handleToggle('push', v)}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-sm font-medium text-foreground">Events</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-outbid">Outbid</Label>
              <Switch
                id="notif-outbid"
                checked={prefs.outbid}
                onCheckedChange={(v) => handleToggle('outbid', v)}
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-auction">Auction start</Label>
              <Switch
                id="notif-auction"
                checked={prefs.auctionStart}
                onCheckedChange={(v) => handleToggle('auctionStart', v)}
                disabled={isSaving}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notif-inspection">Inspection scheduling</Label>
              <Switch
                id="notif-inspection"
                checked={prefs.inspectionScheduling}
                onCheckedChange={(v) => handleToggle('inspectionScheduling', v)}
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
