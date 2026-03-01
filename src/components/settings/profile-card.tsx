/**
 * ProfileCard - Editable profile fields with Save/Cancel.
 */
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { fetchProfile, updateProfile } from '@/api/settings'
import type { UserProfile, SettingsProfilePayload } from '@/types/settings'
import { toast } from 'sonner'

function maskPayout(last4: string | undefined): string {
  if (!last4) return '••••'
  return `••••${last4}`
}

export function ProfileCard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [form, setForm] = useState<SettingsProfilePayload>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const p = await fetchProfile()
      if (cancelled) return
      setProfile(p)
      if (p) {
        setForm({
          name: p.name ?? '',
          company: p.company ?? '',
          contactPhone: p.contactPhone ?? '',
          taxVat: p.taxVat ?? '',
        })
      } else if (user) {
        setForm({
          name: user.fullName ?? '',
          company: '',
          contactPhone: '',
          taxVat: '',
        })
      }
      setIsLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!profile) return
    const changed =
      (form.name ?? '') !== (profile.name ?? '') ||
      (form.company ?? '') !== (profile.company ?? '') ||
      (form.contactPhone ?? '') !== (profile.contactPhone ?? '') ||
      (form.taxVat ?? '') !== (profile.taxVat ?? '')
    setHasChanges(changed)
  }, [form, profile])

  const handleSave = async () => {
    if (!hasChanges) return
    setIsSaving(true)
    try {
      const result = await updateProfile({
        name: form.name?.trim() || undefined,
        company: form.company?.trim() || undefined,
        contactPhone: form.contactPhone?.trim() || undefined,
        taxVat: form.taxVat?.trim() || undefined,
      })
      if (result.success) {
        setProfile((prev) => (prev ? { ...prev, ...form } : null))
        setHasChanges(false)
        toast.success('Profile updated')
      } else {
        toast.error(result.error ?? 'Failed to update profile')
      }
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setForm({
        name: profile.name ?? '',
        company: profile.company ?? '',
        contactPhone: profile.contactPhone ?? '',
        taxVat: profile.taxVat ?? '',
      })
    }
    setHasChanges(false)
  }

  if (isLoading) {
    return (
      <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card">
        <CardHeader>
          <div className="h-6 w-32 animate-pulse rounded bg-[rgb(var(--muted))]" />
          <div className="h-4 w-48 animate-pulse rounded bg-[rgb(var(--muted))]" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-11 animate-pulse rounded-lg bg-[rgb(var(--muted))]" />
          ))}
        </CardContent>
      </Card>
    )
  }

  const email = profile?.email ?? user?.email ?? ''
  const initials = (form.name ?? user?.fullName ?? email).slice(0, 2).toUpperCase() || '?'

  return (
    <Card className="rounded-2xl border border-[rgb(var(--border))] shadow-card transition-all duration-300 hover:shadow-card-hover">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your profile and business details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-full">
            <AvatarImage src={profile?.avatarUrl ?? user?.avatarUrl} alt="" />
            <AvatarFallback className="bg-probid-charcoal text-probid-accent text-lg font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Label htmlFor="profile-name">Full name</Label>
            <Input
              id="profile-name"
              value={form.name ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-email">Email</Label>
          <Input id="profile-email" value={email} disabled className="opacity-70" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-company">Company name</Label>
          <Input
            id="profile-company"
            value={form.company ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
            placeholder="Your company"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-phone">Contact phone</Label>
          <Input
            id="profile-phone"
            value={form.contactPhone ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, contactPhone: e.target.value }))}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-tax">Tax / VAT ID</Label>
          <Input
            id="profile-tax"
            value={form.taxVat ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, taxVat: e.target.value }))}
            placeholder="Optional"
          />
        </div>

        {profile?.payoutLast4 != null && (
          <div className="space-y-2">
            <Label>Payout account</Label>
            <p className="text-sm text-muted-foreground">
              Bank account ending in {maskPayout(profile.payoutLast4)}
            </p>
          </div>
        )}

        {hasChanges && (
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-probid-charcoal text-probid-accent hover:bg-probid-charcoal/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
