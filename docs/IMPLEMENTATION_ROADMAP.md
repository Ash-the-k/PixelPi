# PixelPi Technologies
# IMPLEMENTATION_ROADMAP.md

> Execution reference for the React frontend redesign.
> This document is the single source of truth for implementation decisions,
> build order, and delivery planning.
>
> Design decisions are locked in DESIGN_VISION.md.
> Backend contracts are locked in api-reference.md.
> This document governs how both are implemented.
>
> Each future week should be expanded into its own day-by-day plan
> before that week begins, based on actual project progress and
> discoveries made during implementation.

---

## Document Map

- [Implementation Status — Updated](#implementation-status--updated)

1. [Design Vision Summary](#1-design-vision-summary)
2. [Final Stack](#2-final-stack)
3. [Project Architecture](#3-project-architecture)
4. [Folder Structure](#4-folder-structure)
5. [Route Structure](#5-route-structure)
6. [API Integration Strategy](#6-api-integration-strategy)
7. [Tailwind Configuration](#7-tailwind-configuration)
8. [Shared Component Inventory](#8-shared-component-inventory)
9. [Public Website — Page Breakdown](#9-public-website--page-breakdown)
10. [Admin Dashboard — Page Breakdown](#10-admin-dashboard--page-breakdown)
11. [Recommended Build Order](#11-recommended-build-order)
12. [Week-by-Week Milestones](#12-week-by-week-milestones)
13. [Day 1–Day 7 — Week 1 Detail Plan](#13-day-1day-7--week-1-detail-plan)
14. [Risks and Dependencies](#14-risks-and-dependencies)
15. [Definition of Done](#15-definition-of-done)

---

## Implementation Status — Updated

### Completed (Days 1–5)
- Full project scaffold: Vite, React, Tailwind 3, React Router, TanStack Query,
  Framer Motion, React Hook Form, Zod, Axios, React Helmet, Lucide React
- CSS custom property token system (index.css)
- Tailwind config with full design token mapping
- API layer: client.js, public.js, admin.js
- AuthContext + ProtectedRoute
- All routes defined
- ScrollToTop (route restoration)
- Navbar: glass pill desktop, expanding mobile container
- Footer: 4-column, custom SVG social icons, WhatsApp token
- LogoMark: final logo.png implemented, two-line wordmark
- ScrollToTopButton: floating glass pill, bottom-right
- Homepage: fully complete and finalized (see deviations below)

### Homepage Section Order (final)
Hero → Services → ProjectMetrics → Industries →
ProjectsTeaser → CollaborationTeaser → Newsletter

### Deviations from Original Roadmap
- TrustSignalBar: removed (metrics live in Hero strip, hidden md:grid)
- TrustSignalBar is the metrics strip inside Hero.jsx — not a separate component
- Single source of truth for metrics: `src/data/metrics.js`
  (COMPANY_METRICS imported by Hero.jsx and ProjectMetrics.jsx)
- WhyUs: removed from homepage, deferred to /about
- ProjectMetrics: kept as full section despite Hero strip (founder review pending)
- Industries: rebuilt as horizontal-rule table (Option C pattern),
  old chip layout discarded
- ProjectsTeaser: rotating showcase (not card grid) — featured image left,
  supporting cards right on desktop, dot indicators + swipe on mobile,
  4s auto-rotation with progress bar, uses useFeaturedGallery hook
- CollaborationTeaser: two-panel tabbed layout with process steps,
  Framer Motion AnimatePresence on panel content
- shadcn/ui: confirmed scoped to admin only, not used on public site

> Ased founder for content for About page, the content of this page on hold until then, procced with other implementation.

---

## 1. Design Vision Summary

Source of truth: `DESIGN_VISION.md`. All visual decisions below are derived from it.
Do not make design decisions during implementation that contradict this summary.

### Brand Character

PixelPi is a precision engineering company. The design communicates technical
authority and enterprise credibility. The primary audience is a B2B client
evaluating vendors. Every design decision serves that person's evaluation process.

Tone: serious, technical, authoritative. Not playful, not startup-casual.

### Public Site Aesthetic

Dark-dominant. Deep cool blue-black backgrounds. References: Linear, Vercel,
Raycast. Not cyberpunk. Not gaming. Not agency portfolio.

Glass surfaces used sparingly on cards and the navbar. Technical texture (circuit
trace or dot grid) in 1–2 sections maximum at 3–5% opacity. Every visual element
earns its place through hierarchy or credibility — decoration is banned.

### Admin Aesthetic

Light content surface with a dark brand sidebar. Inter only — no Space Grotesk
in the admin. Efficient and information-dense, not editorial. shadcn/ui components
throughout. Gradient appears only at: sidebar logo, login header, dashboard
welcome area.

### Color Tokens (implement as CSS custom properties)

```css
/* Public — Backgrounds */
--color-bg-base:         #080C14;
--color-bg-elevated:     #0D1220;
--color-bg-subtle:       #131928;
--color-border:          rgba(255, 255, 255, 0.08);
--color-border-strong:   rgba(255, 255, 255, 0.14);

/* Public — Text */
--color-text-primary:    #F0F2F8;
--color-text-secondary:  rgba(240, 242, 248, 0.70);
--color-text-muted:      rgba(240, 242, 248, 0.45);
--color-text-disabled:   rgba(240, 242, 248, 0.25);

/* Brand Gradient */
--gradient-brand:        linear-gradient(135deg, #332055, #3C4D93);
--gradient-brand-text:   linear-gradient(135deg, #7B4FBF, #6B8CFF);

/* Brand Accent — Solid */
--color-accent:          #4F6BCC;
--color-accent-hover:    #6B8CFF;
--color-accent-subtle:   rgba(79, 107, 204, 0.12);

/* Semantic */
--color-success:         #22C55E;
--color-warning:         #F59E0B;
--color-error:           #EF4444;
--color-info:            #38BDF8;

/* Admin — Surfaces */
--admin-bg-base:         #F8F9FB;
--admin-bg-surface:      #FFFFFF;
--admin-bg-subtle:       #F1F3F7;
--admin-border:          #E2E6EE;
--admin-text-primary:    #111827;
--admin-text-secondary:  #4B5563;
--admin-text-muted:      #9CA3AF;

/* Admin — Sidebar */
--sidebar-bg:            #0D1220;
--sidebar-text:          rgba(240, 242, 248, 0.80);
--sidebar-text-active:   #F0F2F8;
--sidebar-border:        rgba(255, 255, 255, 0.06);
--sidebar-hover:         rgba(255, 255, 255, 0.05);
--sidebar-active:        rgba(79, 107, 204, 0.18);

/* Admin — Accent */
--admin-accent:          #4F6BCC;
--admin-accent-hover:    #3D5AB8;
--admin-accent-subtle:   rgba(79, 107, 204, 0.10);

/* Animation */
--duration-fast:         175ms;
--duration-moderate:     275ms;
--easing-standard:       cubic-bezier(0.4, 0, 0.2, 1);
--easing-enter:          cubic-bezier(0.0, 0.0, 0.2, 1);
--easing-exit:           cubic-bezier(0.4, 0.0, 1, 1);

/* Border Radius */
--radius-sm:             4px;
--radius-md:             6px;
--radius-lg:             10px;
--radius-xl:             16px;
--radius-full:           9999px;

/* Max Widths */
--max-width-content:     1200px;
--max-width-text:        720px;
--max-width-narrow:      560px;
```

### Typography

| Role             | Font          | Weights    |
|------------------|---------------|------------|
| Display (H1, H2) | Space Grotesk | 500/600/700|
| UI & Body        | Inter         | 400/500/600|
| Mono / Technical | IBM Plex Mono | 400/500    |

Admin uses Inter only. Space Grotesk does not appear in admin.

### Navigation (Public)

Floating glass pill, horizontally centered, fixed. 4 items + 1 CTA button.

```
[PixelPi Logo]    About  Projects  Blog  Careers    [Get in Touch]
```

"Get in Touch" is a gradient-filled button — not a plain link.
On mobile: collapses to full-width bar with hamburger drawer.

### Sitemap

```
/               Home (multi-section)
/about          About (placeholder content at launch)
/projects       Projects / Portfolio
/blog           Blog listing
/blog/:slug     Blog post
/careers        Career openings + application form
/contact        Unified contact form

/admin          Admin shell (redirect to /admin/dashboard)
/admin/login    Admin login
/admin/dashboard
/admin/blog
/admin/blog/new
/admin/blog/:id/edit
/admin/applications
/admin/contacts
/admin/newsletters
/admin/collaborations
/admin/gallery
/admin/career-openings
/admin/audit-logs
/admin/analytics
/admin/security
/admin/settings
```

---

## 2. Final Stack

```
Vite 5            Build tooling, dev server, production bundler
React 18          UI framework
React Router 6    Client-side routing (public + admin)
Tailwind CSS 3    Utility-first styling
Axios             HTTP client — single configured instance with JWT interceptor
TanStack Query 5  Server state management, caching, mutations
React Hook Form   Form state and validation (all forms)
Framer Motion     Animation — scroll reveals, page transitions (public site only)
shadcn/ui         Admin component library (Radix UI primitives, copy-paste)
React Helmet      Meta tags for SEO on public pages
Lucide React      Icon library — used throughout, never mixed with other icon sources
```

**Why each item is included:**

- TanStack Query replaces 20+ manual useEffect+useState data fetch blocks. The admin panel alone has 12+ data tables with mutations. The library pays for itself in Week 2.
- React Hook Form is required for the career application form (10+ fields, file upload, validation). Do not manage that form with useState.
- Framer Motion handles scroll-triggered entrance animations on the public site. Admin uses CSS transitions only.
- shadcn/ui is a copy-paste library, not an import. It generates no public-site bundle overhead. Used exclusively in the admin.
- React Helmet is one import. Required for blog post meta tags. Do not ship without it.

**Excluded deliberately:**

- Redux / Zustand — not needed. TanStack Query owns server state. AuthContext owns auth state. That covers everything.
- NextJS / SSR — out of scope. The backend is Express. SSR adds deployment complexity that is not justified at this scale.
- CSS Modules / styled-components — Tailwind covers all styling needs.

---

## 3. Project Architecture

### Overview

```
Nginx
├── Serves /admin/* and /* as static React build (dist/)
└── Proxies /api/* to Express backend (port 3000)

Express Backend (existing — not modified)
└── MySQL / JSON fallback (existing — not modified)
```

### Frontend Internal Architecture

```
Public Site     → Dark theme, Space Grotesk, Framer Motion, custom components
Admin Panel     → Light theme + dark sidebar, Inter, shadcn/ui, functional density
Shared          → Axios instance, AuthContext, TanStack Query client, design tokens
```

Public and admin are separate visual and component systems. They share only:

- The Axios instance and API layer
- AuthContext (token storage, logout)
- TanStack Query client configuration
- CSS custom property tokens (defined once in `index.css`)
- Lucide React icon imports

They do NOT share:

- Button components
- Form components
- Layout components
- Any UI component with visual styling

This is explicitly required by DESIGN_VISION.md section 10.

### Axios Instance

One file. One instance. Configured once.

```js
// src/api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;
```

All API functions import from this client. No component ever calls axios directly.

### TanStack Query Client

```js
// src/main.jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});
```

### AuthContext

Stores: `{ user, token, login, logout }`.
Persists token to `localStorage`.
On mount: reads token, validates against `GET /api/admin/status`, sets user or clears.
All admin routes check `AuthContext` via `ProtectedRoute` before rendering.

---

## 4. Folder Structure

```
pixelpi-frontend/
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── src/
│   │
│   ├── api/
│   │   ├── client.js              # Axios instance (single source)
│   │   ├── public.js              # All public endpoint functions
│   │   └── admin.js               # All admin endpoint functions
│   │
│   ├── context/
│   │   └── AuthContext.jsx        # JWT storage, user state, login/logout
│   │
│   ├── hooks/
│   │   ├── useAuth.js             # Consumes AuthContext
│   │   ├── useBlogPosts.js        # TanStack Query — GET /api/blog
│   │   ├── useBlogPost.js         # TanStack Query — GET /api/blog/:slug
│   │   ├── useGallery.js          # TanStack Query — GET /api/gallery
│   │   ├── useCareerOpenings.js   # TanStack Query — GET /api/career-openings
│   │   ├── admin/
│   │   │   ├── useDashboard.js
│   │   │   ├── useAdminBlog.js
│   │   │   ├── useApplications.js
│   │   │   ├── useContacts.js
│   │   │   ├── useNewsletters.js
│   │   │   ├── useCollaborations.js
│   │   │   ├── useAdminGallery.js
│   │   │   ├── useCareerOpeningsCMS.js
│   │   │   ├── useAuditLogs.js
│   │   │   ├── useAnalytics.js
│   │   │   ├── useSecurity.js
│   │   │   └── useSettings.js
│   │
│   ├── components/
│   │   │
│   │   ├── public/                # Public site components ONLY
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Footer.jsx
│   │   │   │   └── PublicLayout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx           # Primary, secondary, ghost variants
│   │   │   │   ├── GlassCard.jsx        # Glass surface card
│   │   │   │   ├── SectionLabel.jsx     # IBM Plex Mono eyebrow label
│   │   │   │   ├── SectionHeading.jsx   # Space Grotesk display heading
│   │   │   │   ├── GradientText.jsx     # Gradient text wrapper
│   │   │   │   ├── Badge.jsx            # Small label/tag
│   │   │   │   ├── StatCard.jsx         # Metric display card
│   │   │   │   └── AnimatedSection.jsx  # Framer Motion scroll reveal wrapper
│   │   │   └── sections/              # Homepage section components
│   │   │       ├── Hero.jsx
│   │   │       ├── Services.jsx
│   │   │       ├── WhyUs.jsx
│   │   │       ├── ProjectMetrics.jsx
│   │   │       ├── Industries.jsx
│   │   │       ├── ProjectsTeaser.jsx
│   │   │       ├── CollaborationTeaser.jsx
│   │   │       ├── Newsletter.jsx
│   │   │       └── ContactSection.jsx
│   │   │
│   │   └── admin/                 # Admin components ONLY
│   │       ├── layout/
│   │       │   ├── AdminLayout.jsx
│   │       │   ├── AdminSidebar.jsx
│   │       │   └── AdminTopbar.jsx
│   │       └── ui/
│   │           ├── AdminButton.jsx
│   │           ├── AdminTable.jsx
│   │           ├── StatusBadge.jsx
│   │           ├── StatCard.jsx         # Admin variant
│   │           ├── PageHeader.jsx
│   │           ├── EmptyState.jsx
│   │           └── ConfirmDialog.jsx
│   │
│   ├── pages/
│   │   ├── public/
│   │   │   ├── HomePage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   ├── BlogPage.jsx
│   │   │   ├── BlogPostPage.jsx
│   │   │   ├── CareersPage.jsx
│   │   │   └── ContactPage.jsx
│   │   └── admin/
│   │       ├── LoginPage.jsx
│   │       ├── DashboardPage.jsx
│   │       ├── BlogListPage.jsx
│   │       ├── BlogEditPage.jsx
│   │       ├── ApplicationsPage.jsx
│   │       ├── ApplicationDetailPage.jsx
│   │       ├── ContactsPage.jsx
│   │       ├── NewslettersPage.jsx
│   │       ├── CollaborationsPage.jsx
│   │       ├── GalleryPage.jsx
│   │       ├── CareerOpeningsPage.jsx
│   │       ├── AuditLogsPage.jsx
│   │       ├── AnalyticsPage.jsx
│   │       ├── SecurityPage.jsx
│   │       └── SettingsPage.jsx
│   │
│   ├── routes/
│   │   ├── PublicRoutes.jsx       # All public route definitions
│   │   ├── AdminRoutes.jsx        # All admin route definitions
│   │   └── ProtectedRoute.jsx     # Auth guard wrapper
│   │
│   ├── utils/
│   │   ├── formatDate.js
│   │   ├── formatRelativeTime.js
│   │   └── cn.js                  # Tailwind class merge utility (clsx + twMerge)
│   │
│   ├── index.css                  # CSS custom properties + Tailwind base
│   └── main.jsx                   # App root, providers
│
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

---

## 5. Route Structure

### Public Routes

```jsx
// src/routes/PublicRoutes.jsx
<Route path="/" element={<PublicLayout />}>
  <Route index element={<HomePage />} />
  <Route path="about" element={<AboutPage />} />
  <Route path="projects" element={<ProjectsPage />} />
  <Route path="blog" element={<BlogPage />} />
  <Route path="blog/:slug" element={<BlogPostPage />} />
  <Route path="careers" element={<CareersPage />} />
  <Route path="contact" element={<ContactPage />} />
</Route>
```

### Admin Routes

```jsx
// src/routes/AdminRoutes.jsx
<Route path="/admin/login" element={<LoginPage />} />
<Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
  <Route index element={<Navigate to="dashboard" replace />} />
  <Route path="dashboard" element={<DashboardPage />} />
  <Route path="blog" element={<BlogListPage />} />
  <Route path="blog/new" element={<BlogEditPage />} />
  <Route path="blog/:id/edit" element={<BlogEditPage />} />
  <Route path="applications" element={<ApplicationsPage />} />
  <Route path="applications/:id" element={<ApplicationDetailPage />} />
  <Route path="contacts" element={<ContactsPage />} />
  <Route path="newsletters" element={<NewslettersPage />} />
  <Route path="collaborations" element={<CollaborationsPage />} />
  <Route path="gallery" element={<GalleryPage />} />
  <Route path="career-openings" element={<CareerOpeningsPage />} />
  <Route path="audit-logs" element={<AuditLogsPage />} />
  <Route path="analytics" element={<AnalyticsPage />} />
  <Route path="security" element={<SecurityPage />} />
  <Route path="settings" element={<SettingsPage />} />
</Route>
```

### ProtectedRoute

```jsx
// src/routes/ProtectedRoute.jsx
export function ProtectedRoute({ children }) {
  const { token, isLoading } = useAuth();
  if (isLoading) return <AdminLoadingScreen />;
  if (!token) return <Navigate to="/admin/login" replace />;
  return children;
}
```

---

## 6. API Integration Strategy

### Principle

No component ever calls Axios directly. All API calls go through:

1. `src/api/public.js` or `src/api/admin.js` — typed function wrappers
2. `src/hooks/` — TanStack Query hooks that consume those functions
3. Page components and section components — consume hooks only

### Public API Functions (`src/api/public.js`)

```js
import client from './client';

export const api = {
  // Health
  health: () => client.get('/api/health'),

  // Contact / Collaboration / Newsletter
  submitContact: (data) => client.post('/api/contact', data),
  submitCollaboration: (data) => client.post('/api/collaboration', data),
  subscribeNewsletter: (data) => client.post('/api/newsletter', data),

  // Blog
  getBlogPosts: (params) => client.get('/api/blog', { params }),
  getBlogPost: (slug) => client.get(`/api/blog/${slug}`),

  // Careers
  getCareerOpenings: () => client.get('/api/career-openings'),
  submitApplication: (formData) => client.post('/api/careers/apply', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  // Gallery
  getGallery: () => client.get('/api/gallery'),
};
```

### Admin API Functions (`src/api/admin.js`)

```js
import client from './client';

export const adminApi = {
  // Auth
  login: (credentials) => client.post('/api/admin/login', credentials),
  logout: () => client.post('/api/admin/logout'),
  status: () => client.get('/api/admin/status'),

  // Dashboard
  getDashboardStats: () => client.get('/api/admin/dashboard/stats'),
  getDashboardOverview: () => client.get('/api/admin/dashboard/overview'),

  // Blog
  getBlogPosts: () => client.get('/api/admin/blog'),
  getBlogPost: (id) => client.get(`/api/admin/blog/${id}`),
  createBlogPost: (data) => client.post('/api/admin/blog', data),
  updateBlogPost: (id, data) => client.put(`/api/admin/blog/${id}`, data),
  deleteBlogPost: (id) => client.delete(`/api/admin/blog/${id}`),

  // Applications
  getApplications: () => client.get('/api/admin/applications'),
  getApplication: (id) => client.get(`/api/admin/applications/${id}`),
  updateApplicationStatus: (id, status) =>
    client.put(`/api/admin/applications/${id}/status`, { status }),

  // Contacts
  getContacts: () => client.get('/api/admin/contacts'),
  updateContactStatus: (id, status) =>
    client.put(`/api/admin/contacts/${id}/status`, { status }),

  // Newsletters
  getNewsletters: () => client.get('/api/admin/newsletters'),

  // Collaborations
  getCollaborations: () => client.get('/api/admin/collaborations'),
  updateCollaborationStatus: (id, status) =>
    client.put(`/api/admin/collaborations/${id}/status`, { status }),

  // Gallery
  getGallery: () => client.get('/api/admin/gallery'),
  uploadGalleryImage: (formData) => client.post('/api/admin/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  updateGalleryImage: (filename, data) =>
    client.put(`/api/admin/gallery/${filename}`, data),
  deleteGalleryImage: (filename) =>
    client.delete(`/api/admin/gallery/${filename}`),

  // Career Openings
  getCareerOpenings: () => client.get('/api/admin/career-openings'),
  createCareerOpening: (data) => client.post('/api/admin/career-openings', data),
  updateCareerOpening: (id, data) => client.put(`/api/admin/career-openings/${id}`, data),
  deleteCareerOpening: (id) => client.delete(`/api/admin/career-openings/${id}`),

  // System
  getAuditLogs: () => client.get('/api/admin/audit-logs'),
  getAnalytics: () => client.get('/api/admin/analytics'),
  getSecurity: () => client.get('/api/admin/security'),
  blockIp: (ip) => client.post('/api/admin/security/block-ip', { ip }),
  unblockIp: (ip) => client.post('/api/admin/security/unblock-ip', { ip }),
  getSettings: () => client.get('/api/admin/settings'),
  updateSettings: (data) => client.put('/api/admin/settings', data),
};
```

### TanStack Query Hook Pattern

Every data fetch follows this pattern:

```js
// src/hooks/useBlogPosts.js
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/public';

export function useBlogPosts(params) {
  return useQuery({
    queryKey: ['blog-posts', params],
    queryFn: () => api.getBlogPosts(params).then(r => r.data),
  });
}
```

Every mutation follows this pattern:

```js
// Inside an admin page component
const queryClient = useQueryClient();

const updateStatus = useMutation({
  mutationFn: ({ id, status }) => adminApi.updateApplicationStatus(id, status),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['applications'] });
    toast.success('Status updated');
  },
  onError: () => toast.error('Failed to update status'),
});
```

### Error Handling Convention

All hooks return `{ data, isLoading, error }` from TanStack Query.

Page components render three states explicitly:

```jsx
if (isLoading) return <LoadingState />;
if (error) return <ErrorState message="Could not load data." />;
if (!data?.length) return <EmptyState message="No items yet." />;
return <DataView data={data} />;
```

Never render partial data without handling all three states.

---

## 7. Tailwind Configuration

Define design tokens in `tailwind.config.js`. Do not use arbitrary values
(`p-[23px]`, `text-[17px]`) anywhere in the codebase. The token system in
DESIGN_VISION.md is the source of truth.

```js
// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Public backgrounds
        'bg-base':         '#080C14',
        'bg-elevated':     '#0D1220',
        'bg-subtle':       '#131928',
        // Public text
        'text-primary':    '#F0F2F8',
        // Accent
        accent:            '#4F6BCC',
        'accent-hover':    '#6B8CFF',
        // Semantic
        success:           '#22C55E',
        warning:           '#F59E0B',
        danger:            '#EF4444',
        info:              '#38BDF8',
        // Admin surfaces
        'admin-bg':        '#F8F9FB',
        'admin-surface':   '#FFFFFF',
        'admin-subtle':    '#F1F3F7',
        'admin-border':    '#E2E6EE',
        'admin-text':      '#111827',
        'admin-accent':    '#4F6BCC',
        // Sidebar
        'sidebar-bg':      '#0D1220',
      },
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['IBM Plex Mono', 'monospace'],
      },
      fontSize: {
        'display-xl': ['76px', { lineHeight: '1.05', fontWeight: '700' }],
        'display-lg': ['56px', { lineHeight: '1.10', fontWeight: '700' }],
        'display-md': ['40px', { lineHeight: '1.15', fontWeight: '600' }],
        'display-sm': ['26px', { lineHeight: '1.25', fontWeight: '600' }],
        'body-lg':    ['19px', { lineHeight: '1.70' }],
        'body-md':    ['16px', { lineHeight: '1.65' }],
        'body-sm':    ['14px', { lineHeight: '1.60' }],
        'label':      ['13px', { lineHeight: '1.50', fontWeight: '500' }],
        'caption':    ['12px', { lineHeight: '1.50' }],
        'mono-md':    ['14px', { lineHeight: '1.60' }],
        'mono-sm':    ['12px', { lineHeight: '1.50' }],
      },
      borderRadius: {
        sm:   '4px',
        md:   '6px',
        lg:   '10px',
        xl:   '16px',
        full: '9999px',
      },
      maxWidth: {
        content: '1200px',
        text:    '720px',
        narrow:  '560px',
      },
      transitionDuration: {
        fast:     '175ms',
        moderate: '275ms',
      },
    },
  },
  plugins: [],
};
```

---

## 8. Shared Component Inventory

### Public Site Components

These components are built from scratch following DESIGN_VISION.md.
They do not depend on shadcn/ui.

#### Layout

| Component        | Description                                                              |
|------------------|--------------------------------------------------------------------------|
| `PublicLayout`   | Wraps all public pages. Renders `<Navbar>` and `<Footer>`.              |
| `Navbar`         | Floating glass pill. Logo, 4 nav links, gradient CTA button.            |
| `Footer`         | 4-column layout: brand + tagline, Company links, Services links, Contact.|
| `MobileDrawer`   | Hamburger drawer. Stacked nav links + full-width CTA button.            |

#### UI Primitives

| Component         | Description                                                             |
|-------------------|-------------------------------------------------------------------------|
| `Button`          | Variants: `primary` (gradient fill), `secondary` (accent border), `ghost` (text + arrow). All 48px height. |
| `GlassCard`       | `bg-[rgba(13,18,32,0.70)] border border-white/8 backdrop-blur-[12px]`  |
| `SectionLabel`    | IBM Plex Mono, 12px, text-muted, uppercase tracking. Optional.          |
| `SectionHeading`  | Space Grotesk display-lg. Accepts `gradient` prop for highlighted word. |
| `GradientText`    | Span with `background-clip: text` and `--gradient-brand-text`.          |
| `Badge`           | Small label. Variants: default, success, warning, error, info.          |
| `StatCard`        | Metric + label. IBM Plex Mono for the number.                           |
| `AnimatedSection` | Framer Motion wrapper. Fade + translateY(20px) → (0) on scroll enter.  |

#### Homepage Sections

| Component             | Description                                                      |
|-----------------------|------------------------------------------------------------------|
| `Hero`                | Animated radial gradient bg. Eyebrow, headline (gradient text on "Intelligent Systems."), subtext, 2 CTAs. |
| `Services`            | 6 service domain cards. Expandable descriptions. Anchor: `#services`. |
| `WhyUs`               | Differentiator grid. 6 cards.                                    |
| `ProjectMetrics`      | 4 stats: projects, clients, collaborations, research papers.     |
| `Industries`          | Visual scan grid. 5 industries.                                  |
| `ProjectsTeaser`      | 4–6 gallery/project items from `/api/gallery`. Links to `/projects`. |
| `CollaborationTeaser` | 2-column (industry + academic). CTA → `/contact?type=collaboration`. |
| `Newsletter`          | Email input. `POST /api/newsletter`. Inline success state.       |

---

### Admin Components

These components are built using shadcn/ui as the base.
They do not share styles with public site components.

#### Layout

| Component       | Description                                                                |
|-----------------|----------------------------------------------------------------------------|
| `AdminLayout`   | Sidebar (240px/64px) + topbar (56px) + content area (32px padding).       |
| `AdminSidebar`  | Dark bg (`#0D1220`). Logo with gradient. Nav groups: CONTENT, MANAGEMENT, SYSTEM. Collapse toggle. Active item: accent left border + bg. |
| `AdminTopbar`   | Breadcrumb left. User avatar + username + logout right.                    |

#### UI Components

| Component        | Description                                                              |
|------------------|--------------------------------------------------------------------------|
| `AdminButton`    | Primary (accent fill), secondary (accent border), destructive (error).   |
| `AdminTable`     | Clean borders, subtle row hover, sortable headers, pagination.           |
| `StatusBadge`    | Semantic color backgrounds per DESIGN_VISION.md badge spec.              |
| `PageHeader`     | Page title + optional action button (e.g., "New Post").                  |
| `EmptyState`     | Icon + message + optional CTA. Used when tables have no data.            |
| `ConfirmDialog`  | shadcn/ui `AlertDialog`. Used for all destructive actions.               |
| `DataCard`       | White card, admin-border, radius-lg, 24px padding. Wraps page sections.  |

---

## 9. Public Website — Page Breakdown

### Home Page (`/`)

Sections in order:

1. **Hero** — animated radial gradient bg; eyebrow label; headline with gradient on "Intelligent Systems."; subtext; primary CTA ("Get in Touch") + ghost CTA ("View Our Projects →")
2. **Trust Signal Bar** — thin divider section; 4 metrics (10 Projects, 30 Clients, 2 Collaborations, 2 Research Papers); IBM Plex Mono values
3. **Services** (`#services`) — section label "WHAT WE DO"; 6 domain cards (IoT & Embedded, Space & Satellite, PCB Design, Drones & Autonomous, Web & Cloud, AI & Automation); each card has icon + title + description
4. **Why Choose PixelPi** — section label "WHY US"; 6 differentiator cards (Innovative Projects, Learning & Growth, Collaborative Culture, Career Opportunities, Recognition, Creative Freedom)
5. **Industries Served** — visual scan grid; 5 industries; horizontal or grid layout
6. **Projects Teaser** — section label "OUR WORK"; 4–6 items from `GET /api/gallery`; link to `/projects`
7. **Collaboration Teaser** — 2-column (Industry Partnership + Academic Collaboration); each has description + CTA; Industry CTA → `/contact?type=collaboration`; Academic CTA → `/contact?type=collaboration`
8. **Newsletter** — short headline; email input; `POST /api/newsletter`; inline success message
9. **Footer** — 4-column layout per DESIGN_VISION.md

API consumed: `GET /api/gallery` (for Projects Teaser), `POST /api/newsletter`, `POST /api/contact`

---

### About Page (`/about`)

Build with placeholder content. Real content replaces placeholders pre-launch.

Sections:
1. **Page Hero** — headline + mission statement
2. **Company Story** — 2–4 paragraph narrative [PLACEHOLDER]
3. **Mission & Vision** — two panels side by side; text from `company-reference.md`
4. **Team Section** — [PLACEHOLDER] — at minimum one founder card
5. **Location & Contact Info** — Bangalore, Karnataka; phone; email; WhatsApp link

No API consumption.

---

### Projects Page (`/projects`)

1. **Page Hero** — "Our Work" headline + subtext
2. **Domain Filter** — filter pills: All, IoT, Space, PCB, Drones, Web, AI
3. **Project Grid** — items from `GET /api/gallery`; each item: image + title + description; responsive grid
4. **Project Modal / Expand** — inline expand or modal on click showing full metadata
5. **Bottom CTA** — "Start a Project" → `/contact`

API consumed: `GET /api/gallery`, `GET /uploads/gallery/:filename`

---

### Blog Page (`/blog`)

1. **Page Hero** — "Insights & Engineering" headline
2. **Search + Category Filter** — consumes `categories` from `GET /api/blog` response
3. **Blog Post Grid** — cards with: cover image, category badge, title, excerpt, reading time, date
4. **Pagination** — from pagination object in API response
5. **Empty State** — graceful "No posts yet — check back soon" for empty blog

API consumed: `GET /api/blog?search=&category=&page=`

---

### Blog Post Page (`/blog/:slug`)

1. **Post Header** — cover image, category, title, author, date, reading time
2. **Post Content** — rendered from `content` field (check format: HTML or Markdown)
3. **React Helmet** — sets `<title>` and `<meta description>` from post metadata
4. **Back Link** — ← Back to Blog

API consumed: `GET /api/blog/:slug`

**Important:** Before building, hit `GET /api/blog/:slug` on a real post and
inspect the `content` field. If HTML: use `dangerouslySetInnerHTML` with a
sanitizer (DOMPurify). If Markdown: use `react-markdown`.

---

### Careers Page (`/careers`)

1. **Page Hero** — "Build the Future with Us" headline + subtext
2. **Current Openings** — cards from `GET /api/career-openings`; each: title, department, type, location, description snippet, "Apply Now" button anchor → `#apply`
3. **Why Work With Us** — 6 benefit cards from company-reference.md
4. **Application Form** (`#apply`) — React Hook Form; all fields:
   - name, email, phone
   - position (Select from openings list)
   - education, university
   - skills, experience
   - portfolio URL, message
   - resume file upload (PDF/DOC/DOCX/PNG/JPG, max 5MB)
5. **Form submission** → `POST /api/careers/apply` (multipart/form-data)
6. **Success state** — inline confirmation; clear form

API consumed: `GET /api/career-openings`, `POST /api/careers/apply`

---

### Contact Page (`/contact`)

1. **Page Hero** — "Let's Talk" headline + subtext
2. **Inquiry Type Selector** — radio group: "Service Inquiry" | "Collaboration" | "General"
3. **Morphing Form** — fields change based on selected type:
   - Service Inquiry / General: name, email, subject, message → `POST /api/contact`
   - Collaboration: name, email, organization, message → `POST /api/collaboration`
4. **Contact Details Panel** — phone, email, WhatsApp link, Bangalore location
5. **URL Parameter Handling** — on mount, read `?type=collaboration` and pre-select the Collaboration radio

API consumed: `POST /api/contact`, `POST /api/collaboration`

---

## 10. Admin Dashboard — Page Breakdown

### Login Page (`/admin/login`)

- Gradient header (brand touchpoint per DESIGN_VISION.md)
- Username + password fields
- `POST /api/admin/login` → store JWT in localStorage → redirect to `/admin/dashboard`
- Error state for wrong credentials
- No "Remember me" complexity needed

---

### Dashboard (`/admin/dashboard`)

Stats row — 4 cards: Total Applications, Contacts, Subscribers, Blog Posts.
API: `GET /api/admin/dashboard/stats`

Activity feed — recent actions with timestamp, action type, resource.
API: `GET /api/admin/dashboard/overview`

Blog stats — total posts, total views.

Gradient welcome header (brand touchpoint).

---

### Blog CMS (`/admin/blog`, `/admin/blog/new`, `/admin/blog/:id/edit`)

List view: table with columns: title, category, status badge, views, date, actions (Edit / Delete).
API: `GET /api/admin/blog`

Create/Edit form:
- title (text input)
- slug (auto-generated from title, editable)
- category (text input or select)
- excerpt (textarea)
- content (rich text editor — see note below)
- cover image URL (text input)
- status toggle (draft / published)
- meta_title, meta_description (SEO fields, collapsible)
- Save button → `POST` (new) or `PUT /:id` (edit)
- Delete button (edit mode only) → `DELETE /:id` with confirm dialog

**Rich text editor decision:** Before building, inspect an existing blog post's
`content` field from the API. Use Tiptap if HTML. Use react-markdown + a
markdown textarea if Markdown. Do not guess.

---

### Applications (`/admin/applications`, `/admin/applications/:id`)

List view: table with columns: name, position, university, status badge, date, actions.
API: `GET /api/admin/applications`

Filters: by status (new / reviewing / shortlisted / rejected / hired)

Detail view:
- Full applicant info (all fields)
- Resume download link → `/uploads/resumes/:filename`
- Status update dropdown → `PUT /api/admin/applications/:id/status`
- Status options: new, reviewing, shortlisted, rejected, hired

---

### Contacts (`/admin/contacts`)

Table: name, email, subject, status badge, date, actions.
API: `GET /api/admin/contacts`
Status update: `PUT /api/admin/contacts/:id/status`

---

### Newsletters (`/admin/newsletters`)

Table: email, status, subscribed date.
API: `GET /api/admin/newsletters`
Read-only. No mutations.

---

### Collaborations (`/admin/collaborations`)

Table: name, email, organization, status badge, date, actions.
API: `GET /api/admin/collaborations`
Status update: `PUT /api/admin/collaborations/:id/status`

---

### Gallery Management (`/admin/gallery`)

Grid view of current images with metadata overlays.
API: `GET /api/admin/gallery`

Upload panel:
- File input (image files)
- `POST /api/admin/gallery/upload` (multipart/form-data)
- Upload progress indicator

Per image:
- Edit metadata modal (title, description) → `PUT /api/admin/gallery/:filename`
- Delete button with confirm → `DELETE /api/admin/gallery/:filename`

Note: This endpoint is fully verified end-to-end. Build confidently.

---

### Career Openings CMS (`/admin/career-openings`)

Table: title, department, type, location, status, date, actions.
API: `GET /api/admin/career-openings`

Create/Edit modal or page:
- title, department, type, location, description, requirements, status
- `POST` (new) or `PUT /:id` (edit)
- Delete with confirm → `DELETE /:id`

---

### Audit Logs (`/admin/audit-logs`)

Read-only table: action, username, resource, IP address, timestamp.
API: `GET /api/admin/audit-logs`
No mutations. Add date filter and search if straightforward.

---

### Analytics (`/admin/analytics`)

Display what the API returns. API is "Discovered" — endpoint exists but data
volume is unknown.

Build defensively: all charts wrapped in empty state handlers.
Metrics: Views, Visitors, Traffic Sources, Browsers, Hourly Traffic.
API: `GET /api/admin/analytics`

If data is sparse at launch, show empty states and note "Analytics data will
populate over time." Do not block launch on this page.

---

### Security (`/admin/security`)

Display: Security Score, Threat Log, Blocked IPs list, Failed Logins, SSL Status.
API: `GET /api/admin/security`

Block IP: text input + button → `POST /api/admin/security/block-ip`
Unblock IP: button per blocked IP → `POST /api/admin/security/unblock-ip`

**Important:** Display a visible warning that blocked IPs are stored in memory
only and reset on server restart. Do not hide this limitation.

---

### Settings (`/admin/settings`)

Form displaying current settings values.
API: `GET /api/admin/settings` (load), `PUT /api/admin/settings` (save)
Endpoint is "Discovered" — test it with Postman before building the UI.

---

## 11. Recommended Build Order

Build in this exact sequence. Each phase unblocks the next.

```
Phase 1 — Foundation (Week 1, Days 1–3)
  ├── Vite + React + Tailwind + React Router setup
  ├── index.css — all CSS custom properties defined
  ├── tailwind.config.js — all design tokens
  ├── Google Fonts linked in index.html
  ├── Axios client + API layer (public.js + admin.js)
  ├── AuthContext + ProtectedRoute
  ├── TanStack Query client
  └── Route shell (all routes defined, pages are blank)

Phase 2 — Public Shared Layout (Week 1, Days 4–5)
  ├── Navbar (floating glass pill, mobile drawer)
  └── Footer (4-column)

Phase 3 — Public Pages (Week 1 Day 6 through Week 2)
  ├── Home page (section by section — Hero first)
  ├── About page (placeholder content)
  ├── Projects page (consumes /api/gallery)
  ├── Blog listing page
  ├── Blog post page (after checking content format)
  ├── Careers page (form last)
  └── Contact page (unified form with type selector)

Phase 4 — Deploy Public Site (End of Week 2)
  ├── Production Nginx config
  ├── SSL via Certbot
  ├── PM2 for backend
  └── React build deployed — show founder

Phase 5 — Admin Foundation (Week 3, Days 1–2)
  ├── Admin login page
  ├── AdminLayout (sidebar + topbar + content shell)
  ├── AdminSidebar with all nav items
  └── Install + configure shadcn/ui

Phase 6 — Admin Pages (Week 3 Day 3 through Week 4)
  ├── Dashboard (stats + activity feed)
  ├── Blog CMS (list + create/edit — rich text editor)
  ├── Gallery management (upload + edit + delete)
  ├── Applications (list + detail + status update)
  ├── Contacts, Collaborations (parallel — same pattern)
  ├── Newsletters (read-only)
  ├── Career Openings CMS
  ├── Audit Logs (read-only table)
  ├── Analytics (defensive empty states)
  ├── Security (with memory-only warning)
  └── Settings

Phase 7 — QA + Polish + Delivery (Week 4 end)
  ├── End-to-end testing of all public forms
  ├── End-to-end testing of all admin CRUD
  ├── Mobile responsiveness audit (public site)
  ├── Lighthouse performance pass
  ├── React Helmet verification on blog posts
  └── Founder demo + feedback round
```

---

## 12. Week-by-Week Milestones

### Week 1 — Foundation + Public Layout

**Goal:** All infrastructure in place. Navbar and Footer complete.
Home page Hero section live in dev. Dev environment matches design vision.

**Deliverables:**
- Vite project initialized, all dependencies installed and configured
- `index.css` with complete CSS custom property token system
- `tailwind.config.js` with all design tokens
- Axios client, public API layer, admin API layer
- AuthContext + ProtectedRoute functional
- TanStack Query client configured
- All routes defined (pages render placeholder text)
- Navbar built and responsive (desktop pill + mobile drawer)
- Footer built and responsive (4-column → stacked on mobile)
- Hero section complete with animated radial gradient background

**Success Criteria:**
- Local dev server runs without errors
- Navigating to every route renders without crashing
- Admin login route redirects to `/admin/login` when unauthenticated
- Navbar renders correctly on desktop and mobile
- Hero section matches DESIGN_VISION.md spec including gradient text on "Intelligent Systems."
- No arbitrary Tailwind values anywhere in the codebase

**Milestone Question:**
Does the Hero section, as rendered in the browser, look like it belongs to Linear or Vercel in terms of quality and aesthetic character? If not, resolve before Week 2.

---

### Week 2 — Public Site Completion + First Deploy

**Goal:** All public pages functional and visually polished.
Live deployment on production domain by end of week.

**Deliverables:**
- Home page complete (all sections)
- About page (placeholder content, full layout)
- Projects page (consuming live gallery API)
- Blog listing page (consuming live blog API, with search/filter)
- Blog post page (with React Helmet meta tags)
- Careers page (full application form with file upload)
- Contact page (unified form with type selector + `?type=` handling)
- Production deployment: Nginx + SSL + PM2 + React build
- Founder demo of live public site

**Success Criteria:**
- All public API forms submit successfully and return correct responses
- All pages are responsive on mobile (375px) and desktop (1440px)
- Blog post meta tags are set correctly (verify in browser tab + view source)
- Career application form handles file upload, validates file type/size, shows success
- Contact form correctly routes to `/api/contact` or `/api/collaboration` based on type selection
- `?type=collaboration` pre-selects Collaboration on the contact form
- Site is live on production domain with SSL (padlock in browser)
- Lighthouse performance score ≥ 80 on home page

---

### Week 3 — Admin Panel

**Goal:** All admin panel pages functional.
Admin usable for real business operations by end of week.

**Deliverables:**
- Admin login page + JWT persistence + protected routes
- AdminLayout (sidebar + topbar) complete and collapsible
- Dashboard page with real data from API
- Blog CMS: list, create, edit, delete, publish/draft
- Gallery management: upload, edit metadata, delete
- Applications: list with filters, detail view, status updates
- Contacts, Collaborations: list + status updates
- Newsletters: read-only subscriber list
- Career Openings CMS: list, create, edit, delete
- Audit Logs: read-only table
- Analytics: display with empty state handling
- Security: display + IP block/unblock with memory-only warning
- Settings: load + save

**Success Criteria:**
- Admin login with correct credentials → redirects to dashboard
- Admin login with wrong credentials → shows error, does not redirect
- Browser refresh on any admin page → stays authenticated (token persists)
- Logout → clears token, redirects to login
- Blog CMS: can create a post, publish it, verify it appears on public `/blog`
- Gallery: upload image, edit metadata, verify it appears on public `/projects`, delete it, verify removal
- Application status update persists (verify by refreshing the page)
- All admin tables show loading state, error state, and empty state correctly
- Sidebar active state correctly reflects current page on all routes
- Sidebar collapse/expand works correctly

---

### Week 4 — QA, Polish, Delivery

**Goal:** Production-quality delivery. All features verified.
Founder has a running platform they can operate confidently.

**Deliverables:**
- Full end-to-end QA of all public-facing flows
- Full end-to-end QA of all admin flows
- Mobile audit of all public pages
- Lighthouse performance pass (≥ 80 on performance + SEO)
- Any bugs from Week 3 admin testing resolved
- Founder feedback from Week 2 demo addressed
- Final deployment on production
- Handoff documentation (brief README: how to run, how to deploy, env variables)

**Success Criteria:**
- Every public form submits without error and shows correct success state
- Every admin CRUD operation functions correctly on production
- No console errors on any page in production
- All gallery images load from production URLs
- Resume downloads work from admin applications detail view
- Blog posts display with correct meta tags on production
- Site loads in under 3 seconds on a standard connection (Lighthouse)
- Founder has been walked through the admin panel and confirmed they can operate it

---

## 13. Day 1 to Day 7 — Week 1 Detail Plan

> This plan contains enough detail to execute Week 1 directly.
> Each subsequent week should be planned at this level of detail
> before that week begins, using actual project state at the time.

---

### Day 1 — Project Initialization + Infrastructure

**Estimated hours:** 6–7 hours

**Objective:** Working local dev environment with all dependencies,
token system, routing shell, and API layer in place.
No visible UI yet — this day is infrastructure only.

#### Tasks

**Morning (3–4 hours)**

1. Create the Vite project:
   ```bash
   npm create vite@latest pixelpi-frontend -- --template react
   cd pixelpi-frontend
   npm install
   ```

2. Install all dependencies:
   ```bash
   npm install react-router-dom @tanstack/react-query axios
   npm install react-hook-form @hookform/resolvers zod
   npm install framer-motion react-helmet-async lucide-react
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```

3. Configure `tailwind.config.js` — copy the full configuration from
   Section 7 of this document exactly. Do not abbreviate or defer tokens.

4. Replace `src/index.css` completely with:
   - `@tailwind base; @tailwind components; @tailwind utilities;`
   - All CSS custom properties from Section 1 of this document
   - Google Fonts import from DESIGN_VISION.md section 4
   - Base body styles: `background-color: var(--color-bg-base); color: var(--color-text-primary); font-family: var(--font-body);`

5. Update `index.html`:
   - Set `<title>Pixel Pi Technologies</title>`
   - Add Google Fonts preconnect links from DESIGN_VISION.md section 4
   - Set correct favicon link

**Afternoon (3 hours)**

6. Create folder structure (all folders only, no component code yet):
   Create every folder listed in Section 4. Add `.gitkeep` files to empty directories.

7. Create `src/api/client.js` — Axios instance with JWT interceptor (from Section 6).

8. Create `src/api/public.js` — all public API functions (from Section 6).

9. Create `src/api/admin.js` — all admin API functions (from Section 6).

10. Create `src/context/AuthContext.jsx`:
    - `createContext`, `useContext`, `AuthProvider`
    - State: `{ user, token, isLoading }`
    - `login(credentials)` → calls `adminApi.login()` → stores token in localStorage
    - `logout()` → clears localStorage → sets user/token to null
    - On mount: read token from localStorage → call `adminApi.status()` to validate
    - If validation fails: clear localStorage, set unauthenticated state

11. Create `src/hooks/useAuth.js` — `export function useAuth() { return useContext(AuthContext); }`

12. Create `src/routes/ProtectedRoute.jsx` (from Section 5).

13. Create `src/main.jsx` with all providers:
    ```jsx
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { BrowserRouter } from 'react-router-dom';
    import { HelmetProvider } from 'react-helmet-async';
    import { AuthProvider } from './context/AuthContext';

    const queryClient = new QueryClient({ /* config from Section 3 */ });

    ReactDOM.createRoot(document.getElementById('root')).render(
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );
    ```

14. Create `src/App.jsx` — import and render all routes from
    `PublicRoutes.jsx` and `AdminRoutes.jsx`.

15. Create route files (`PublicRoutes.jsx`, `AdminRoutes.jsx`) from Section 5.
    All page components are blank: `export default function HomePage() { return <div>Home</div>; }`

16. Create all page files in `src/pages/public/` and `src/pages/admin/`
    as blank placeholder components.

17. Create `src/utils/cn.js`:
    ```bash
    npm install clsx tailwind-merge
    ```
    ```js
    import { clsx } from 'clsx';
    import { twMerge } from 'tailwind-merge';
    export function cn(...inputs) { return twMerge(clsx(inputs)); }
    ```

**End of Day 1 Deliverables:**
- `npm run dev` starts without errors
- All routes render placeholder text
- `/admin/dashboard` redirects to `/admin/login` when no token in localStorage
- Browser console is clean (no errors)
- Google Fonts are loading (visible in Network tab)
- Page background is `#080C14` (the dark blue-black from the token system)

**Decisions that must be confirmed before Day 1 ends:**
- Confirm the local backend is running and `GET /api/health` returns `{ status: "OK" }`
- Confirm `POST /api/admin/login` works with known credentials (test with curl or Postman)
- Confirm `GET /api/gallery` returns data (needed for Day 6 Projects Teaser)

---

### Day 2 — Design System + Shared UI Primitives

**Estimated hours:** 6–8 hours

**Objective:** All reusable public-site UI primitives built and visually verified.
These components are the foundation of every public page.
Do not rush these — inconsistency here propagates everywhere.

#### Tasks

**Morning (3–4 hours)**

1. Create `src/utils/formatDate.js` and `src/utils/formatRelativeTime.js`.

2. Build `src/components/public/ui/Button.jsx`:
   - Props: `variant` ('primary' | 'secondary' | 'ghost'), `size` ('md' | 'lg'), `children`, standard button props
   - Primary: gradient fill (`background: var(--gradient-brand)`), white text, 48px height, radius-md
   - Secondary: transparent bg, `border: 1px solid var(--color-accent)`, accent text
   - Ghost: text only with "→" suffix, accent color, no border
   - All variants: `transition: var(--duration-fast)` on hover states
   - Do not build this as a styled-components variant — build it as conditional Tailwind classes using the `cn()` utility

3. Build `src/components/public/ui/GradientText.jsx`:
   ```jsx
   export function GradientText({ children }) {
     return (
       <span style={{
         background: 'var(--gradient-brand-text)',
         WebkitBackgroundClip: 'text',
         WebkitTextFillColor: 'transparent',
         backgroundClip: 'text',
       }}>
         {children}
       </span>
     );
   }
   ```

4. Build `src/components/public/ui/SectionLabel.jsx`:
   IBM Plex Mono, `text-mono-sm`, `text-[var(--color-text-muted)]`, uppercase, tracking-widest.

5. Build `src/components/public/ui/SectionHeading.jsx`:
   Props: `children`, `className`. Space Grotesk, `text-display-lg`. Renders an `<h2>`.

6. Build `src/components/public/ui/GlassCard.jsx`:
   ```jsx
   // background: rgba(13, 18, 32, 0.70), border: 1px solid rgba(255,255,255,0.08)
   // backdrop-filter: blur(12px), border-radius: var(--radius-lg)
   ```

7. Build `src/components/public/ui/Badge.jsx`:
   Variants: default, success, warning, error, info. Use semantic colors from DESIGN_VISION.md.

8. Build `src/components/public/ui/StatCard.jsx`:
   Number in IBM Plex Mono `text-display-sm`, label in Inter `text-label text-muted`.

**Afternoon (3–4 hours)**

9. Build `src/components/public/ui/AnimatedSection.jsx`:
   Framer Motion wrapper using the scroll-triggered entrance pattern from DESIGN_VISION.md:
   ```jsx
   import { motion } from 'framer-motion';
   import { useInView } from 'framer-motion';
   // opacity: 0, y: 20 → opacity: 1, y: 0 on enter
   // duration: 0.275s, delay prop for stagger support
   ```

10. Build `src/components/public/layout/Footer.jsx`:
    4-column layout (responsive → stacked on mobile). Content from DESIGN_VISION.md footer spec.
    Import Lucide `Linkedin` icon for the social link.
    Services column uses anchor links (`/#services`).
    No API calls needed.

**End of Day 2 Deliverables:**
- All primitive components render correctly in isolation (test by importing into HomePage temporarily)
- Button gradient matches the brand gradient visually
- GradientText renders with correct violet → indigo gradient
- GlassCard has visible translucency (test against a colored background)
- Footer renders correctly on desktop (4-column) and mobile (stacked)
- AnimatedSection fades in elements on scroll enter

**Rabbit holes to avoid:**
- Do not implement storybook, component documentation, or a design system viewer. Just build the components.
- Do not add animation to every component. Only AnimatedSection is animated. Buttons animate only on hover/active.
- Do not over-engineer GlassCard with multiple opacity variants. One implementation, used consistently.

---

### Day 3 — Navbar

**Estimated hours:** 5–7 hours

**Objective:** Navbar complete. This is the most technically nuanced component
in the project and deserves a full day.

#### Tasks

1. Build `src/components/public/layout/Navbar.jsx`:

   **Desktop pill behavior:**
   - `position: fixed`, `top: 24px`, `left: 50%`, `transform: translateX(-50%)`
   - Glass pill: `backdrop-filter: blur(16px)`, `background: rgba(13,18,32,0.65)`, `border: 1px solid rgba(255,255,255,0.10)`, `border-radius: 9999px`
   - Horizontal padding 32px, height 52px
   - Logo left, nav links center, "Get in Touch" button right
   - No gap between nav items that is too large — compact pill reads as deliberate

   **Scroll behavior:**
   - On scroll past 20px: slightly increase background opacity (from ~0.65 to ~0.80). Use `useScroll` from Framer Motion or a simple `useEffect` + `window.addEventListener('scroll')`.
   - Transition: `var(--duration-fast)`

   **Nav links:**
   - Inter, `text-label`, `text-[var(--color-text-secondary)]`
   - Hover: `text-[var(--color-text-primary)]`, transition fast
   - Active route: `text-[var(--color-text-primary)]` (use `useLocation` from React Router)
   - Links: About, Projects, Blog, Careers

   **"Get in Touch" button:**
   - Primary variant from Button component
   - Height 36px (smaller than the standard 48px to fit the pill)
   - Destination: `/contact`

   **Mobile behavior:**
   - Below `md` breakpoint: full-width bar (no pill)
   - Hamburger icon (Lucide `Menu`) right side
   - Drawer opens on hamburger click
   - Drawer: dark background, stacked nav links, full-width "Get in Touch" button pinned at bottom
   - Drawer close: X icon (Lucide `X`) or overlay click

2. Build mobile drawer as part of the same file or a separate `MobileDrawer.jsx`.

3. Create `src/components/public/layout/PublicLayout.jsx`:
   ```jsx
   export function PublicLayout() {
     return (
       <>
         <Navbar />
         <main>
           <Outlet />
         </main>
         <Footer />
       </>
     );
   }
   ```

**End of Day 3 Deliverables:**
- Navbar renders correctly at desktop widths (pill, centered, glass effect)
- Navbar renders correctly at mobile widths (full-width bar, hamburger)
- Mobile drawer opens and closes correctly
- Navigating to About, Projects, Blog, Careers updates the active link state
- "Get in Touch" button routes to `/contact`
- Scroll behavior works (opacity increases slightly on scroll)

**Rabbit holes to avoid:**
- Do not spend more than 30 minutes fine-tuning the glass blur/opacity values today. Get it close enough and mark it for final tuning in Week 4.
- Do not add a dropdown or mega-menu. The nav has 4 links. That's it.
- Do not implement a "back to top" button, progress bar, or other nav enhancement on this day.

---

### Day 4 — Hero Section

**Estimated hours:** 6–8 hours

**Objective:** Hero section complete. This is the visual centrepiece of the
public site and the first thing the founder will evaluate.
It should match DESIGN_VISION.md section 8 exactly.

#### Tasks

1. Build `src/components/public/sections/Hero.jsx`:

   **Background:**
   ```css
   /* Implement as inline style or CSS class */
   background:
     radial-gradient(ellipse at 30% 50%, rgba(51,32,85,0.35) 0%, transparent 60%),
     radial-gradient(ellipse at 70% 50%, rgba(60,77,147,0.25) 0%, transparent 60%),
     #080C14;
   background-size: 200% 200%;
   animation: gradient-drift 18s ease infinite;
   ```
   Define `@keyframes gradient-drift` in `index.css`.

   **Content layout:**
   - Full viewport height (`min-h-screen`) or at least 80vh
   - Content centered vertically
   - Text: center-aligned on mobile, left-aligned from `md` breakpoint

   **Eyebrow line:**
   - "From Prototype to Production · Hardware Through Software"
   - IBM Plex Mono, 12px, `var(--color-text-muted)`, 0.6 opacity

   **Headline:**
   - Line 1: "Precision Engineering." — white text (`var(--color-text-primary)`)
   - Line 2: "Intelligent Systems." — GradientText component
   - Space Grotesk, 72–80px, weight 700
   - Use clamp for responsive sizing: `font-size: clamp(48px, 6vw, 80px)`

   **Subtext:**
   - "Engineering for startups, industry, research, and education."
   - Inter, 18–19px, `var(--color-text-secondary)`
   - Max width 560px (--max-width-narrow)

   **CTAs:**
   - Primary: `<Button variant="primary">Get in Touch</Button>` → `/contact`
   - Secondary: `<Button variant="ghost">View Our Projects →</Button>` → `/projects`
   - Arranged in a row with gap-4, wrapping on mobile

   **Below-fold trust signal:**
   - Thin section directly below hero (before services section)
   - 4 metrics: "10+ Projects", "30+ Clients", "2 Collaborations", "2 Research Papers"
   - StatCard component, IBM Plex Mono numbers
   - Horizontal divider above and below, 1px, `var(--color-border)`
   - This communicates credibility before the visitor reads anything else

2. Import `Hero` into `HomePage.jsx` and render it.

**End of Day 4 Deliverables:**
- Hero renders correctly with animated gradient background (subtle, not theatrical)
- "Intelligent Systems." displays gradient text (violet → indigo)
- Headline is left-aligned on desktop, center-aligned on mobile
- Two CTA buttons render in correct variants and are clickable
- Trust signal bar renders below hero with 4 metrics
- No console errors

**Critical check at end of Day 4:**
Sit back and look at the Hero on a desktop browser. Ask honestly: does this
look like it belongs next to Linear.app and Vercel.com in terms of quality?
If the answer is "not yet," identify what is off (color, font size, spacing,
gradient character) and fix it before Day 5. The Hero sets the tone for
everything that follows.

---

### Day 5 — Home Page Remaining Sections

**Estimated hours:** 7–8 hours

**Objective:** All home page sections complete. Home page is fully rendered
from top to bottom.

#### Tasks

**Morning (3–4 hours)**

1. Build `src/components/public/sections/Services.jsx`:
   - Section label: "WHAT WE DO"
   - Section heading: "Engineering That Ships"
   - 6 service cards in a 3-column grid (→ 2-col on tablet, 1-col on mobile)
   - Each card: Lucide icon, title, description (from company-reference.md services list)
   - Use GlassCard component
   - Anchor: `id="services"`
   - Each card wraps in AnimatedSection with stagger delay (50–80ms per card)

2. Build `src/components/public/sections/WhyUs.jsx`:
   - Section label: "WHY US"
   - 6 differentiator cards (Innovative Projects, Learning & Growth, etc.)
   - Same 3-column grid pattern as Services

3. Build `src/components/public/sections/ProjectMetrics.jsx`:
   - 4 StatCard components in a row
   - Values: 10+ Projects, 30+ Clients, 2 Collaborations, 2 Research Papers
   - Section has a subtle alternate background (`var(--color-bg-subtle)`)

**Afternoon (3–4 hours)**

4. Build `src/components/public/sections/Industries.jsx`:
   - Section label: "INDUSTRIES SERVED"
   - 5 industries: Education & Research, IoT & Automation, Aerospace & Space Technology, Defense, Consumer Electronics
   - Horizontal badge/pill display or small grid cards

5. Build `src/components/public/sections/ProjectsTeaser.jsx`:
   - Section heading: "Our Work"
   - Consumes `GET /api/gallery` via `useGallery()` hook
   - Create `src/hooks/useGallery.js` now
   - 4–6 image cards from gallery data
   - Each card: image (from `/uploads/gallery/:filename`), title, description overlay
   - "View All Projects →" ghost button → `/projects`
   - Handle loading state: skeleton cards. Handle error state: error message. Handle empty state: hide section.

6. Build `src/components/public/sections/CollaborationTeaser.jsx`:
   - 2-column layout (Industry Partnership | Academic Collaboration)
   - Each column: icon, title, bullet list of activities, CTA button
   - Both CTAs → `/contact?type=collaboration`

7. Build `src/components/public/sections/Newsletter.jsx`:
   - Short heading + subtext
   - Email input + Submit button (inline)
   - React Hook Form for the email field
   - `POST /api/newsletter` on submit
   - Success: replace form with "You're subscribed!" message
   - Error: show error message below input

8. Assemble `src/pages/public/HomePage.jsx`:
   Import and render all sections in order:
   ```jsx
   <Hero />
   <Services />
   <WhyUs />
   <ProjectMetrics />
   <Industries />
   <ProjectsTeaser />
   <CollaborationTeaser />
   <Newsletter />
   ```

**End of Day 5 Deliverables:**
- Home page renders all sections in correct order
- Gallery API is consumed and images display (or skeleton/error state shows correctly)
- Newsletter form submits and shows success state
- All sections use AnimatedSection for scroll-triggered entrances
- No section looks cluttered — verify spacing between sections (min 96px vertical padding)

**Rabbit holes to avoid:**
- Do not add parallax, video backgrounds, or WebGL to any section. Pure CSS only.
- The technical texture (circuit trace overlay) mentioned in DESIGN_VISION.md is optional and should be added only if it takes less than 30 minutes. Skip it if it takes longer.
- Do not implement a custom image lazy-loader. Use the native `loading="lazy"` attribute on `<img>` tags.

---

### Day 6 — Blog Pages

**Estimated hours:** 5–7 hours

**Objective:** Blog listing and blog post pages functional.

#### Pre-task (first 30 minutes of Day 6)

Before writing any blog UI code, make a real API call:
```bash
curl http://localhost:3000/api/blog
```
Inspect the response shape. Confirm: `posts`, `categories`, `pagination` fields.
Then:
```bash
curl http://localhost:3000/api/blog/[a-real-slug-from-the-response]
```
Inspect the `content` field of a blog post. Is it HTML or Markdown?
Decide your rendering approach before writing a line of UI code.

#### Tasks

1. Create `src/hooks/useBlogPosts.js` and `src/hooks/useBlogPost.js`.

2. Build `src/pages/public/BlogPage.jsx`:
   - Page title via React Helmet: "Blog | Pixel Pi Technologies"
   - Page hero: "Insights & Engineering" heading
   - Category filter pills (from API categories array)
   - Search input (controlled, debounced 300ms, passed as query param)
   - Blog post grid: 3-column → 2-col → 1-col
   - Blog card: cover image (or placeholder if null), category badge, title, excerpt, reading time, date
   - Pagination from API response
   - Loading state: skeleton cards
   - Empty state: "No posts found. Check back soon."

3. Build `src/pages/public/BlogPostPage.jsx`:
   - React Helmet: sets `<title>` and `<meta name="description">` from post data
   - Post header: category badge, title (Space Grotesk display-md), author, date, reading time
   - Cover image (full-width if present)
   - Content rendering:
     - If HTML: `<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />`
       Install: `npm install dompurify`
     - If Markdown: `<ReactMarkdown>{post.content}</ReactMarkdown>`
       Install: `npm install react-markdown`
   - Back link: "← Back to Blog" → `/blog`
   - 404 state: if post not found, show "Post not found" with link back to blog

**End of Day 6 Deliverables:**
- Blog listing page renders posts from API (or graceful empty state)
- Category filter changes posts displayed
- Blog post page renders at `/blog/:slug` with correct content
- React Helmet is setting title and meta description (verify in browser tab)

---

### Day 7 — Careers + Contact Pages

**Estimated hours:** 7–8 hours

**Objective:** Final two public pages complete.
These are the two most form-heavy pages in the public site.

#### Tasks

**Morning (3–4 hours) — Careers Page**

1. Create `src/hooks/useCareerOpenings.js`.

2. Build `src/pages/public/CareersPage.jsx`:

   **Openings section:**
   - Cards from `GET /api/career-openings`
   - Each card: position title, department, type, location, duration, description snippet
   - "Apply Now" button → anchors to `#apply`
   - Handle empty state: "No openings currently. Check back soon."

   **Why Work With Us section:**
   - 6 benefit cards (from company-reference.md)

   **Application Form (`#apply`):**
   - React Hook Form
   - Fields: name, email, phone, position (Select — populated from career openings), education, university, skills (textarea), experience (textarea), portfolio URL, message (textarea)
   - File upload: resume field, accept `.pdf,.doc,.docx,.png,.jpg,.jpeg`, max 5MB client-side validation
   - Submit: `POST /api/careers/apply` via `multipart/form-data`
   - Loading state: disable form + show spinner on submit button
   - Success state: show success message, clear form
   - Error state: show error message

**Afternoon (3–4 hours) — Contact Page**

3. Build `src/pages/public/ContactPage.jsx`:

   **Type selector:**
   - Radio group: "Service Inquiry" | "Collaboration" | "General"
   - Styled as segmented control or pill radio buttons

   **URL parameter handling:**
   ```jsx
   const [searchParams] = useSearchParams();
   const type = searchParams.get('type'); // 'collaboration'
   // On mount: if type === 'collaboration', pre-select Collaboration radio
   ```

   **Morphing form fields:**
   - Service Inquiry + General: name, email, subject, message → `POST /api/contact`
   - Collaboration: name, email, organization, message → `POST /api/collaboration`
   - Use React Hook Form; reset on type change

   **Contact details panel:**
   - Bangalore, Karnataka, India
   - +91 8088959143
   - info@pixelpitechnologies.in
   - WhatsApp link
   - Display in a GlassCard alongside the form

   **Success state:** Inline confirmation per form type.

**End of Day 7 Deliverables:**
- Career openings load from API and render as cards
- Career application form validates all fields client-side
- Resume file upload validates type and size before submission
- Career form submits successfully to `POST /api/careers/apply`
- Contact page renders with type selector
- `?type=collaboration` pre-selects Collaboration on load
- Collaboration form submits to `POST /api/collaboration`
- Service Inquiry / General forms submit to `POST /api/contact`

**End of Week 1 State:**
All public pages are functionally complete in local development.
Navbar and Footer are complete and responsive.
The home page, about (placeholder), blog, careers, and contact pages are all rendering.
The API layer, AuthContext, TanStack Query, and routing are all configured correctly.
Week 2 begins with About and Projects pages, then moves to deployment.

---

## 14. Risks and Dependencies

### High Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Blog `content` field format unknown until tested | Blocks blog post rendering | Test on Day 6 morning before writing any UI code |
| Email system not functional (noted in architecture audit) | Silent failures on all contact forms | Verify with founder before launch week. Forms should return success from API — confirm API behavior is correct regardless of email delivery. |
| Admin endpoints marked "Discovered" may behave unexpectedly | Blocked admin page development | Test each endpoint with Postman before building its UI page. Do this at the start of each admin page build. |
| Resume file access unauthenticated | Privacy/security issue | Manually test whether `/uploads/resumes/[filename]` is accessible without auth. If yes, flag to founder immediately. |
| Career application file upload — backend behavior not fully verified | Form submission failure | Test `POST /api/careers/apply` with a real PDF via Postman before building the form UI. |

### Medium Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Founder revision requests after Week 2 demo | Timeline extension | Build buffer into Week 4. Confirm that visual feedback should come within 48 hours of demo. |
| Gallery metadata stored in JSON (not MySQL) | Inconsistency if both storage modes are used | Note for founder. Do not attempt to fix during this engagement. |
| Blocked IPs memory-only | Security panel limitation | Display explicit warning in the UI. Mark as known limitation. |
| bcrypt migration may be incomplete for some admin accounts | Admin login failures | Test login with all known admin accounts before building admin UI. |
| `?type=collaboration` parameter handling | Wrong form type displayed | Test on mount in ContactPage. Use `useSearchParams` correctly. |

### Low Risk

| Risk | Impact | Mitigation |
|------|--------|------------|
| Analytics data may be sparse | Empty analytics page | Build with empty state handling. Not a launch blocker. |
| About page has placeholder content | Incomplete page at launch | Pre-launch content from founder before go-live. Track as a dependency. |
| Admin session persistence on browser refresh | Logged out unexpectedly | Test on Day 9 (admin login day). Verify token persists and status check works. |

### Dependencies (Things You Do Not Control)

| Dependency | Owner | Action Required |
|------------|-------|-----------------|
| Founder provides About page content | Founder | Request before Week 4 |
| Server/VPS access for deployment | Founder | Request credentials before end of Week 2 |
| Domain DNS configuration | Founder | Coordinate for SSL setup |
| Confirmation that email notifications work as expected | Founder | Ask in Week 2 pre-deployment call |
| Logo SVG file | Founder | Confirm receipt — required for Navbar on Day 3 |

---

## 15. Definition of Done

### Phase 1 (Foundation) is Done When:

- [ ] `npm run dev` starts without errors or warnings
- [ ] All routes render without crashing
- [ ] Admin routes redirect to `/admin/login` when unauthenticated
- [ ] CSS custom properties are defined and resolve correctly in the browser
- [ ] Google Fonts are loading (Space Grotesk, Inter, IBM Plex Mono)
- [ ] Page background is `#080C14`
- [ ] Axios client is configured with base URL and JWT interceptor
- [ ] All API functions are defined in `public.js` and `admin.js`
- [ ] AuthContext provides login/logout/user state
- [ ] No arbitrary Tailwind values anywhere in the codebase

### Phase 2 (Public Site) is Done When:

- [ ] All 6 public pages render without errors
- [ ] Navbar renders as floating pill on desktop and full-width bar on mobile
- [ ] Mobile hamburger drawer opens and closes correctly
- [ ] Footer renders correctly on desktop and mobile
- [ ] Hero section animated gradient is visible and subtle
- [ ] "Intelligent Systems." displays gradient text
- [ ] Gallery API consumed and images display in Projects Teaser and Projects page
- [ ] Blog listing renders posts with category filter and search
- [ ] Blog post page sets correct meta title and description via React Helmet
- [ ] Blog content renders correctly (HTML or Markdown, as appropriate)
- [ ] Career openings load from API
- [ ] Career application form validates all fields and file upload
- [ ] Career application form submits successfully
- [ ] Contact form type selector works correctly
- [ ] `?type=collaboration` pre-selects Collaboration form
- [ ] Both contact form types submit to correct API endpoints
- [ ] All forms show success and error states
- [ ] All pages pass 375px mobile responsiveness (no horizontal scroll, no overflow)
- [ ] Lighthouse performance ≥ 80 on home page
- [ ] Site is live on production domain with SSL certificate

### Phase 3 (Admin Panel) is Done When:

- [ ] Admin login authenticates and stores JWT
- [ ] Browser refresh on admin page stays authenticated
- [ ] Logout clears token and redirects to login
- [ ] Wrong credentials show error, do not redirect
- [ ] AdminSidebar shows correct active state for current route
- [ ] AdminSidebar collapse/expand works
- [ ] Dashboard displays live stats and activity feed
- [ ] Blog CMS: can create, edit, publish, delete a post
- [ ] Blog post created in admin appears on public `/blog`
- [ ] Gallery: can upload, edit metadata, delete an image
- [ ] Gallery changes reflect immediately on public `/projects`
- [ ] Applications: list loads, status updates persist
- [ ] Contacts: list loads, status updates work
- [ ] Collaborations: list loads, status updates work
- [ ] Newsletters: subscriber list renders
- [ ] Career Openings: CRUD operations work
- [ ] Audit Logs: table renders
- [ ] Analytics: renders with empty state handling
- [ ] Security: renders with memory-only IP blocking warning visible
- [ ] Settings: loads and saves
- [ ] All admin tables have loading, error, and empty states
- [ ] ConfirmDialog appears before all destructive actions

### Phase 4 (QA + Delivery) is Done When:

- [ ] Every public form has been submitted end-to-end in production
- [ ] Every admin CRUD operation has been verified in production
- [ ] No console errors in production on any page
- [ ] All gallery images load from production URLs
- [ ] Resume files are downloadable from admin applications view
- [ ] Blog post meta tags are set correctly in production
- [ ] Site loads in under 3 seconds on a standard connection
- [ ] Founder has been walked through the admin panel
- [ ] Founder confirms they can operate the admin independently
- [ ] Handoff README exists: how to run locally, how to deploy, env variables required
- [ ] Founder has acknowledged delivery and confirmed acceptance

---

*IMPLEMENTATION_ROADMAP.md — v2.0*
*Generated from: DESIGN_VISION.md v1.3, architecture-assessment.md, api-reference.md, database-notes.md, company-reference.md*
*Stack finalized: Vite + React + Tailwind + React Router + Axios + TanStack Query + React Hook Form + Framer Motion + shadcn/ui + React Helmet + Lucide React*
*Target delivery: 4–5 weeks from implementation start*
*v2.0: Implementation status updated. Homepage complete. Deviations from v1.0 documented above.*