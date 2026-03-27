# Grove — Brand Identity, Landing Page & Auth Pages Design

**Date:** 2026-03-27
**Scope:** Landing page (`app/page.tsx`), login page (`app/auth/login/`), registration page (`app/auth/sign-up/`), and shared brand components.

---

## 1. Brand Identity

### Name
**Grove** — evokes natural growth, community, and permanence. Short, language-neutral, domain-friendly.
Tagline: *"Shop with intention."*

### Logo
- **Mark:** SVG leaf (teardrop/droplet shape filled in sage green `#7C9A78`, with a short charcoal stem and a subtle white inner curve)
- **Wordmark:** lowercase `grove` in DM Sans 600, letter-spacing `0.04em`, charcoal `#2C2C2C`
- **Usage:** mark + wordmark inline in nav; mark alone at small sizes (favicon, app icon)

### Color Palette — Earth & Sage
| Token | Hex | Usage |
|---|---|---|
| `--bg-base` | `#F5F2ED` | Page background, card surfaces |
| `--bg-muted` | `#EAE7E0` | Input fields, muted tiles |
| `--bg-dark` | `#2C2C2C` | Dark sections, primary button, nav text |
| `--accent-sage` | `#7C9A78` | Primary accent: logo, focused inputs, labels, links |
| `--sand` | `#D4C5A9` | Product tile fill variant, decorative |
| `--text-muted` | `#6B6B5E` | Body copy, secondary labels |
| `--text-dim` | `#A8A89A` | Footer copy, placeholder text |

### Typography
- **Font:** DM Sans (Google Fonts) — single family, weight contrast for hierarchy
- **Headline:** 500 weight, tight letter-spacing (`-0.02em` to `-0.03em`)
- **Body:** 300 weight, `line-height: 1.7`
- **Labels/eyebrows:** 500 weight, uppercase, `letter-spacing: 0.12–0.14em`, sage green
- **Italic accent:** 300 italic in sage green for headline emphasis (e.g. *"caring about."*)

---

## 2. Landing Page (`app/page.tsx` + `components/`)

### Layout: Editorial + Product Grid

**Nav**
- Logo (mark + wordmark) left
- Links center: Marketplace · Sellers · About
- Actions right: "Sign in" (ghost button) + "Start selling" (dark filled button)
- Background: `--bg-base`, bottom border `rgba(44,44,44,0.08)`

**Hero**
- Centered layout, generous top padding (`64px`)
- Eyebrow: `"Independent shops · Conscious commerce"` — sage, uppercase, spaced
- Headline: `"A marketplace worth caring about."` — 52px, weight 500, tight tracking; *"caring about."* in sage italic 300
- Subline: 16px weight 300 muted, max-width `460px`, centered
- CTAs: "Start selling free" (dark filled) + "Browse the marketplace →" (text with underline arrow)
- Thin gradient divider below hero

**Product Grid**
- Section label: `"Featured from the marketplace"` — muted uppercase with trailing rule line
- 4-column grid of product tiles, each: 3:4 aspect image placeholder → shop name (sage, tiny caps) → product name → price
- Tile image backgrounds use palette colors as placeholders (replaced with real images in production)

**Value Props**
- Full-width dark (`#2C2C2C`) 3-column strip
- Icons: SVG outlines in sage green
- Titles in `#F5F2ED`, body in `#A8A89A`
- Content: Zero listing fees · Instant payouts · Built-in analytics

**Seller CTA Section**
- Two-column: left = headline + subtext + CTA button; right = 3 stat boxes
- Headline: `"Your shop. Your terms. Your growth."` — 32px, weight 500
- Stat boxes on `--bg-muted` background: 2.4% flat fee · 50 free listings · 0-day payout delay
- (Stats are illustrative — update with real platform values before launch)

**Footer**
- 3-part: logo left · nav links center · tagline right
- Minimal, 1px top border

### Files to create/replace
- `app/page.tsx` — full rewrite
- `components/hero.tsx` — full rewrite (no longer Supabase starter hero)
- `components/site-nav.tsx` — new component
- `components/product-grid.tsx` — new component (static featured tiles initially)
- `components/value-props.tsx` — new component
- `components/seller-cta.tsx` — new component
- `components/site-footer.tsx` — new component
- `components/grove-logo.tsx` — SVG logo mark + wordmark component

---

## 3. Login Page (`app/auth/login/page.tsx` + `components/login-form.tsx`)

### Layout: Two-Panel
- Left panel (42% width, `#2C2C2C`): seller testimonial quote in italic light white, rotating dot indicator, 2×2 product tile grid in palette colors
- Right panel: form content

### Form Content
- Eyebrow: `"Welcome back"` — sage uppercase
- Heading: `"Sign in to Grove"` — 24px weight 500
- Subline: `"Continue to your shop or your orders."` — muted 300
- Fields: Email + Password
- Password field row: label left + "Forgot password?" link right (sage)
- Submit button: full-width dark filled `"Sign in →"`
- Footer: `"Don't have an account? Join Grove"` link

### Input Style
- Background: `--bg-muted` (`#EAE7E0`)
- Border: transparent default → sage `#7C9A78` on focus
- Label: 11px uppercase spaced, muted

---

## 4. Registration Page (`app/auth/sign-up/page.tsx` + `components/sign-up-form.tsx`)

### Layout: Two-Panel (same structure as login)
- Left panel quote variant: different testimonial, tile grid with shuffled color order

### Form Content
- Eyebrow: `"Get started free"` — sage uppercase
- Heading: `"Create your account"` — 24px weight 500
- Subline: `"Joining as a…"` — leads into role toggle
- **Role toggle** (buyer/seller): 2-button toggle, maps to `user_role` enum (`buyer` / `seller`); selected state = white bg + dark border + dark text; default = muted bg + muted text. No shop name field on registration — sellers name their shop after sign-up in the dashboard.
- Fields: Email + Password
- **Password strength bar**: 4 segments below password field, filled progressively in sage green as password complexity increases (client-side only, no backend dependency)
- Submit button: full-width dark filled `"Create account →"`
- Footer: `"Already have an account? Sign in"` link

### Auth Logic
- Existing Supabase `signUp` call is preserved; role selection is passed via `options.data.role` in the sign-up call so it lands in `profiles.user_role`
- Redirect on success: `/auth/sign-up-success` (unchanged)

---

## 5. Shared Infrastructure

### Global CSS (`app/globals.css`)
Add CSS custom properties for the palette tokens above so they're available across components without Tailwind config changes. Extend `tailwind.config` to register them as named colors (`sage`, `sand`, `bg-base`, `bg-muted`, `bg-dark`).

### Font Loading (`app/layout.tsx`)
- Replace `Geist` with `DM Sans` from `next/font/google`
- Weights: 300, 400, 500, 600
- Update `metadata.title` to `"Grove — Shop with intention"` and `metadata.description` accordingly

### `.gitignore`
Add `.superpowers/` to prevent brainstorm mockups from being committed.

---

## 6. Out of Scope
- Dark mode variants (ThemeProvider stays but dark mode styling of new components is deferred)
- Actual product data fetching for the featured grid (static placeholders for now)
- Seller testimonial carousel animation (static single quote for now)
- OAuth / social login buttons
