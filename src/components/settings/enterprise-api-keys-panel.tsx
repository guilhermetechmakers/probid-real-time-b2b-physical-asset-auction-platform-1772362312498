/**
 * EnterpriseAPIKeysPanel - Generate, regenerate, revoke API keys.
 */
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Key, Copy, RefreshCw, Trash2, Loader2 } from 'lucide-react'
import { fetchApiKeys, createApiKey, regenerateApiKey, revokeApiKey } from '@/api/settings'
import type { ApiKey } from '@/types/settings'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

export function EnterpriseAPIKeysPanel() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [revokeId, setRevokeId] = useState<string | null>(null)
  const [revokeOpen, setRevokeOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isRevoking, setIsRevoking] = useState(false)

  const loadKeys = () => {
    fetchApiKeys().then((list) => {
      setApiKeys(Array.isArray(list) ? list : [])
    })
  }

  useEffect(() => {
    let cancelled = false
    fetchApiKeys().then((list) => {
      if (cancelled) return
      setApiKeys(Array.isArray(list) ? list : [])
      setIsLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  const handleCreate = async () => {
    const name = newKeyName.trim() || 'API Key'
    setIsCreating(true)
    try {
      const result = await createApiKey({ name, scopes: ['read', 'write'] })
      if (result?.key) {
        setCreatedKey(result.key)
        loadKeys()
        toast.success('API key created. Copy it now — it won\'t be shown again.')
      } else {
        toast.error('Failed to create key')
      }
    } catch {
      toast.error('Failed to create key')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopyKey = async () => {
    if (!createdKey) return
    try {
      await navigator.clipboard.writeText(createdKey)
      toast.success('Copied to clipboard')
    } catch {
      toast.error('Failed to copy')
    }
  }

  const handleRegenerate = async (id: string) => {
    try {
      const result = await regenerateApiKey(id)
      if (result?.key) {
        setCreatedKey(result.key)
        setCreateOpen(true)
        loadKeys()
        toast.success('Key regenerated. Copy the new key now.')
      } else {
        toast.error('Failed to regenerate')
      }
    } catch {
      toast.error('Failed to regenerate')
    }
  }

  const handleRevoke = async () => {
    if (!revokeId) return
    setIsRevoking(true)
    try {
      const { success } = await revokeApiKey(revokeId)
      if (success) {
        setApiKeys((prev) => (prev ?? []).filter((k) => k.id !== revokeId))
        setRevokeOpen(false)
        setRevokeId(null)
        toast.success('API key revoked')
      } else {
        toast.error('Failed to revoke')
      }
    } catch {
      toast.error('Failed to revoke')
    } finally {
      setIsRevoking(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card">
        <CardHeader>
          <div className="h-6 w-40 animate-pulse rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 w-56 animate-pulse rounded bg-[rgb(var(--muted))]" />
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />
        </CardContent>
      </Card>
    )
  }

  const list = apiKeys ?? []

  return (
    <>
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Enterprise API Keys</CardTitle>
            <CardDescription>
              Generate and manage API keys for programmatic access
            </CardDescription>
          </div>
          <Button
            onClick={() => {
              setCreatedKey(null)
              setNewKeyName('')
              setCreateOpen(true)
            }}
            className="bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90"
          >
            <Key className="h-4 w-4" />
            Generate key
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {list.length === 0 ? (
            <p className="text-sm text-muted-foreground">No API keys yet. Generate one to get started.</p>
          ) : (
            <div className="space-y-2">
              {list.map((key) => (
                <div
                  key={key.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[rgb(var(--border))] p-4"
                >
                  <div>
                    <p className="font-medium">{key.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(key.createdAt)}
                      {key.lastUsedAt ? ` · Last used ${formatDate(key.lastUsedAt)}` : ''}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {(key.scopes ?? []).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {key.status === 'active' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegenerate(key.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                          Regenerate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => {
                            setRevokeId(key.id)
                            setRevokeOpen(true)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                          Revoke
                        </Button>
                      </>
                    )}
                    {key.status === 'revoked' && (
                      <Badge variant="destructive">Revoked</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Use keys in the Authorization header: <code className="rounded bg-[rgb(var(--secondary))] px-1">Bearer YOUR_KEY</code>
          </p>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Generate API Key</DialogTitle>
            <DialogDescription>
              {createdKey
                ? 'Copy your key now. It won\'t be shown again.'
                : 'Create a new API key for programmatic access.'}
            </DialogDescription>
          </DialogHeader>
          {createdKey ? (
            <div className="space-y-2">
              <Label>Your new key</Label>
              <div className="flex gap-2">
                <Input value={createdKey} readOnly className="font-mono text-sm" />
                <Button variant="outline" size="icon" onClick={handleCopyKey}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="key-name">Key name</Label>
              <Input
                id="key-name"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g. Production API"
              />
            </div>
          )}
          <DialogFooter>
            {createdKey ? (
              <Button onClick={() => { setCreateOpen(false); setCreatedKey(null) }}>
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Generate'
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={revokeOpen}
        onOpenChange={setRevokeOpen}
        title="Revoke API key"
        description="This action cannot be undone. The key will stop working immediately."
        confirmLabel="Revoke"
        variant="destructive"
        onConfirm={handleRevoke}
        isLoading={isRevoking}
      />
    </>
  )
}
