/**
 * SettingsDashboard - Layout with left nav (sections) and right content panes.
 * Persistent bottom navigation on mobile per design system.
 */
import { useState } from 'react'
import { User, Bell, CreditCard, ShieldCheck, Plug, Key, Shield } from 'lucide-react'
import { ProfileCard } from './profile-card'
import { NotificationsPanel } from './notifications-panel'
import { SubscriptionPanel } from './subscription-panel'
import { KYCPanel } from './kyc-panel'
import { IntegrationsPanel } from './integrations-panel'
import { EnterpriseAPIKeysPanel } from './enterprise-api-keys-panel'
import { SecurityPanel } from './security-panel'
import { cn } from '@/lib/utils'

type SectionId =
  | 'profile'
  | 'notifications'
  | 'subscription'
  | 'kyc'
  | 'integrations'
  | 'apikeys'
  | 'security'

const SECTIONS: { id: SectionId; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'subscription', label: 'Subscription', icon: CreditCard },
  { id: 'kyc', label: 'KYC', icon: ShieldCheck },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'apikeys', label: 'API Keys', icon: Key },
  { id: 'security', label: 'Security', icon: Shield },
]

function SectionContent({ section }: { section: SectionId }) {
  switch (section) {
    case 'profile':
      return <ProfileCard />
    case 'notifications':
      return <NotificationsPanel />
    case 'subscription':
      return <SubscriptionPanel />
    case 'kyc':
      return <KYCPanel />
    case 'integrations':
      return <IntegrationsPanel />
    case 'apikeys':
      return <EnterpriseAPIKeysPanel />
    case 'security':
      return <SecurityPanel />
    default:
      return <ProfileCard />
  }
}

export function SettingsDashboard() {
  const [active, setActive] = useState<SectionId>('profile')

  return (
    <div className="container mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1 text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left nav - desktop */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200',
                  active === id
                    ? 'bg-primary text-primary-foreground shadow-accent-glow'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1">
          <div className="animate-in-up">
            <SectionContent section={active} />
          </div>
        </main>
      </div>

      {/* Bottom nav - mobile: scrollable pill with all sections */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 overflow-x-auto rounded-t-2xl border-t border-[rgb(var(--border))] bg-probid-charcoal px-2 py-2 shadow-[0_-4px_20px_rgba(22,22,22,0.15)] md:hidden">
        <div className="flex min-w-max items-center justify-start gap-1">
          {SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={cn(
                'flex min-h-[44px] min-w-[44px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 transition-colors',
                active === id ? 'bg-[rgba(239,253,45,0.15)] text-probid-accent' : 'text-white/70 hover:text-white'
              )}
              aria-label={label}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">
                {id === 'apikeys' ? 'API' : id === 'integrations' ? 'Integ' : label.length > 8 ? label.slice(0, 7) + '…' : label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile bottom nav */}
      <div className="h-20 md:hidden" />
    </div>
  )
}
