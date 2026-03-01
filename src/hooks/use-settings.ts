/**
 * Settings hooks - React Query for profile, notifications, subscription, KYC, integrations, API keys, sessions.
 * All array/object results guarded per runtime safety rules.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  fetchProfile,
  updateProfile,
  fetchNotifications,
  updateNotifications,
  fetchSubscription,
  fetchInvoices,
  fetchKyc,
  approveKyc,
  rejectKyc,
  fetchIntegrations,
  updateIntegration,
  fetchApiKeys,
  createApiKey,
  regenerateApiKey,
  revokeApiKey,
  fetchSessions,
  revokeSession,
  changePassword,
} from '@/api/settings'
import type {
  SettingsProfilePayload,
  SettingsNotificationsPayload,
  CreateApiKeyPayload,
} from '@/types/settings'

export const settingsKeys = {
  all: ['settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  subscription: () => [...settingsKeys.all, 'subscription'] as const,
  invoices: () => [...settingsKeys.all, 'invoices'] as const,
  kyc: () => [...settingsKeys.all, 'kyc'] as const,
  integrations: () => [...settingsKeys.all, 'integrations'] as const,
  apiKeys: () => [...settingsKeys.all, 'apikeys'] as const,
  sessions: () => [...settingsKeys.all, 'sessions'] as const,
}

export function useProfile() {
  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: fetchProfile,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SettingsProfilePayload) => updateProfile(payload),
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: settingsKeys.profile() })
        toast.success('Profile updated')
      } else {
        toast.error(data?.error ?? 'Failed to update profile')
      }
    },
    onError: () => {
      toast.error('Failed to update profile')
    },
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: settingsKeys.notifications(),
    queryFn: fetchNotifications,
  })
}

export function useUpdateNotifications() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: SettingsNotificationsPayload) => updateNotifications(payload),
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: settingsKeys.notifications() })
        toast.success('Notification preferences saved')
      } else {
        toast.error(data?.error ?? 'Failed to save preferences')
      }
    },
    onError: () => {
      toast.error('Failed to save preferences')
    },
  })
}

export function useSubscription() {
  return useQuery({
    queryKey: settingsKeys.subscription(),
    queryFn: fetchSubscription,
  })
}

export function useInvoices() {
  return useQuery({
    queryKey: settingsKeys.invoices(),
    queryFn: fetchInvoices,
  })
}

export function useKyc() {
  return useQuery({
    queryKey: settingsKeys.kyc(),
    queryFn: fetchKyc,
  })
}

export function useApproveKyc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: approveKyc,
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: settingsKeys.kyc() })
        toast.success('KYC approved')
      } else {
        toast.error(data?.error ?? 'Failed to approve KYC')
      }
    },
    onError: () => toast.error('Failed to approve KYC'),
  })
}

export function useRejectKyc() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (notes?: string) => rejectKyc(notes),
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: settingsKeys.kyc() })
        toast.success('KYC rejected')
      } else {
        toast.error(data?.error ?? 'Failed to reject KYC')
      }
    },
    onError: () => toast.error('Failed to reject KYC'),
  })
}

export function useIntegrations() {
  return useQuery({
    queryKey: settingsKeys.integrations(),
    queryFn: fetchIntegrations,
  })
}

export function useUpdateIntegration() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) =>
      updateIntegration(id, payload),
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: settingsKeys.integrations() })
        toast.success('Integration updated')
      } else {
        toast.error(data?.error ?? 'Failed to update integration')
      }
    },
    onError: () => {
      toast.error('Failed to update integration')
    },
  })
}

export function useApiKeys() {
  return useQuery({
    queryKey: settingsKeys.apiKeys(),
    queryFn: fetchApiKeys,
  })
}

export function useCreateApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateApiKeyPayload) => createApiKey(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.apiKeys() })
      toast.success('API key created')
    },
    onError: () => {
      toast.error('Failed to create API key')
    },
  })
}

export function useRegenerateApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => regenerateApiKey(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: settingsKeys.apiKeys() })
      toast.success('API key regenerated')
    },
    onError: () => {
      toast.error('Failed to regenerate API key')
    },
  })
}

export function useRevokeApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: settingsKeys.apiKeys() })
        toast.success('API key revoked')
      } else {
        toast.error(data?.error ?? 'Failed to revoke API key')
      }
    },
    onError: () => {
      toast.error('Failed to revoke API key')
    },
  })
}

export function useSessions() {
  return useQuery({
    queryKey: settingsKeys.sessions(),
    queryFn: fetchSessions,
  })
}

export function useRevokeSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: (data) => {
      if (data?.success) {
        qc.invalidateQueries({ queryKey: settingsKeys.sessions() })
        toast.success('Session revoked')
      } else {
        toast.error(data?.error ?? 'Failed to revoke session')
      }
    },
    onError: () => {
      toast.error('Failed to revoke session')
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
    onSuccess: (result) => {
      if (result?.success) {
        toast.success('Password changed')
      } else {
        toast.error(result?.error ?? 'Failed to change password')
      }
    },
    onError: (e) => {
      toast.error(e instanceof Error ? e.message : 'Failed to change password')
    },
  })
}
