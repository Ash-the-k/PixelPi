# PixelPi Technologies
# DESIGN_VISION.md

> Design reference for the React frontend redesign.
> All decisions in this document are locked unless explicitly revisited.
> Implementation should follow this document directly without additional design discovery.

---

## 1. Brand Personality

### Core Identity

PixelPi is a precision engineering company, not a digital agency or a SaaS startup.
The design must communicate technical authority and enterprise credibility above all else.

### Primary Audience

The most important visitor is a **potential enterprise or B2B client evaluating vendors**.
Every design decision on the public site should serve that person's evaluation process.

Secondary audiences: startup founders seeking build partners, engineering talent considering joining, institutional research collaborators.

### Personality Directives

| Attribute | Direction |
|-----------|-----------|
| Tone | Serious, technical, authoritative |
| Feel | Precision instrumentation — deliberate, not decorative |
| Confidence | High — the site does not explain itself excessively |
| Warmth | Present but restrained — human without being informal |

### Explicit Anti-Personality

**Do not be playful.** No friendly rounded mascots, no casual copywriting, no visual quirks that signal startup culture over engineering credibility.

---

## 2. Visual Style Direction

### Base Aesthetic

Dark-dominant. The site lives in darkness — deep, cool, and precise.
References: **Linear**, **Vercel**, **Raycast**. Not cyberpunk. Not gaming. Not agency portfolio.

The darkness is purposeful — it communicates focus, depth, and technical environment without becoming theatrical.

### Secondary Design Language

- **Subtle glass surfaces** — depth through translucency on cards, navbars, and modals. Used sparingly, never as the primary surface material.
- **Technical texture** — circuit-trace overlays, data grid patterns, or topographic elements used as background accents in 1–2 sections maximum. Never decorative wallpaper.

### Visual Restraint Rule

Every visual element must earn its place by serving either **hierarchy** or **credibility**. Decoration for its own sake is banned.

---

## 3. Color System

### Public Website Palette

#### Backgrounds

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg-base` | `#080C14` | Page background — cool dark blue-black |
| `--color-bg-elevated` | `#0D1220` | Card surfaces, modals, nav |
| `--color-bg-subtle` | `#131928` | Hover states, section alternates |
| `--color-border` | `rgba(255,255,255,0.08)` | Dividers, card outlines |
| `--color-border-strong` | `rgba(255,255,255,0.14)` | Focused or elevated borders |

#### Text

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#F0F2F8` | Headings, primary content |
| `--color-text-secondary` | `rgba(240,242,248,0.70)` | Subtext, body copy |
| `--color-text-muted` | `rgba(240,242,248,0.45)` | Labels, captions, metadata |
| `--color-text-disabled` | `rgba(240,242,248,0.25)` | Disabled states |

#### Brand Accent — Gradient

The primary accent is a gradient derived from the PixelPi logo colors.

```css
--gradient-brand: linear-gradient(135deg, #332055, #3C4D93);
--gradient-brand-text: linear-gradient(135deg, #7B4FBF, #6B8CFF);
```

`--gradient-brand` is used on filled CTA buttons, gradient dividers, and background glow effects.

`--gradient-brand-text` is the lightened variant used on gradient text (higher contrast on dark backgrounds).

#### Brand Accent — Solid Fallback

Used wherever a gradient cannot be applied (icons, focus rings, underlines, inline links):

```css
--color-accent: #4F6BCC;
--color-accent-hover: #6B8CFF;
--color-accent-subtle: rgba(79,107,204,0.12);
```

#### Semantic Colors

These exist independently of the brand palette and are used exclusively for status communication:

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#22C55E` | Confirmed states, success badges |
| `--color-warning` | `#F59E0B` | Caution, pending states |
| `--color-error` | `#EF4444` | Errors, destructive actions |
| `--color-info` | `#38BDF8` | Informational callouts |

---

### Admin Dashboard Palette

The admin uses a light-mode content surface with a dark brand sidebar.

#### Admin Surfaces

| Token | Value | Usage |
|-------|-------|-------|
| `--admin-bg-base` | `#F8F9FB` | Page background |
| `--admin-bg-surface` | `#FFFFFF` | Cards, panels, form surfaces |
| `--admin-bg-subtle` | `#F1F3F7` | Table row alternates, input backgrounds |
| `--admin-border` | `#E2E6EE` | Dividers, input outlines |
| `--admin-text-primary` | `#111827` | Headings, primary labels |
| `--admin-text-secondary` | `#4B5563` | Body, descriptions |
| `--admin-text-muted` | `#9CA3AF` | Captions, helper text |

#### Admin Sidebar

| Token | Value | Usage |
|-------|-------|-------|
| `--sidebar-bg` | `#0D1220` | Sidebar background (matches public bg-elevated) |
| `--sidebar-text` | `rgba(240,242,248,0.80)` | Nav item labels |
| `--sidebar-text-active` | `#F0F2F8` | Active nav item |
| `--sidebar-border` | `rgba(255,255,255,0.06)` | Sidebar section dividers |
| `--sidebar-hover` | `rgba(255,255,255,0.05)` | Nav item hover background |
| `--sidebar-active` | `rgba(79,107,204,0.18)` | Active nav item background |

#### Admin Accent

One flat accent color for all interactive elements — buttons, links, active states, focus rings, table selections, form elements:

```css
--admin-accent: #4F6BCC;
--admin-accent-hover: #3D5AB8;
--admin-accent-subtle: rgba(79,107,204,0.10);
```

#### Admin Gradient — Reserved Moments Only

The violet→indigo gradient appears exclusively at brand touchpoints in the admin:

- Sidebar logo mark
- Login screen header
- Dashboard welcome/header area
- Select highlight card borders or badges where brand presence is intentional

It does **not** appear on buttons, links, table headers, form elements, or any functional UI component in the admin.

---

## 4. Typography System

### Typeface Stack

| Role | Font | Fallback |
|------|------|---------|
| Display headings (H1, H2) | Space Grotesk | system-ui, sans-serif |
| UI & body copy | Inter | system-ui, sans-serif |
| Technical labels, stats, metadata | IBM Plex Mono | monospace |

### Loading

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

### Type Scale — Public Website

| Token | Size | Line Height | Weight | Font | Usage |
|-------|------|-------------|--------|------|-------|
| `--text-display-xl` | 72–80px | 1.05 | 700 | Space Grotesk | Hero H1 |
| `--text-display-lg` | 52–60px | 1.10 | 700 | Space Grotesk | Section H2 |
| `--text-display-md` | 36–42px | 1.15 | 600 | Space Grotesk | Subsection H3 |
| `--text-display-sm` | 24–28px | 1.25 | 600 | Space Grotesk | Card headings |
| `--text-body-lg` | 18–20px | 1.70 | 400 | Inter | Hero subtext, lead paragraphs |
| `--text-body-md` | 16px | 1.65 | 400 | Inter | Standard body copy |
| `--text-body-sm` | 14px | 1.60 | 400 | Inter | Secondary copy, descriptions |
| `--text-label` | 13px | 1.50 | 500 | Inter | UI labels, nav items, button text |
| `--text-caption` | 12px | 1.50 | 400 | Inter | Captions, footnotes |
| `--text-mono-md` | 14px | 1.60 | 400 | IBM Plex Mono | Stats, metrics, technical data |
| `--text-mono-sm` | 12px | 1.50 | 400 | IBM Plex Mono | Eyebrow lines, badges, code snippets |

### Type Scale — Admin Dashboard

Admin uses Inter exclusively. Space Grotesk does not appear in the admin.

| Usage | Size | Weight |
|-------|------|--------|
| Page titles | 24px | 600 |
| Section headers | 18px | 600 |
| Card titles | 16px | 600 |
| Body / table cells | 14px | 400 |
| Labels / helper text | 13px | 500 |
| Captions | 12px | 400 |
| Mono data (IDs, dates, paths) | 13px IBM Plex Mono | 400 |

### Gradient Text — Application Rule

Applied **only** to 1–3 words within a headline. Never to body copy, labels, or entire paragraphs.

```css
.gradient-text {
  background: var(--gradient-brand-text);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

---

## 5. Layout Philosophy

### Spacing Scale

Base unit: `4px`. All spacing values are multiples of 4.

```css
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
--space-20: 80px
--space-24: 96px
--space-32: 128px
```

### Public Website Spacing Principles

- Section vertical padding: `--space-24` to `--space-32` minimum (96–128px)
- Content never feels crowded — when in doubt, add space
- Internal card padding: `--space-8` to `--space-10` (32–40px)

### Max Widths

```css
--max-width-content: 1200px;   /* Standard content container */
--max-width-text:    720px;    /* Prose and copy blocks */
--max-width-narrow:  560px;    /* Forms, centered callouts */
```

### Grid System

**Default:** Full-width sections with a centered content container at `--max-width-content`.

**Breakout moments:** Deliberately asymmetric layouts used in 2–3 sections maximum. Typical pattern: 55/45 or 60/40 split, text-heavy left with visual right.

Breakout sections should feel intentional, not accidental. If a layout decision requires explanation, it's not confident enough.

### Border Radius

```css
--radius-sm:   4px;   /* Badges, tags, small elements */
--radius-md:   6px;   /* Buttons, inputs, small cards */
--radius-lg:   10px;  /* Feature cards, modals */
--radius-xl:   16px;  /* Large hero cards, image containers */
--radius-full: 9999px; /* Pills only */
```

No element uses zero border radius on the public site. Sharp edges read as unfinished.

The admin uses identical values.

---

## 6. Animation Philosophy

### Guiding Principle

Animation must **reveal** information or **confirm** interaction. It must never draw attention to itself.

### Transition Speed System

Two speeds. Use them consistently — do not invent intermediate values.

```css
--duration-fast:     175ms;   /* Micro-interactions */
--duration-moderate: 275ms;   /* Element entrances, larger transitions */
--easing-standard:   cubic-bezier(0.4, 0, 0.2, 1);
--easing-enter:      cubic-bezier(0.0, 0.0, 0.2, 1);
--easing-exit:       cubic-bezier(0.4, 0.0, 1, 1);
```

#### Fast (175ms) — apply to:

- Button hover/active states
- Link underlines and color shifts
- Focus ring appearance
- Icon transitions
- Toggle switches
- Checkbox and radio states

#### Moderate (275ms) — apply to:

- Section entrance animations (fade + translate-y)
- Card hover elevation changes
- Navigation dropdown open/close
- Modal and drawer open
- Page transition fades

### Scroll-Triggered Entrance Pattern

Elements enter with a combined fade and upward translate. Applied to section headings, feature cards, and stat blocks.

```css
/* Initial state */
opacity: 0;
transform: translateY(20px);

/* Animated state */
opacity: 1;
transform: translateY(0);
transition: opacity 275ms ease-out, transform 275ms ease-out;
```

Stagger delay for grouped elements: `50–80ms` between items.

### Hero Background Animation

A slow-moving radial gradient shift. Pure CSS only — no JavaScript, no canvas, no WebGL.

```css
@keyframes gradient-drift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.hero-bg {
  background: radial-gradient(ellipse at 30% 50%, rgba(51,32,85,0.35) 0%, transparent 60%),
              radial-gradient(ellipse at 70% 50%, rgba(60,77,147,0.25) 0%, transparent 60%),
              var(--color-bg-base);
  background-size: 200% 200%;
  animation: gradient-drift 18s ease infinite;
}
```

Perceptible only on close inspection. The hero should feel alive, not animated.

### Admin Animation Policy

Admin uses `--duration-fast` (175ms) only. No entrance animations. No scroll-triggered reveals. Interactions feel immediate and functional.

---

## 7. Public Website Design Language

### Surface Language

Cards and panels use glass-like depth. Not frosted glass maximalism — one layer of transparency and a subtle border.

```css
.glass-card {
  background: rgba(13, 18, 32, 0.70);
  border: 1px solid var(--color-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: var(--radius-lg);
}
```

Glass surfaces appear in: feature cards, stat blocks, nav (on scroll), gallery overlays. Not on every element.

### Technical Texture Usage

Circuit-trace patterns or dot grid overlays used as background accents in no more than **2 sections** on the full page. Applied at 3–5% opacity. Never over text-heavy content.

### Gradient Usage Rules

| Element | Usage |
|---------|-------|
| Hero H1 (2–3 words) | Gradient text via `--gradient-brand-text` |
| Primary CTA button | Gradient fill via `--gradient-brand` |
| Section dividers | 1px gradient line, 20% opacity |
| Hover glow on cards | Gradient box-shadow at low opacity |
| Hero background | Gradient radial blooms (see animation section) |
| Everything else | Flat accent `--color-accent` |

### CTA Button System

```
Primary:   gradient fill, white text, radius-md, 48px height
Secondary: transparent, accent-color border, accent-color text
Ghost:     text-only with arrow →, no border
```

Primary buttons use the gradient. Secondary and ghost buttons use `--color-accent`.

### Section Structure Pattern

Each major public section follows:

```
Section label   [IBM Plex Mono, --text-mono-sm, --color-text-muted, uppercase]
Section heading [Space Grotesk, --text-display-lg]
Section subtext [Inter, --text-body-lg, --color-text-secondary]
Content grid
```

Not every section requires all four elements. The label is optional and used selectively to orient the visitor.

---

## 8. Hero Section — Final Specification

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ANIMATED RADIAL GRADIENT BACKGROUND                    │
│                                                         │
│  From Prototype to Production · Hardware Through        │
│  Software                                               │
│  [IBM Plex Mono, 12px, --color-text-muted, 0.6 opacity] │
│                                                         │
│  Precision Engineering.                                 │
│  Intelligent Systems.          ← gradient on this line  │
│  [Space Grotesk, 72–80px, 700, white / gradient-text]  │
│                                                         │
│  Engineering for startups, industry, research,          │
│  and education.                                         │
│  [Inter, 18px, --color-text-secondary]                  │
│                                                         │
│  [   Get in Touch   ]   View Our Projects →              │
│  [gradient fill btn]    [ghost text link]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Notes

- Headline is center-aligned on mobile, left-aligned from md breakpoint upward
- "Intelligent Systems." receives gradient text via `--gradient-brand-text`
- Primary CTA is filled gradient button; secondary is ghost/text with arrow
- No hero image or product mockup — the headline commands the space
- Below the hero fold: a trust signal bar (client types, domain count, or a single differentiating stat) before the first content section

---

## 9. Admin Dashboard Design Language

### Layout

Collapsible left sidebar + main content area.

```
┌──────────┬─────────────────────────────────────────────┐
│ SIDEBAR  │  TOPBAR (breadcrumb + user avatar)          │
│ dark bg  ├─────────────────────────────────────────────┤
│          │                                             │
│ Logo     │  CONTENT AREA                               │
│ ──────   │  white/off-white surface                    │
│ Nav      │  Inter typography throughout                │
│ items    │  accent: --admin-accent                     │
│          │                                             │
│ [◄ hide] │                                             │
└──────────┴─────────────────────────────────────────────┘
```

- Sidebar width: 240px expanded, 64px collapsed (icon-only)
- Topbar height: 56px
- Content padding: 32px

### Sidebar Details

- Background: `--sidebar-bg` (`#0D1220`)
- Logo area at top: PixelPi logo mark with gradient applied — the only gradient element in the sidebar
- Nav items: icon + label, 40px height, 8px radius on active state
- Active item: `--sidebar-active` background + `--color-accent` left border (2px)
- Section groupings with muted labels (`CONTENT`, `MANAGEMENT`, `SYSTEM`)
- Collapse toggle at bottom of sidebar

### Admin Component Standards

**Tables:** Clean borders using `--admin-border`, row hover using `--admin-bg-subtle`. Sortable column headers use `--admin-accent` indicator. Status badges use semantic colors.

**Forms:** Input height 40px, border `--admin-border`, focus ring `--admin-accent` at 2px. Label above input, helper text below.

**Cards/Panels:** White background, `--admin-border` border, `--radius-lg` radius, 24px padding.

**Buttons:**

```
Primary:     --admin-accent fill, white text
Secondary:   --admin-border border, --admin-accent text
Destructive: --color-error fill or outline
```

**Status Badges:**

| Status | Background | Text |
|--------|-----------|------|
| Active / Success | `rgba(34,197,94,0.12)` | `#16A34A` |
| Pending / Warning | `rgba(245,158,11,0.12)` | `#B45309` |
| Rejected / Error | `rgba(239,68,68,0.12)` | `#DC2626` |
| Reviewing | `rgba(79,107,204,0.12)` | `#4F6BCC` |
| New | `rgba(240,242,248,0.10)` | `#9CA3AF` |

### Admin vs Public — Clear Boundaries

| Attribute | Public Site | Admin Dashboard |
|-----------|-------------|-----------------|
| Base theme | Dark | Light + dark sidebar |
| Display font | Space Grotesk | ✗ Not used |
| Body font | Inter | Inter |
| Gradient usage | Hero, CTAs, accents | Logo, login, dashboard header only |
| Animation | Purposeful entrances | Fast interactions only |
| Glass surfaces | Yes, selective | No |
| Spacing feel | Generous, editorial | Efficient, information-dense |

---

## 10. Things to Explicitly Avoid

### Visual Anti-Patterns

- **Neon or cyberpunk glow effects** — No glowing text borders, RGB color bleeds, or electric halos. Subtle gradient glows on cards at very low opacity are acceptable. Neon is not.
- **Blur and glass as the primary surface** — Glass is a secondary material. No more than 2–3 glassed elements visible at once. White/dark solid surfaces are the base.
- **Particle systems or canvas backgrounds** — The CSS gradient animation in the hero is the ceiling. No JavaScript-driven particle fields, animated SVG backgrounds, or WebGL effects.
- **Gradient applied everywhere** — The gradient is a premium signal. Overuse destroys it. Apply only to the primary CTA, gradient text in the hero headline, and intentional brand moments.
- **Generic dark web aesthetic** — Dark does not mean sci-fi. No hexagonal grid overlays, no animated circuit boards, no futuristic HUD elements.

### Content and Asset Anti-Patterns

- **Generic corporate stock photography** — No images of people shaking hands, diverse teams at whiteboards, engineers in hard hats looking at tablets, or open-plan office scenes. These destroy credibility with a technical evaluator instantly.
- **Fake hardware or fake team photos** — If the image cannot be real PixelPi work or real team members, use abstract visuals, technical illustrations, or tasteful AI-assisted abstract imagery instead.
- **Generic icon packs** — Do not use Flaticon, Freepik, or unverified icon bundles. Use a single consistent icon library (Lucide, Heroicons, or Phosphor) and never mix sources.
- **Inconsistent imagery register** — All visuals should feel like they belong to the same world. Do not mix photographic product shots with cartoon illustrations with 3D renders on the same page.

### Implementation Anti-Patterns

- **Porting the HTML/CSS structure into React** — The existing site's layout and structure should not be used as a template. Redesign layouts from the design vision, not from the existing HTML.
- **Tailwind without a defined scale** — Do not use arbitrary Tailwind values (`p-[23px]`, `text-[17px]`). Define CSS custom properties (tokens) first and apply Tailwind classes that map to those values. The spacing and type scales in this document are the source of truth.
- **Mixing animation libraries** — Choose one: Framer Motion (recommended for React) or CSS transitions. Do not combine Framer Motion + GSAP + CSS keyframes across the same project. The exception is that the hero gradient animation is CSS-only and does not count against this.
- **Admin and public sharing component styles** — Admin components and public components should be developed as separate systems sharing only the base token layer. A `<Button>` in the admin is not the same component as a `<Button>` on the public site.

---

## 11. Copy Principles

These are not design decisions but they affect how design and copy interact.

- **The site does not over-explain PixelPi.** The hero does not list all six domains. The services section does the listing.
- **Avoid consulting language.** No "end-to-end solutions," "cutting-edge innovation," "leveraging synergies," or "transformative digital experiences."
- **Technical specificity is credibility.** Prefer "Custom PCB Design for IoT Devices" over "Hardware Solutions." Prefer "Embedded Systems Development" over "Deep-Tech Engineering."
- **Headline copy is the founder's voice, not AI-generated marketing.** The hero headline "Precision Engineering. Intelligent Systems." is locked brand language. Section headlines should be written with the same directness.

---

## 12. Information Architecture

### Sitemap — v1

```
pixelpitechnologies.in/
│
├── /  ................................. Home
│   ├── Hero
│   ├── Services (expanded section, 6 domains — no standalone /services page at launch)
│   ├── Why Choose PixelPi
│   ├── Project Metrics
│   ├── Industries Served
│   ├── Projects teaser (4–6 items)  ──→ /projects
│   ├── Collaboration teaser         ──→ /contact
│   ├── Newsletter
│   └── Footer
│
├── /about ............................. About
│   ├── Company story / founding narrative  [placeholder at build → replace pre-launch]
│   ├── Mission statement
│   ├── Vision statement
│   ├── Team / Founder section              [placeholder at build → replace pre-launch]
│   └── Location + contact info
│
├── /projects .......................... Projects (Portfolio)
│   ├── Project grid with domain filters
│   └── Individual items expand inline or as modals
│
├── /blog .............................. Blog
│   ├── Search + category filter
│   └── /blog/:slug .................... Post
│
├── /careers ........................... Careers
│   ├── Current openings
│   ├── Why work with us
│   └── Application form
│
└── /contact ........................... Contact
    ├── Inquiry type selector
    │   ├── Service Inquiry ─────────→ POST /api/contact
    │   ├── Collaboration ───────────→ POST /api/collaboration
    │   └── General ─────────────────→ POST /api/contact
    └── Contact details (phone, email, WhatsApp, location)
```

**6 URL destinations at launch.** `/services` is deferred — it lives as a homepage section until content depth justifies a standalone page. `/about` builds with placeholder content and goes live once founder/team content is available.

---

### Pages vs Homepage Sections

#### What stays on the homepage as a section

| Section | Rationale |
|---------|-----------|
| Hero | Always |
| Services overview | 6-domain expanded section with capability descriptions. Links to `/#services` anchor. |
| Why Choose PixelPi | Marketing differentiators — pure homepage content, no standalone page needed |
| Project Metrics | 4 stats: 10 projects, 30 clients, 2 collaborations, 2 research papers |
| Industries Served | Visual scan section — not deep enough to justify a standalone page |
| Projects teaser | 4–6 selected items with "View All Projects →" link to `/projects` |
| Collaboration teaser | Two-column (industry + academic), CTA → `/contact?type=collaboration` |
| Newsletter signup | Footer-adjacent passive conversion |

#### What lives as a standalone page

| Content | URL | Rationale |
|---------|-----|-----------|
| Company story, mission, vision, team | `/about` | Stable URL for vendor evaluation, not a scroll position |
| Full project/portfolio browse | `/projects` | Full grid + filter experience needs its own destination |
| Blog listing + posts | `/blog`, `/blog/:slug` | Existing, keep as-is |
| Career openings + application | `/careers` | Existing, keep as-is |
| Unified contact + collaboration form | `/contact` | Shareable URL for all inquiry types |

#### What was removed from the sitemap

| Removed | Reason |
|---------|--------|
| `/services` | Insufficient content at launch. Homepage section with anchor links is adequate. Extract when case studies and methodology content exist. |
| `/collaborate` | Not enough standalone content. Collaboration is an inquiry type within `/contact`, surfaced via homepage teaser. |
| `/vision` | Was a nav item pointing to a homepage scroll position. Dissolved into `/about`. |

---

### Navigation

```
[PixelPi Logo]    About  Projects  Blog  Careers    [Get in Touch]
```

#### Rules

- **4 nav items + 1 CTA button.** No more.
- **"Get in Touch" is a gradient-filled CTA button**, right-anchored. It is not a plain nav link.
- **No "Contact" nav item.** Contact is a conversion action, not a browsing destination. Elevating it to a nav link reduces its conversion weight. The CTA button, footer, and contextual CTAs throughout the page serve all contact discovery needs.
- **No "Services" nav item.** Services lives on the homepage. Visitors who want to evaluate services encounter it on scroll or land directly via the footer anchor link.
- **Mobile:** Hamburger drawer. Same 4 items stacked vertically. "Get in Touch" pinned as a full-width button at the bottom of the drawer.

#### Navbar Form — Floating Glass Pill

The navbar is a floating pill-shaped container, horizontally centered, fixed at the top of the viewport. It does not span the full page width.

**Design intent:** The pill form signals intentionality and precision — it reads as a considered design choice rather than a default layout. It aligns with the Linear/Vercel reference aesthetic and suits the compact 4-item nav naturally. A pill navbar with more items would look crowded; with 4 it looks deliberate.

**Constraints for implementation:**

The glass effect must be **visibly translucent** — not a dark floating surface that merely implies glass. Content scrolling beneath should be perceptible through the surface. The blur and opacity values should be tuned against real page content during development, with this as the governing principle: the navbar must remain clearly readable and well-defined at all scroll positions, including over lighter content sections.

- **Opacity:** Tune toward the translucent end of the range. If it looks like a solid dark bar, it's too opaque. If navbar text becomes hard to read or the shape loses definition over varied backgrounds, it's too transparent.
- **Blur:** Increase blur as opacity decreases. The two values move in opposite directions — lower opacity requires stronger blur to prevent the background from reading as noise rather than depth.
- **Border:** A subtle light border is required to define the pill edge at higher translucency. Tune to the minimum value that keeps the shape crisp. No colored border — neutral only.
- **Shadow:** A neutral dark drop shadow only. No colored glow, no brand-colored shadow. The shadow provides depth, not decoration.
- **Border radius:** Large and consistent — the pill reads from its shape, not from drawn borders. Full-pill radius is acceptable if proportions allow; a large fixed radius (40–50px) is the safer default.
- **No glow.** No violet, indigo, or any brand-colored effect on the navbar border or shadow under any state.

**Mobile:** The pill collapses to a standard full-width bar on mobile. Floating pill behavior is a desktop and large-tablet pattern only. On small viewports it creates tap target problems and loses its proportional rationale.

#### Navigation Decisions Log

| Item | Decision | Reason |
|------|----------|--------|
| Services | Removed from nav | No standalone page; homepage section is adequate |
| Collaborate | Removed from nav | Inquiry type within /contact, not a browsable destination |
| Vision | Removed from nav | Was a scroll anchor; moved to /about |
| Why Us | Removed from nav | Homepage section only |
| Gallery | Renamed to Projects | "Gallery" implies art/photography; "Projects" signals B2B portfolio |
| Career → Careers | Corrected | Plural is standard |
| Contact nav link | Replaced by CTA | Button outperforms plain link for primary conversion action |

---

### Footer Structure

```
┌──────────────────┬─────────────┬──────────────────┬──────────────────┐
│ [PixelPi Logo]   │  Company    │  Services        │  Get In Touch    │
│                  │             │                  │                  │
│ Precision        │  About      │  IoT & Embedded  │  Bangalore,      │
│ Engineering.     │  Projects   │  Space & Sat.    │  Karnataka,      │
│ Intelligent      │  Blog       │  PCB Design      │  India           │
│ Systems.         │  Careers    │  Drones & Auto.  │                  │
│                  │  Contact    │  Web & Cloud     │  +91 8088959143  │
│ [LinkedIn]       │             │  AI & Automation │                  │
│                  │             │                  │  info@pixelpi... │
│                  │             │  [anchor links   │                  │
│                  │             │  → /#services    │  [WhatsApp →]    │
│                  │             │  per domain]     │                  │
└──────────────────┴─────────────┴──────────────────┴──────────────────┘
  © 2025 Pixel Pi Technologies LLP  ·  Privacy Policy
```

The Services column uses anchor links (`/#services#iot-embedded`) pointing to the homepage section. When `/services` is eventually extracted as a standalone page, these links upgrade to `/services#iot-embedded` with no structural change to the footer.

---

### CTA System

| CTA | Label | Placement | Destination |
|-----|-------|-----------|-------------|
| Primary | Get in Touch | Navbar, hero, page bottoms | `/contact` |
| Secondary | View Our Projects | Hero, services section | `/projects` |
| Projects page | Start a Project | `/projects` bottom | `/contact` |
| Collaboration | Propose a Collaboration | Homepage collab section | `/contact?type=collaboration` |
| Careers | Apply Now | Opening cards | `/careers#apply` |
| Newsletter | Subscribe | Footer / newsletter section | `POST /api/newsletter` |

**One rule:** Every page has exactly one primary CTA at any given scroll position. Secondary CTAs exist but never compete at equal visual weight.

The `?type=collaboration` query parameter pre-selects the collaboration inquiry type on the contact form. No backend change required — handled client-side on mount.

---

### Contact Form — Unified UX, Split Backend

One `/contact` page. One form. Inquiry type selector at the top morphs the fields. Both existing API endpoints are preserved exactly as-is.

```
/contact
─────────────────────────────────────────────
What are you reaching out about?

  ○ Service Inquiry   ○ Collaboration   ○ General

─────────────────────────────────────────────
Service Inquiry:   name, email, subject, message
                   → POST /api/contact

Collaboration:     name, email, company, type, message
                   → POST /api/collaboration

General:           name, email, subject, message
                   → POST /api/contact
─────────────────────────────────────────────
```

**Rationale:** Two separate form pages creates a visitor decision problem before they've made contact — they must self-categorize before typing a word. A unified form with a type selector eliminates that friction while preserving backend workflow separation.

---

### User Journeys

```
ENTERPRISE CLIENT (evaluating vendor)
  /  →  scroll services section  →  /projects  →  [Start a Project]  →  /contact

INDUSTRY OR ACADEMIC COLLABORATOR
  /  →  scroll collaboration section  →  [Propose a Collaboration]
  →  /contact?type=collaboration

JOB APPLICANT
  /careers  →  opening card  →  [Apply Now]  →  application form
  (usually arrives via direct link or job board, not homepage)

FIRST-TIME VISITOR (company evaluation / due diligence)
  /  →  /about  →  /projects  →  /contact

RETURNING VISITOR OR REFERRAL
  Direct URL → /projects, /blog/:slug, or /about  →  [Get in Touch]
```

---

### /about — Placeholder Strategy

`/about` is part of the v1 sitemap and is treated like any other page during development. It is linked in the navbar, participates in the full user flow, and uses placeholder content throughout the build. Real founder/team content replaces placeholders before launch.

**Minimum content required before launch:**
- Company founding narrative (2–4 paragraphs)
- Mission and vision statements (full versions, not truncated)
- At least one named founder or team member with role
- Location confirmed

---

## Approved Implementation Decisions
*Added post-design-chat. Treat as locked source of truth.*

### Button
- `pill` size: `px-5 h-9 rounded-full text-[14px]` — navbar CTA only
- Primary gradient: `#332055 → #3C4D93 → #3C4D93 → #332055` four-stop symmetric
- Text weight: `font-semibold` (600)
- Base includes `group` class
- Base uses `border border-transparent` overridden per variant
- Transitions: targeted properties, 220ms

### LogoMark
- Final asset: `logo.png` in `/public/`
- Two-line wordmark: "Pixel Pi" + "Technologies"
- Size variants: `sm`, `md`, `lg` (footer), `ph` (mobile navbar), `nav` (desktop navbar)
- LogoMark owns its own `<Link to="/">` — never wrap in external Link

### Navbar
- Desktop: 66px height, 20px padding, fully rounded pill, `size="nav"` logo
- Mobile: single expanding glass container, maxHeight 56px→400px,
  480ms cubic-bezier(0.32,0.72,0,1), content fades at 120ms delay
- No backdrop overlay, no body scroll lock, no side drawer

### Glass Treatment
- blur(3px), rgba(13,18,32,0.65) background
- box-shadow: `0 4px 10px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.10)`
- No border
- Transition: background 175ms ease, box-shadow 175ms ease

### Motion Tokens (implemented in index.css)
- `--duration-fast: 150ms`
- `--duration-hover: 220ms`
- `--duration-moderate: 350ms`
- `--duration-expand: 480ms`
- `--duration-glass: 300ms`
- `--easing-enter: cubic-bezier(0.32, 0.72, 0, 1)`

### Navigation
- ScrollToTop.jsx handles route-level scroll restoration (behavior: instant)
- ScrollToTopButton.jsx: floating glass pill, bottom-right, appears after 400px scroll
- Logo click on `/` scrolls smoothly to top

### Icon System
- Lucide React throughout — single source, never mixed
- No icon-in-box pattern (was removed as AI-template-like)
- Services cards: monospace index number top-left, raw Lucide icon top-right
- Social icons: custom SVG components in SocialIcons.jsx
  (stroke-based for LinkedIn/Instagram/Facebook, filled path for X)
- WhatsApp: custom SVG with tokens --color-whatsapp / --color-whatsapp-hover

### Hover States
- Interactive cards use box-shadow inset technique (not border/background)
  because inline styles override CSS classes
- `.card-interactive:hover { box-shadow: inset 0 0 0 1px var(--color-border-strong); }`

---


*Document version: 1.3*
*Version 1.0: Design system, visual language, hero section, admin dashboard.*
*Version 1.1: Information architecture, sitemap, navigation, CTA system, user journeys, contact form strategy.*
*Version 1.2: Removed Open Implementation Decisions section.*
*Version 1.3: Approved implementation decisions added (Button, LogoMark, Navbar, Glass treatment, Motion tokens, Icon system, Hover states).*
*All locked decisions reflect explicit choices made during the design or implementation process.*