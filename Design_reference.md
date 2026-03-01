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

- Adhere to color palette, typography, and layout constraints described in Visual Style.
- Cards with rounded corners, subtle shadows, and neon yellow-green accents for CTAs.
- Persistent bottom navigation with icons; data visualizations use minimalist horizontal bars in neon yellow-green.
- Buttons: uppercase, bold, neon yellow-green filled or outlined depending on action.
- Ensure strong data hierarchy: current bid, time remaining, and reserve status are prominent.

## Visual Style

Color Palette:
- Primary background: #FFFFFF
- Secondary background: #F5F6FA
- Primary accent: Neon yellow-green #EFFD2D
- Secondary accent: #161616
- Text primary: #181818
- Text secondary: #7E7E7E
- Borders/dividers: #E5E5EA
- Success: #2ED573
- Error: #FF4D4F
- Tertiary accent: #FFFACD

Typography & Layout:
- Font: Inter or equivalent
- Weights: 400, 500, 700
- Grid/padding: Outer 20–24px, inner 12–16px; vertical stacking
- Spacing: 8–16px between elements

Key Design Elements:
- Card with 12–16px radius; soft shadow
- Hover state: glow with neon yellow-green
- Data Viz: minimalist horizontal bars
- Interactive elements: rounded buttons with neon fill or outline

Design Philosophy:
- Modern, minimal, high contrast
- Clarity and scan-ability
- Professional yet energetic accent

## Mandatory Coding Standards — Runtime Safety

CRITICAL: All generated code must guard against null/undefined values before calling array methods.

1. Supabase query results: Always use nullish coalescing — const items = data ?? [].
2. Array methods: Guard calls with (items ?? []).map(...) or Array.isArray(items) ? items.map(...) : [].
3. React useState for arrays/objects: Initialize arrays as useState<Type[]>([]) everywhere.
4. API response shapes: Validate — const list = Array.isArray(response?.data) ? response.data : [].
5. Optional chaining: Use obj?.property?.nested consistently for nested API results.
6. Destructuring with defaults: const { items = [], count = 0 } = response ?? {}.

## Data Models (Schema Details)

- Listing
  - id (UUID)
  - title (string)
  - description (string)
  - specs_json (JSON)
  - vin_like_id (string)
  - provenance (string)
  - batch_id (UUID)
  - auction_schedule_id (UUID)
  - media_json (JSON)
  - ai_qa_json (JSON)
  - created_at, updated_at (timestamps)

- Media
  - id (UUID)
  - listing_id (FK -> Listing)
  - type (enum: image/video)
  - url (string)
  - angle_tag (string)
  - position (int)

- AiQaReport
  - id (UUID)
  - listing_id (FK)
  - structured_json (JSON)
  - confidence (float)
  - flags_json (JSON)
  - evidence_images_json (JSON)

- AuctionBatch
  - id (UUID)
  - start_time (timestamp)
  - end_time (timestamp)
  - status (enum: scheduled/ongoing/ended)
  - reserve (numeric)
  - current_highest_bid (numeric)

- Bid
  - id (UUID)
  - listing_id (FK)
  - user_id (FK)
  - amount (numeric)
  - created_at (timestamp)
  - is_proxy (boolean)
  - proxy_max (numeric, nullable)
  - status (enum: accepted/outbid/under-review)

- Watchlist
  - id (UUID)
  - user_id (FK)
  - listing_id (FK)
  - created_at (timestamp)
  - prefs_json (JSON)

- NotificationPreference
  - id (UUID)
  - user_id (FK)
  - channel (enum: email/sms/in-app)
  - enabled (boolean)
  - prefs_json (JSON)

- User
  - id (UUID)
  - name, email, phone
  - verified (boolean)
  - deposits (numeric)

- EventLog (for analytics)
  - id
  - listing_id
  - event_type
  - payload_json
  - created_at

## API Endpoints (Routes & Methods)

- GET /api/listings/:id
- GET /api/listings/:id/bids
- POST /api/listings/:id/bids
- POST /api/listings/:id/proxy-bids
- POST /api/listings/:id/join-live
- GET /api/listings/:id/ai-qa
- GET /api/listings/:id/media
- GET /api/search
- POST /api/watchlist
- GET /api/notifications/prefs
- POST /api/notifications/prefs

Security:
- Use session-based auth, enforce RBAC, and Supabase Row-Level Security (RLS).
- Validate all inputs server-side; sanitize all external API responses.

Validation Rules:
- Bid amounts must be >= minimum increment and <= user deposit or payment limit.
- Proxy bid max must be >= current bid + min_increment.
- Media uploads validated for count (15–25) and angle coverage.
- AI QA results must be structured JSON per provider interface.

## Acceptance Criteria (Expanded)
- Robust null-safety in all data paths (see Runtime Safety section).
- Real-time bidding and live room updates function correctly under high concurrency with no race conditions.
- AI QA pipeline is pluggable; new providers can be swapped with minimal code changes.
- End-to-end notifications trigger accurately and are deduplicated via idempotent webhooks.
- Caching strategies deliver sub-second UI for listing detail and near-zero backend latency.

## Additional Guidelines

- Use a modular architecture with clear contracts between frontend components, API adapters, and backend services.
- Emphasize testability: unit tests for data adapters, integration tests for bidding logic, and end-to-end tests for Live Auction Room flows.
- Document decisions for AI QA provider boundaries, enrichment caching, and edge caching strategies.
- Ensure the codebase enforces null-safety patterns by default and provides guard rails for all array-like data manipulations.

If you need, I can tailor this prompt further to match your tooling (e.g., specific AI coding tool, LLM prompt style, or a test plan scaffold).

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
