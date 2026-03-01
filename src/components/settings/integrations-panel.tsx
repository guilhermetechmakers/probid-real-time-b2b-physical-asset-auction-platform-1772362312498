/**
 * IntegrationsPanel - Toggles and config for external services.
 */
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Plug } from 'lucide-react'
import { fetchIntegrations, updateIntegration } from '@/api/settings'
import type { Integration } from '@/types/settings'
import { toast } from 'sonner'

export function IntegrationsPanel() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchIntegrations().then((list) => {
      if (cancelled) return
      setIntegrations(Array.isArray(list) ? list : [])
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const handleToggle = async (integration: Integration, enabled: boolean) => {
    setSavingId(integration.id)
    try {
      const result = await updateIntegration(integration.id, {
        enabled,
        type: integration.type,
        config: integration.config,
      })
      if (result.success) {
        setIntegrations((prev) =>
          (prev ?? []).map((i) =>
            i.id === integration.id ? { ...i, enabled } : i
          )
        )
        toast.success('Integration updated')
      } else {
        toast.error('Failed to update')
      }
    } catch {
      toast.error('Failed to update')
    } finally {
      setSavingId(null)
    }
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card">
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 w-48 animate-pulse rounded bg-[rgb(var(--muted))]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const list = integrations ?? []

  return (
    <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <CardDescription>
          Configure external enrichments, 3rd-party checks, and AI vision services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {list.length === 0 ? (
          <p className="text-sm text-muted-foreground">No integrations configured</p>
        ) : (
          list.map((integration) => (
            <div
              key={integration.id}
              className="flex flex-col gap-4 rounded-xl border border-[rgb(var(--border))] p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[rgb(var(--secondary))]">
                    <Plug className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{integration.name}</p>
                    <p className="text-xs text-muted-foreground">{integration.type}</p>
                  </div>
                </div>
                <Switch
                  checked={integration.enabled}
                  onCheckedChange={(v) => handleToggle(integration, v)}
                  disabled={savingId === integration.id}
                />
              </div>
              {integration.enabled && (
                <div className="space-y-2">
                  <Label className="text-xs">API endpoint (optional)</Label>
                  <Input
                    placeholder="https://api.example.com"
                    defaultValue={(integration.config as Record<string, string>)?.endpoint ?? ''}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
