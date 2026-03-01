# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

neon yellow-green accents for CTAs, dark charcoal for nav, etc.
- API integrations:
  - Stripe (Billing and Webhooks) for subscriptions and invoices; support for idempotent webhooks.
  - Supabase for user data, auth, and Realtime updates (with proper RLS where applicable).
  - Admin approval endpoints for KYC status changes.
  - External services for KYC/identity checks and integration settings (configurable).
  - Optional integrations for notifications (email/SMS/push providers).
- Accessibility and UX notes:
  - All forms must have accessible labels, proper focus states, and error messaging.
  - Keyboard navigable, with clear visual hierarchy and feedback on actions.

## Components to Build
- SettingsDashboard
  - Layout with left navigation (sections) and right content panes; persistent bottom navigation as per design system.
- ProfileCard
  - Editable fields: name, email, company name, contact, payout/bank details (masked where appropriate).
  - Save/Cancel actions with optimistic UI and error handling.
- NotificationsPanel
  - Toggles for Email, SMS, Push; per-event toggles (Outbid, Auction Start, Inspection Scheduling).
  - Summary badge of enabled channels.
- SubscriptionPanel
  - Current plan summary, renewal date, next billing amount.
  - Actions: Upgrade/Downgrade, View Invoices, Manage Payment Methods (Stripe).
  - Invoices list with pagination; safe rendering with data ?? [].
- KYCPanel
  - Status badge (Pending, In Review, Verified, Rejected).
  - Admin actions: Approve, Request Changes, Reject (conditional on user role).
  - Guidance steps and required actions.
- IntegrationsPanel
  - List of integrations with toggles and configuration fields per integration.
  - Add/Remove integration capabilities where applicable.
- EnterpriseAPIKeysPanel
  - Key table: key name, scopes, created date, last used, status.
  - Actions: Generate Key, Regenerate, Revoke.
  - Copy-to-clipboard, and basic usage hints.
- SecurityPanel
  - Change Password form; 2FA enrollment status with action to enable/verify.
  - Active Sessions: list with device, location, last active, and Revoke option.
- ConfirmDialog / Toasts
  - Reusable confirmation dialogs for destructive actions (revoke API key, revoke sessions, etc.)
- Subcomponents
  - Field, Input, Select, Toggle, Button, Card, Avatar, SectionHeader
  - DataDisplay components for status and KPI-like visuals.

## Implementation Requirements

### Frontend
- Tech stack: Next.js (App Router), TypeScript, Tailwind CSS.
- Components must be modular, reusable, accessible, and theme-consistent.
- State management:
  - Use React useState/useEffect for local UI state.
  - Use useSWR or custom hooks for data fetching with null-safe patterns: e.g., const data = (apiResponse?.data ?? []).
  - All array-based rendering must guard against non-arrays and null: (items ?? []).map(...) or Array.isArray(items) ? items.map(...) : [].
- Data handling:
  - Initialize all arrays in useState with correct types, e.g., useState<Invoice[]>([]) for invoices.
  - Validate API responses before using: const invoices = Array.isArray(response?.data) ? response.data : [].
- Forms:
  - Controlled components with onChange handlers; validation per-field with inline error messages.
  - Debounced inputs where appropriate (e.g., API key names) to avoid unnecessary requests.
- API communications:
  - Centralized API client with error handling and retry logic.
  - Respect the CRITICAL runtime safety rules for all data manipulations.
- UI behavior:
  - Persist settings locally in state and submit via PATCH/PUT to backend endpoints.
  - Show optimistic UI updates for immediate feedback where appropriate (with rollback on error).
- Security:
  - Do not expose sensitive data in the frontend; redact tokens and keys in lists unless explicitly allowed.
  - Ensure 2FA and KYC admin flows require proper authorization checks.

### Backend
- Endpoints (examples; implement as per project conventions):
  - GET /api/settings/profile -> user profile data
  - PATCH /api/settings/profile -> update profile
  - GET /api/settings/notifications -> notification preferences
  - PATCH /api/settings/notifications -> update
  - GET /api/settings/subscription -> subscription details
  - POST /api/settings/subscription/upgrade -> upgrade/downgrade flow
  - GET /api/settings/kyc -> KYC status
  - POST /api/settings/kyc/approve -> admin approve
  - POST /api/settings/kyc/reject -> admin reject
  - GET /api/settings/integrations -> configured integrations
  - POST /api/settings/integrations -> add/update
  - GET /api/settings/apikeys -> enterprise API keys
  - POST /api/settings/apikeys -> generate key
  - POST /api/settings/apikeys/:id/regenerate -> regenerate
  - DELETE /api/settings/apikeys/:id -> revoke
  - GET /api/settings/sessions -> active sessions
  - POST /api/settings/sessions/:id/revoke -> revoke session
- Database modeling (Postgres with RLS):
  - users: id, profile fields, kyc_status, subscription_id, 2fa_enabled, etc.
  - subscriptions: id, plan_id, status, current_period_end, invoicing
  - invoices: id, subscription_id, amount_due, status, period_start, period_end
  - kycs: id, user_id, status, reviewer_id, notes, created_at
  - integrations: id, user_id, type, config_json
  - api_keys: id, user_id, name, key_hash, scopes, created_at, last_used_at, status
  - sessions: id, user_id, device, last_active, ip_address, is_active
- Validation and safety:
  - Validate inputs server-side with strict schemas.
  - Use idempotent Stripe webhooks for billing events.
  - Enforce RBAC for admin-only endpoints (KYC approvals, API key revocation, etc.).
- Data integrity:
  - Ensure null-safe joins; expose defaults in responses.

### Integration
- Connect frontend to backend through the centralized API client.
- Stripe:
  - Retrieve current plan/invoices; initiate upgrades/downgrades; handle payment methods.
  - Webhook endpoints on the backend must be idempotent and auditable.
- Supabase:
  - Use Realtime for any live updates (e.g., subscription status changes, KYC review status) if applicable.
- Admin workflow:
  - KYC status updates trigger notifications to users and admin dashboards.
  - Ensure that gating logic in the frontend reflects backend decisions in near real-time.
- Notifications:
  - Wire up email/SMS/push providers per project conventions; allow per-event controls in UI.

## User Experience Flow
- Step 1: User lands on Settings / Preferences; sees a dashboard with sections: Profile, Notifications, Subscription, KYC, Integrations, Enterprise API Keys, Security.
- Step 2: Profile: User edits fields, clicks Save; UI validates, shows success or error, persists via PATCH.
- Step 3: Notifications: User toggles channels and per-event preferences; changes saved via PATCH; a summary banner confirms changes.
- Step 4: Subscription: User views current plan, next renewal; clicks Upgrade/Downgrade; Stripe handles billing; on success, UI updates to reflect new plan; invoices listed with download.
- Step 5: KYC: User views status; if Pending/Requires Action, guidance shown; if Admin action required, user is prompted to upload additional docs or await admin review.
- Step 6: Integrations: User configures integrations; saves configurations; enabled toggles reflect status; errors shown inline.
- Step 7: Enterprise API Keys: Admin/enterprise user can generate a new key, name it, set scopes; keys are stored securely; user can Regenerate or Revoke; key material is shown once at creation with safe handling.
- Step 8: Security: User can change password, enroll in 2FA; view active sessions and revoke as needed.
- Step 9: All changes show non-intrusive toasts; errors show inline with actionable steps.

## Technical Specifications

Data Models: (Key fields to design)
- users: id, email, name, company, contact_phone, payout_account_id, kyc_status, two_fa_enabled, etc.
- subscriptions: id, user_id, plan_id, status, current_period_end, trial_end
- plans: id, name, stripe_plan_id, features
- invoices: id, subscription_id, amount_due, currency, status, period_start, period_end
- kycs: id, user_id, status, submitted_at, reviewed_at, reviewer_id, notes
- integrations: id, user_id, type, config_json
- api_keys: id, user_id, name, key_hash, scopes, created_at, last_used_at, status
- sessions: id, user_id, device, os, location, last_active, ip, is_active

API Endpoints: Routes and methods (summaries)
- GET /api/settings/profile
- PATCH /api/settings/profile
- GET /api/settings/notifications
- PATCH /api/settings/notifications
- GET /api/settings/subscription
- POST /api/settings/subscription/upgrade
- POST /api/settings/subscription/downgrade
- GET /api/settings/invoices
- GET /api/settings/kyc
- POST /api/settings/kyc/approve (admin)
- POST /api/settings/kyc/reject (admin)
- GET /api/settings/integrations
- POST /api/settings/integrations
- PATCH /api/settings/integrations/:id
- GET /api/settings/apikeys
- POST /api/settings/apikeys
- POST /api/settings/apikeys/:id/regenerate
- DELETE /api/settings/apikeys/:id
- GET /api/settings/sessions
- POST /api/settings/sessions/:id/revoke

Security
- Authentication: JWT/session-based; ensure protected routes.
- Authorization: Role-based (user, admin, enterprise) with checks on KYC approvals and API key management.
- Data integrity: Validate all inputs; sanitize; avoid leaking sensitive fields.
- Webhooks: Idempotent handling for Stripe; proper event verification.

Validation
- Validate all input fields with clear error messages.
- Use server-side validation in addition to client-side.
- Guard all array operations in frontend with (array ?? []).map(...) and Array.isArray checks.

Acceptance Criteria
- [ ] Settings page loads with all sections and shows correct initial values from backend.
- [ ] Profile updates persist and reflect instantly with no crashes; null-safe rendering of lists (invoices, API keys, sessions).
- [ ] Notification toggles save and reflect correctly; per-event settings functional.
- [ ] Subscription shows current plan, next billing, and can upgrade/downgrade; invoices retrievable; Stripe webhooks idempotent.
- [ ] KYC status displays correctly; admin actions available when user is in a reviewable state; gating reflects admin decisions.
- [ ] Integrations can be added/edited; configuration saved; toggles reflect state.
- [ ] Enterprise API Keys: ability to generate, regenerate, revoke; proper access control; keys not exposed beyond creation view.
- [ ] Security: password change, 2FA enrollment, sessions listing with revoke option; all actions acknowledged with toasts.
- [ ] All array data rendering guarded to avoid runtime errors with null/undefined results.

UI/UX Guidelines
- Apply the project's design system thoroughly:
  - Neon yellow-green (#EFFD2D) for CTAs and highlights.
  - Dark charcoal (#161616) for navigation and icons.
  - Crisp white cards (#FFFFFF) with soft shadows.
  - Very light gray backgrounds (#F5F6FA) for separation.
  - Use consistent spacing (8–16px gaps; 12–16px internal padding).
  - Accessible typography with Inter-like font; weights 400/500/700.
  - Card design with rounded corners (12–16px) and subtle elevation.
  - Bottom fixed navigation with pill-shaped background and active neon highlight.
  - Minimalist data visualization for any charts or bars (neon fill for active, light gray for inactive).

Mandatory Coding Standards — Runtime Safety
- Supabase results guarded:
  - const items = data ?? [];
  - (items ?? []).map(...) or Array.isArray(items) ? items.map(...) : [].
- useState initializations:
  - const [invoices, setInvoices] = useState<Invoice[]>([]);
  - const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  - etc., never use useState() for arrays/objects.
- API response validation:
  - const profile = Array.isArray(response?.data) ? response.data[0] : {};
  - const invoicesList = Array.isArray(response?.data?.invoices) ? response.data.invoices : [];
- Optional chaining:
  - const kycStatus = res?.data?.kyc_status;
- Destructuring with defaults:
  - const { items = [], count = 0 } = response ?? {};

Project Context Notes
- Target Platform: ProBid real-time B2B asset auction platform.
- Core stack: Frontend Next.js (App Router) + TypeScript + Tailwind; Backend Supabase (Postgres, Realtime, Edge Functions); Stripe for payments; Admin/Ops workflow; RBAC and KYC gating.
- Emphasis: Reuse-first modules; ensure Settings page aligns with Buyer Subscription & Verification gating; support admin approvals for KYC.

Deliverables
- Fully implemented Settings / Preferences page with all sub-sections described.
- Frontend components, hooks, and styles aligned to the design system.
- Backend API routes with input validation, RBAC, and Stripe integration hooks.
- Documentation within code: JSDoc/TSDoc where appropriate; README-level overview of settings endpoints and data flows.
- Tests (unit/integration) covering:
  - Null-safety and array rendering guards.
  - Subscription gating logic tied to KYC status.
  - Admin approval workflow triggers and UI changes.
  - API key generation/regeneration/revocation flows.
  - Data validation for profile, notifications, and integration configurations.

Notes for AI Development Tool
- Build components with clear separation of concerns and prop-driven data.
- Include error boundary handling for each panel.
- Ensure all user-facing strings are i18n-ready placeholders if your project supports localization.
- Provide feature flags or environment toggles to enable/disable enterprise API keys and admin-only workflows if needed.
- Include unit tests and example mock data that adhere to the runtime safety patterns described above.

This prompt defines a comprehensive, safe, and scalable Settings / Preferences feature that integrates the Buyer Subscription & Verification gating, aligns with the specified tech stack, and adheres to the strict runtime safety constraints specified.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
