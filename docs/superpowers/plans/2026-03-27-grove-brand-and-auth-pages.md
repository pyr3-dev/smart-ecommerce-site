# Grove Brand & Auth Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stock Next.js/Supabase starter UI with the Grove brand — landing page, login, and registration — using the Earth & Sage palette and DM Sans typography.

**Architecture:** Each page section is its own focused component in `components/`. The landing page (`app/page.tsx`) assembles them. Auth pages replace their existing form components in place. No new routing is added.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS, shadcn/ui `Input` component, `@supabase/ssr` (auth logic unchanged), DM Sans via `next/font/google`.

> **Note:** This project has no test framework configured. Each task verifies by running `pnpm dev` and inspecting the page in the browser.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `app/layout.tsx` | Font: DM Sans; metadata: Grove |
| Modify | `app/globals.css` | Grove CSS custom property palette tokens |
| Modify | `tailwind.config.ts` | Register `grove.*` color tokens |
| Modify | `.gitignore` | Exclude `.superpowers/` brainstorm files |
| Create | `components/grove-logo.tsx` | SVG leaf mark + wordmark, size variants |
| Create | `components/site-nav.tsx` | Top nav: logo, links, sign-in/start-selling |
| Modify | `components/hero.tsx` | Editorial hero: headline, subline, CTAs, divider |
| Create | `components/product-grid.tsx` | 4-tile static featured product grid |
| Create | `components/value-props.tsx` | Dark 3-column seller value propositions strip |
| Create | `components/seller-cta.tsx` | Seller headline + 3 stat boxes |
| Create | `components/site-footer.tsx` | Minimal footer: logo, nav links, tagline |
| Modify | `app/page.tsx` | Landing page: assemble all sections |
| Modify | `components/login-form.tsx` | Two-panel login: ambient left + form right |
| Modify | `app/auth/login/page.tsx` | Remove outer padding wrapper |
| Modify | `components/sign-up-form.tsx` | Two-panel signup: role toggle + strength bar |
| Modify | `app/auth/sign-up/page.tsx` | Remove outer padding wrapper |

---

## Task 1: Foundation — Font, Palette, Gitignore

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`
- Modify: `tailwind.config.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Replace Geist with DM Sans in `app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Grove — Shop with intention.",
  description: "A marketplace for independent sellers and conscious buyers.",
};

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  display: "swap",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${dmSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Add Grove palette tokens to `app/globals.css`**

Append this block at the end of `app/globals.css`, after the closing `}` of the second `@layer base` block:

```css
/* Grove palette */
:root {
  --grove-bg-base: #F5F2ED;
  --grove-bg-muted: #EAE7E0;
  --grove-bg-dark: #2C2C2C;
  --grove-sage: #7C9A78;
  --grove-sand: #D4C5A9;
  --grove-text-muted: #6B6B5E;
  --grove-text-dim: #A8A89A;
}
```

- [ ] **Step 3: Register `grove.*` colors in `tailwind.config.ts`**

Inside `theme.extend.colors`, add a new `grove` key alongside the existing shadcn tokens:

```ts
grove: {
  base: "#F5F2ED",
  muted: "#EAE7E0",
  dark: "#2C2C2C",
  sage: "#7C9A78",
  sand: "#D4C5A9",
  "text-muted": "#6B6B5E",
  "text-dim": "#A8A89A",
},
```

- [ ] **Step 4: Add `.superpowers/` to `.gitignore`**

Append to the bottom of `.gitignore`:

```
# Brainstorm mockups
.superpowers/
```

- [ ] **Step 5: Verify — run dev and confirm no font or Tailwind errors**

```bash
pnpm dev
```

Expected: server starts without errors. Open `http://localhost:3000` — font has changed (DM Sans, geometric, clean).

- [ ] **Step 6: Commit**

```bash
git add app/layout.tsx app/globals.css tailwind.config.ts .gitignore
git commit -m "feat: add DM Sans font, Grove palette tokens, update metadata"
```

---

## Task 2: GroveLogo Component

**Files:**
- Create: `components/grove-logo.tsx`

- [ ] **Step 1: Create `components/grove-logo.tsx`**

```tsx
import Link from "next/link";

interface GroveLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { icon: 16, text: "text-sm" },
  md: { icon: 22, text: "text-lg" },
  lg: { icon: 28, text: "text-2xl" },
};

export function GroveLogo({
  className,
  showWordmark = true,
  size = "md",
}: GroveLogoProps) {
  const { icon, text } = sizes[size];
  return (
    <Link href="/" className={`flex items-center gap-2 ${className ?? ""}`}>
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 22 22"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 2C11 2 4.5 6.5 4.5 12.5C4.5 16.3 7.4 19.5 11 19.5C14.6 19.5 17.5 16.3 17.5 12.5C17.5 6.5 11 2 11 2Z"
          fill="#7C9A78"
        />
        <path
          d="M11 19.5V22"
          stroke="#2C2C2C"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M8 14C8 14 9.2 12.5 11 12.5C12.8 12.5 14 14 14 14"
          stroke="#F5F2ED"
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
      {showWordmark && (
        <span
          className={`font-semibold tracking-[0.04em] text-[#2C2C2C] ${text}`}
        >
          grove
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Verify — check no TypeScript errors**

```bash
pnpm build 2>&1 | grep "error TS" || echo "No TS errors"
```

Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add components/grove-logo.tsx
git commit -m "feat: add GroveLogo component with SVG leaf mark"
```

---

## Task 3: SiteNav Component

**Files:**
- Create: `components/site-nav.tsx`

- [ ] **Step 1: Create `components/site-nav.tsx`**

```tsx
import Link from "next/link";
import { GroveLogo } from "@/components/grove-logo";

export function SiteNav() {
  return (
    <nav className="w-full flex justify-between items-center px-8 py-4 border-b border-[#2C2C2C]/[0.08] bg-[#F5F2ED]">
      <GroveLogo />
      <div className="hidden md:flex gap-7 text-sm font-normal text-[#6B6B5E]">
        <Link
          href="/marketplace"
          className="hover:text-[#2C2C2C] transition-colors"
        >
          Marketplace
        </Link>
        <Link
          href="/sellers"
          className="hover:text-[#2C2C2C] transition-colors"
        >
          Sellers
        </Link>
        <Link href="/about" className="hover:text-[#2C2C2C] transition-colors">
          About
        </Link>
      </div>
      <div className="flex gap-3 items-center">
        <Link
          href="/auth/login"
          className="text-xs font-normal text-[#2C2C2C] px-4 py-2 border border-[#2C2C2C]/25 rounded-[3px] hover:border-[#2C2C2C]/50 transition-colors"
        >
          Sign in
        </Link>
        <Link
          href="/auth/sign-up"
          className="text-xs font-medium text-[#F5F2ED] bg-[#2C2C2C] px-4 py-2 rounded-[3px] hover:bg-[#3D3D35] transition-colors"
        >
          Start selling
        </Link>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/site-nav.tsx
git commit -m "feat: add SiteNav component"
```

---

## Task 4: Hero Rewrite

**Files:**
- Modify: `components/hero.tsx`

- [ ] **Step 1: Replace `components/hero.tsx` entirely**

```tsx
import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-8 pt-16 pb-12">
      <p className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#7C9A78] mb-5">
        Independent shops · Conscious commerce
      </p>
      <h1 className="text-5xl lg:text-[52px] font-medium leading-[1.08] tracking-[-0.03em] text-[#2C2C2C] mb-5 max-w-2xl">
        A marketplace worth{" "}
        <em className="not-italic font-light text-[#7C9A78]">caring about.</em>
      </h1>
      <p className="text-base font-light text-[#6B6B5E] leading-[1.7] max-w-[460px] mb-9">
        Discover products from independent sellers who build with care. Shop
        with intention. Sell with purpose.
      </p>
      <div className="flex gap-3 items-center flex-wrap justify-center">
        <Link
          href="/auth/sign-up"
          className="bg-[#2C2C2C] text-[#F5F2ED] text-sm font-medium px-7 py-3 rounded-[3px] hover:bg-[#3D3D35] transition-colors"
        >
          Start selling free
        </Link>
        <Link
          href="/marketplace"
          className="text-sm font-normal text-[#2C2C2C] px-5 py-3 border-b border-[#2C2C2C]/30 hover:border-[#2C2C2C] transition-colors"
        >
          Browse the marketplace →
        </Link>
      </div>
      <div className="w-full h-px bg-gradient-to-r from-transparent via-[#2C2C2C]/10 to-transparent mt-12" />
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/hero.tsx
git commit -m "feat: rewrite Hero component with Grove editorial design"
```

---

## Task 5: ProductGrid Component

**Files:**
- Create: `components/product-grid.tsx`

- [ ] **Step 1: Create `components/product-grid.tsx`**

```tsx
const FEATURED_PRODUCTS = [
  {
    shop: "Terra Studio",
    name: "Linen throw, natural",
    price: "$48",
    bg: "from-[#D4C5A9] to-[#C4B49A]",
  },
  {
    shop: "Bough & Co.",
    name: "Sage candle set",
    price: "$34",
    bg: "from-[#7C9A78] to-[#5C7A58]",
  },
  {
    shop: "Darkwood Craft",
    name: "Walnut serving board",
    price: "$92",
    bg: "from-[#2C2C2C] to-[#1A1A1A]",
  },
  {
    shop: "Mend Supply",
    name: "Ceramic mug, oat",
    price: "$26",
    bg: "from-[#B8A898] to-[#A09080]",
  },
];

export function ProductGrid() {
  return (
    <section className="px-8 pb-12">
      <div className="flex items-center gap-4 mb-5">
        <p className="text-[11px] font-medium tracking-[0.12em] uppercase text-[#6B6B5E] shrink-0">
          Featured from the marketplace
        </p>
        <div className="flex-1 h-px bg-[#2C2C2C]/10" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {FEATURED_PRODUCTS.map((product) => (
          <div
            key={product.name}
            className="rounded-md overflow-hidden bg-[#EAE7E0]"
          >
            <div
              className={`aspect-[3/4] bg-gradient-to-br ${product.bg}`}
            />
            <div className="p-3">
              <p className="text-[9px] font-medium tracking-[0.1em] uppercase text-[#7C9A78] mb-1">
                {product.shop}
              </p>
              <p className="text-xs font-normal text-[#2C2C2C] mb-0.5">
                {product.name}
              </p>
              <p className="text-xs font-medium text-[#2C2C2C]">
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/product-grid.tsx
git commit -m "feat: add ProductGrid component with static featured tiles"
```

---

## Task 6: ValueProps Component

**Files:**
- Create: `components/value-props.tsx`

- [ ] **Step 1: Create `components/value-props.tsx`**

```tsx
function ZeroFeesIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="#7C9A78" strokeWidth="1.5" />
      <path
        d="M10 16C10 12.7 12.7 10 16 10C19.3 10 22 12.7 22 16"
        stroke="#F5F2ED"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M16 16V22"
        stroke="#7C9A78"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PayoutsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="4" y="8" width="24" height="18" rx="2" stroke="#7C9A78" strokeWidth="1.5" />
      <path d="M4 13H28" stroke="#F5F2ED" strokeWidth="1.5" />
      <path
        d="M10 18H14"
        stroke="#7C9A78"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 4L20 12H28L22 17.5L24.5 26L16 21L7.5 26L10 17.5L4 12H12L16 4Z"
        stroke="#7C9A78"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const VALUES = [
  {
    Icon: ZeroFeesIcon,
    title: "Zero listing fees",
    desc: "Open your shop and list your first 50 products for free. Pay only when you sell.",
  },
  {
    Icon: PayoutsIcon,
    title: "Instant payouts",
    desc: "Revenue lands in your account the same day. No holds, no waiting periods.",
  },
  {
    Icon: AnalyticsIcon,
    title: "Built-in analytics",
    desc: "Understand your buyers, track what sells, and grow with data you can actually use.",
  },
];

export function ValueProps() {
  return (
    <section className="bg-[#2C2C2C] px-8 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
      {VALUES.map(({ Icon, title, desc }) => (
        <div key={title}>
          <Icon />
          <h3 className="text-[15px] font-medium text-[#F5F2ED] mt-4 mb-2">
            {title}
          </h3>
          <p className="text-[13px] font-light text-[#A8A89A] leading-relaxed">
            {desc}
          </p>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/value-props.tsx
git commit -m "feat: add ValueProps component"
```

---

## Task 7: SellerCta Component

**Files:**
- Create: `components/seller-cta.tsx`

- [ ] **Step 1: Create `components/seller-cta.tsx`**

```tsx
import Link from "next/link";

const STATS = [
  { number: "2.4%", label: "transaction fee, flat" },
  { number: "50+", label: "free product listings" },
  { number: "0 day", label: "payout delay" },
];

export function SellerCta() {
  return (
    <section className="px-8 py-14 flex flex-col md:flex-row justify-between items-start md:items-center gap-10">
      <div className="flex-1">
        <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#7C9A78] mb-4">
          For sellers
        </p>
        <h2 className="text-3xl font-medium leading-[1.15] tracking-[-0.02em] text-[#2C2C2C] mb-4">
          Your shop.
          <br />
          Your terms.
          <br />
          Your growth.
        </h2>
        <p className="text-sm font-light text-[#6B6B5E] leading-[1.7] max-w-[360px] mb-7">
          Grove gives independent sellers the tools to run a real business —
          without the complexity or the platform taking the lion&apos;s share.
        </p>
        <Link
          href="/auth/sign-up"
          className="inline-block bg-[#2C2C2C] text-[#F5F2ED] text-sm font-medium px-7 py-3 rounded-[3px] hover:bg-[#3D3D35] transition-colors"
        >
          Open your shop →
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {STATS.map(({ number, label }) => (
          <div key={label} className="bg-[#EAE7E0] rounded-lg px-6 py-5 min-w-[160px]">
            <p className="text-3xl font-semibold tracking-[-0.02em] text-[#2C2C2C]">
              {number}
            </p>
            <p className="text-[11px] font-light text-[#6B6B5E] mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/seller-cta.tsx
git commit -m "feat: add SellerCta component with stat boxes"
```

---

## Task 8: SiteFooter Component

**Files:**
- Create: `components/site-footer.tsx`

- [ ] **Step 1: Create `components/site-footer.tsx`**

```tsx
import Link from "next/link";
import { GroveLogo } from "@/components/grove-logo";

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-[#2C2C2C]/[0.08] px-8 py-7 flex flex-col sm:flex-row justify-between items-center gap-4">
      <GroveLogo size="sm" />
      <div className="flex gap-6 text-xs text-[#6B6B5E]">
        <Link href="/privacy" className="hover:text-[#2C2C2C] transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-[#2C2C2C] transition-colors">
          Terms
        </Link>
        <Link href="/help" className="hover:text-[#2C2C2C] transition-colors">
          Help
        </Link>
      </div>
      <p className="text-xs font-light text-[#A8A89A] italic">
        Shop with intention.
      </p>
    </footer>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/site-footer.tsx
git commit -m "feat: add SiteFooter component"
```

---

## Task 9: Landing Page Assembly

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace `app/page.tsx` entirely**

```tsx
import { SiteNav } from "@/components/site-nav";
import { Hero } from "@/components/hero";
import { ProductGrid } from "@/components/product-grid";
import { ValueProps } from "@/components/value-props";
import { SellerCta } from "@/components/seller-cta";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#F5F2ED]">
      <SiteNav />
      <div className="flex-1 flex flex-col">
        <Hero />
        <ProductGrid />
        <ValueProps />
        <SellerCta />
      </div>
      <SiteFooter />
    </main>
  );
}
```

- [ ] **Step 2: Verify in browser**

```bash
pnpm dev
```

Open `http://localhost:3000`. Check:
- Nav: grove logo, three nav links, Sign in + Start selling buttons
- Hero: headline with italic sage accent, two CTAs, gradient divider
- Product grid: 4 tiles with gradient placeholders, shop name, product name, price
- Dark value props strip: 3 columns with SVG icons
- Seller CTA: stacked headline + 3 stat boxes
- Footer: logo, links, italic tagline

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: assemble Grove landing page"
```

---

## Task 10: Login Page Redesign

**Files:**
- Modify: `components/login-form.tsx`
- Modify: `app/auth/login/page.tsx`

- [ ] **Step 1: Replace `components/login-form.tsx` entirely**

```tsx
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { GroveLogo } from "@/components/grove-logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col min-h-screen bg-[#F5F2ED]", className)}
      {...props}
    >
      {/* Brand strip */}
      <div className="px-7 py-5 border-b border-[#2C2C2C]/[0.07]">
        <GroveLogo />
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1">
        {/* Left ambient panel */}
        <div className="hidden md:flex w-[42%] bg-[#2C2C2C] flex-col justify-between p-10">
          <div>
            <p className="text-[15px] font-light text-[#F5F2ED] leading-[1.65] italic">
              &ldquo;The best thing I ever did for my craft was find a platform
              that{" "}
              <span className="not-italic font-medium text-[#7C9A78]">
                gets out of the way.
              </span>
              &rdquo;
            </p>
            <div className="flex gap-1.5 mt-5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#7C9A78]" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
            </div>
            <p className="text-[10px] text-[#6B6B5E] font-light mt-2">
              — Mara, ceramics seller
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#D4C5A9] to-[#C4B49A]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#7C9A78] to-[#5C7A58]" />
            <div className="aspect-square rounded-[4px] bg-[#3D3D35]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#B8A898] to-[#A09080]" />
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#7C9A78] mb-3">
              Welcome back
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-[#2C2C2C] mb-1.5">
              Sign in to Grove
            </h1>
            <p className="text-[13px] font-light text-[#6B6B5E] leading-relaxed mb-7">
              Continue to your shop or your orders.
            </p>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-medium tracking-[0.08em] uppercase text-[#6B6B5E] mb-1.5"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#EAE7E0] border-transparent focus:border-[#7C9A78] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-[11px] font-medium tracking-[0.08em] uppercase text-[#6B6B5E]"
                  >
                    Password
                  </label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-[11px] text-[#7C9A78] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#EAE7E0] border-transparent focus:border-[#7C9A78] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2C2C2C] text-[#F5F2ED] text-sm font-medium py-3 rounded-[3px] hover:bg-[#3D3D35] transition-colors disabled:opacity-50 mt-2"
              >
                {isLoading ? "Signing in…" : "Sign in →"}
              </button>
            </form>

            <p className="text-xs font-light text-[#6B6B5E] text-center mt-5">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/sign-up"
                className="text-[#2C2C2C] font-medium border-b border-[#2C2C2C]/30 pb-px hover:border-[#2C2C2C]"
              >
                Join Grove
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/auth/login/page.tsx`**

```tsx
import { LoginForm } from "@/components/login-form";

export default function Page() {
  return <LoginForm />;
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/auth/login`. Check:
- Grove logo top-left with bottom border
- Left dark panel with italic testimonial quote, dot indicator, 2×2 product tiles
- Right panel: "Welcome back" sage eyebrow, "Sign in to Grove" heading, email + password fields on muted bg, focused input shows sage border, "Forgot password?" link right-aligned
- "Sign in →" full-width dark button
- "Join Grove" link at bottom

- [ ] **Step 4: Commit**

```bash
git add components/login-form.tsx app/auth/login/page.tsx
git commit -m "feat: redesign login page with Grove two-panel layout"
```

---

## Task 11: Registration Page Redesign

**Files:**
- Modify: `components/sign-up-form.tsx`
- Modify: `app/auth/sign-up/page.tsx`

- [ ] **Step 1: Replace `components/sign-up-form.tsx` entirely**

```tsx
"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { GroveLogo } from "@/components/grove-logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Role = "buyer" | "seller";

function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const passwordStrength = getPasswordStrength(password);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setError("Passwords do not match");
      return;
    }
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: { role },
        },
      });
      if (error) throw error;
      router.push("/auth/sign-up-success");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col min-h-screen bg-[#F5F2ED]", className)}
      {...props}
    >
      {/* Brand strip */}
      <div className="px-7 py-5 border-b border-[#2C2C2C]/[0.07]">
        <GroveLogo />
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1">
        {/* Left ambient panel */}
        <div className="hidden md:flex w-[42%] bg-[#2C2C2C] flex-col justify-between p-10">
          <div>
            <p className="text-[15px] font-light text-[#F5F2ED] leading-[1.65] italic">
              &ldquo;I opened my Grove shop in{" "}
              <span className="not-italic font-medium text-[#7C9A78]">
                20 minutes.
              </span>{" "}
              First sale came three days later.&rdquo;
            </p>
            <div className="flex gap-1.5 mt-5">
              <span className="w-[5px] h-[5px] rounded-full bg-[#7C9A78]" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
              <span className="w-[5px] h-[5px] rounded-full bg-white/20" />
            </div>
            <p className="text-[10px] text-[#6B6B5E] font-light mt-2">
              — Theo, leather goods
            </p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#7C9A78] to-[#5C7A58]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#D4C5A9] to-[#C4B49A]" />
            <div className="aspect-square rounded-[4px] bg-gradient-to-br from-[#B8A898] to-[#A09080]" />
            <div className="aspect-square rounded-[4px] bg-[#3D3D35]" />
          </div>
        </div>

        {/* Right form panel */}
        <div className="flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm">
            <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-[#7C9A78] mb-3">
              Get started free
            </p>
            <h1 className="text-2xl font-medium tracking-[-0.02em] text-[#2C2C2C] mb-1.5">
              Create your account
            </h1>
            <p className="text-[13px] font-light text-[#6B6B5E] leading-relaxed mb-5">
              Joining as a…
            </p>

            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-1.5 mb-6">
              {(["buyer", "seller"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={cn(
                    "py-2.5 rounded-[3px] text-xs capitalize transition-colors",
                    role === r
                      ? "bg-[#F5F2ED] border border-[#2C2C2C] text-[#2C2C2C] font-medium"
                      : "bg-[#EAE7E0] border border-transparent text-[#6B6B5E] hover:text-[#2C2C2C] font-normal"
                  )}
                >
                  {r === "buyer" ? "🛍 Buyer" : "🏪 Seller"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSignUp} className="flex flex-col gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-medium tracking-[0.08em] uppercase text-[#6B6B5E] mb-1.5"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#EAE7E0] border-transparent focus:border-[#7C9A78] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-medium tracking-[0.08em] uppercase text-[#6B6B5E] mb-1.5"
                >
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#EAE7E0] border-transparent focus:border-[#7C9A78] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
                {password.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-[3px] flex-1 rounded-full transition-colors",
                          i <= passwordStrength
                            ? "bg-[#7C9A78]"
                            : "bg-[#EAE7E0]"
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label
                  htmlFor="repeat-password"
                  className="block text-[11px] font-medium tracking-[0.08em] uppercase text-[#6B6B5E] mb-1.5"
                >
                  Confirm password
                </label>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="bg-[#EAE7E0] border-transparent focus:border-[#7C9A78] focus-visible:ring-0 focus-visible:ring-offset-0 rounded-[4px]"
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#2C2C2C] text-[#F5F2ED] text-sm font-medium py-3 rounded-[3px] hover:bg-[#3D3D35] transition-colors disabled:opacity-50 mt-2"
              >
                {isLoading ? "Creating account…" : "Create account →"}
              </button>
            </form>

            <p className="text-xs font-light text-[#6B6B5E] text-center mt-5">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-[#2C2C2C] font-medium border-b border-[#2C2C2C]/30 pb-px hover:border-[#2C2C2C]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Replace `app/auth/sign-up/page.tsx`**

```tsx
import { SignUpForm } from "@/components/sign-up-form";

export default function Page() {
  return <SignUpForm />;
}
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/auth/sign-up`. Check:
- Grove logo top-left, border strip
- Left dark panel with different testimonial quote (Theo) and different tile order
- "Get started free" sage eyebrow, "Create your account" heading
- Buyer/Seller toggle: active state has white bg + dark border, inactive is muted
- Email field, Password field with strength bar (4 sage segments filling as you type)
- Confirm password field
- "Create account →" dark button
- "Sign in" link at bottom

- [ ] **Step 4: Run a production build to catch any type errors**

```bash
pnpm build
```

Expected: build completes with no errors. Fix any TypeScript errors before committing.

- [ ] **Step 5: Commit**

```bash
git add components/sign-up-form.tsx app/auth/sign-up/page.tsx
git commit -m "feat: redesign registration page with role toggle and password strength"
```
