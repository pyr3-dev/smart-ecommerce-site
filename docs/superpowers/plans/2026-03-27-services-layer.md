# Services Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold a typed data-access layer (`services/`) with one axios instance (`lib/api.ts`), a shared `ServiceResult<T>` type, and client/server modules for all 6 app domains (auth, shops, products, orders, subscriptions, analytics).

**Architecture:** Each domain gets a `client.ts` (Supabase browser SDK, runs in React) and a `server.ts` (Next.js Server Actions with `'use server'`, mutations only). All functions catch errors internally and return `ServiceResult<T>` — callers never see raw Supabase errors. `lib/api.ts` exports a single axios instance for future external HTTP calls.

**Tech Stack:** TypeScript strict mode, `@supabase/ssr`, axios, Next.js 15 App Router, pnpm

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `lib/api.ts` | Create | Single axios instance exported as `api` |
| `services/types.ts` | Create | `ServiceResult<T>` union type |
| `services/auth/client.ts` | Create | Browser-side auth: signIn, signUp, signOut, getSession, resetPassword |
| `services/auth/server.ts` | Create | Server actions: updateProfile, updatePassword |
| `services/shops/client.ts` | Create | Read shops via browser SDK |
| `services/shops/server.ts` | Create | Mutate shops via server actions |
| `services/products/client.ts` | Create | Read products via browser SDK |
| `services/products/server.ts` | Create | Mutate products via server actions |
| `services/orders/client.ts` | Create | Read orders via browser SDK |
| `services/orders/server.ts` | Create | Mutate orders via server actions |
| `services/subscriptions/client.ts` | Create | Read subscriptions/plans via browser SDK |
| `services/subscriptions/server.ts` | Create | Mutate subscriptions via server actions |
| `services/analytics/client.ts` | Create | Read metrics/insights via browser SDK |
| `services/analytics/server.ts` | Create | Stub — analytics are pipeline-written |
| `hooks/.gitkeep` | Create | Reserve folder for future TanStack Query hooks |

> **Note on Supabase generated types:** `lib/supabase/types.ts` does not exist yet (requires `supabase gen types`). Each service file uses inline row types derived from `schema.sql`. When generated types are added later, replace the inline types with `Database["public"]["Tables"]["<table>"]["Row"]`.

---

### Task 1: Install axios and create `lib/api.ts`

**Files:**
- Modify: `package.json` (via pnpm install)
- Create: `lib/api.ts`

- [ ] **Step 1: Install axios**

```bash
pnpm add axios
```

Expected output: `Done` with axios added to `dependencies` in `package.json`.

- [ ] **Step 2: Create `lib/api.ts`**

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
```

- [ ] **Step 3: Verify TypeScript is happy**

```bash
pnpm build 2>&1 | head -20
```

Expected: Build succeeds or only shows unrelated pre-existing warnings. No type errors from `lib/api.ts`.

- [ ] **Step 4: Commit**

```bash
git add lib/api.ts package.json pnpm-lock.yaml
git commit -m "feat: add axios instance at lib/api.ts"
```

---

### Task 2: Create `services/types.ts`

**Files:**
- Create: `services/types.ts`

- [ ] **Step 1: Create the shared type**

```ts
export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };
```

- [ ] **Step 2: Commit**

```bash
git add services/types.ts
git commit -m "feat: add ServiceResult<T> shared type"
```

---

### Task 3: Create `services/auth/client.ts`

**Files:**
- Create: `services/auth/client.ts`

`User` comes from `@supabase/supabase-js` (already installed as a transitive dep of `@supabase/ssr`). The browser client comes from `@/lib/supabase/client` which exports `createClient()` (no args, returns a Supabase browser client).

- [ ] **Step 1: Create the file**

```ts
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export async function signIn(
  email: string,
  password: string,
): Promise<ServiceResult<User>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { data: null, error: error.message };
  return { data: data.user, error: null };
}

export async function signUp(
  email: string,
  password: string,
  role: "buyer" | "seller",
): Promise<ServiceResult<User>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/protected`,
      data: { user_role: role },
    },
  });
  if (error) return { data: null, error: error.message };
  if (!data.user) return { data: null, error: "Sign-up returned no user" };
  return { data: data.user, error: null };
}

export async function signOut(): Promise<ServiceResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function getSession(): Promise<ServiceResult<User | null>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { data: null, error: error.message };
  return { data: data.user, error: null };
}

export async function resetPassword(email: string): Promise<ServiceResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
```

- [ ] **Step 2: Verify no type errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: No errors referencing `services/auth/client.ts`.

- [ ] **Step 3: Commit**

```bash
git add services/auth/client.ts
git commit -m "feat: add auth client service"
```

---

### Task 4: Create `services/auth/server.ts`

**Files:**
- Create: `services/auth/server.ts`

The server Supabase client (`@/lib/supabase/server`) exports `async createClient()` — note it is `async` unlike the browser one.

- [ ] **Step 1: Create the file**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";

export async function updateProfile(updates: {
  fullName?: string;
  avatarUrl?: string;
}): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(updates.fullName !== undefined && { full_name: updates.fullName }),
      ...(updates.avatarUrl !== undefined && { avatar_url: updates.avatarUrl }),
    })
    .eq("id", user.id);

  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function updatePassword(
  newPassword: string,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
```

- [ ] **Step 2: Verify no type errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: No errors referencing `services/auth/server.ts`.

- [ ] **Step 3: Commit**

```bash
git add services/auth/server.ts
git commit -m "feat: add auth server actions"
```

---

### Task 5: Create `services/shops/client.ts` and `services/shops/server.ts`

**Files:**
- Create: `services/shops/client.ts`
- Create: `services/shops/server.ts`

Inline row types based on `schema.sql`. `shops` columns used here: `id`, `owner_id`, `name`, `slug`, `description`, `logo_url`, `banner_url`, `status`, `created_at`, `updated_at`.

- [ ] **Step 1: Create `services/shops/client.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Shop = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export async function getShop(shopId: string): Promise<ServiceResult<Shop>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listShops(): Promise<ServiceResult<Shop[]>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("shops").select("*");
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
```

- [ ] **Step 2: Create `services/shops/server.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";

export type ShopInsert = {
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
};

export type ShopUpdate = Partial<ShopInsert>;

export async function createShop(data: ShopInsert): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("shops").insert(data);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function updateShop(
  shopId: string,
  data: ShopUpdate,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("shops").update(data).eq("id", shopId);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function deleteShop(shopId: string): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("shops").delete().eq("id", shopId);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}
```

- [ ] **Step 3: Verify no type errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: No errors referencing `services/shops/`.

- [ ] **Step 4: Commit**

```bash
git add services/shops/client.ts services/shops/server.ts
git commit -m "feat: add shops service (client + server)"
```

---

### Task 6: Create `services/products/client.ts` and `services/products/server.ts`

**Files:**
- Create: `services/products/client.ts`
- Create: `services/products/server.ts`

`products` columns: `id`, `shop_id`, `name`, `slug`, `description`, `price`, `compare_at_price`, `status`, `stock_quantity`, `created_at`, `updated_at`.

- [ ] **Step 1: Create `services/products/client.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Product = {
  id: string;
  shop_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  status: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
};

export async function getProduct(
  productId: string,
): Promise<ServiceResult<Product>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", productId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listProducts(
  shopId: string,
): Promise<ServiceResult<Product[]>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("shop_id", shopId);
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
```

- [ ] **Step 2: Create `services/products/server.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";

export type ProductInsert = {
  shop_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  stock_quantity?: number;
};

export type ProductUpdate = Partial<Omit<ProductInsert, "shop_id">>;

export async function createProduct(
  data: ProductInsert,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").insert(data);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function updateProduct(
  productId: string,
  data: ProductUpdate,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update(data)
    .eq("id", productId);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function deleteProduct(
  productId: string,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}
```

- [ ] **Step 3: Verify no type errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: No errors referencing `services/products/`.

- [ ] **Step 4: Commit**

```bash
git add services/products/client.ts services/products/server.ts
git commit -m "feat: add products service (client + server)"
```

---

### Task 7: Create `services/orders/client.ts` and `services/orders/server.ts`

**Files:**
- Create: `services/orders/client.ts`
- Create: `services/orders/server.ts`

`orders` columns: `id`, `buyer_id`, `shop_id`, `status`, `total_amount`, `shipping_address`, `created_at`, `updated_at`. `order_status` enum values (from schema): `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`, `refunded`.

- [ ] **Step 1: Create `services/orders/client.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Order = {
  id: string;
  buyer_id: string;
  shop_id: string;
  status: string;
  total_amount: number;
  shipping_address: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export async function getOrder(orderId: string): Promise<ServiceResult<Order>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listOrders(): Promise<ServiceResult<Order[]>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").select("*");
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
```

- [ ] **Step 2: Create `services/orders/server.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderInsert = {
  shop_id: string;
  total_amount: number;
  shipping_address?: Record<string, unknown>;
};

export async function createOrder(
  data: OrderInsert,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").insert(data);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}
```

- [ ] **Step 3: Verify no type errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: No errors referencing `services/orders/`.

- [ ] **Step 4: Commit**

```bash
git add services/orders/client.ts services/orders/server.ts
git commit -m "feat: add orders service (client + server)"
```

---

### Task 8: Create `services/subscriptions/client.ts` and `services/subscriptions/server.ts`

**Files:**
- Create: `services/subscriptions/client.ts`
- Create: `services/subscriptions/server.ts`

`user_subscriptions` columns: `id`, `user_id`, `plan_id`, `status`, `current_period_start`, `current_period_end`, `created_at`. `subscription_plans` columns: `id`, `name`, `description`, `price_monthly`, `price_yearly`, `features`, `tier`.

- [ ] **Step 1: Create `services/subscriptions/client.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
};

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number | null;
  features: Record<string, unknown> | null;
  tier: string;
};

export async function getSubscription(): Promise<
  ServiceResult<Subscription | null>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listPlans(): Promise<ServiceResult<Plan[]>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("price_monthly", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
```

- [ ] **Step 2: Create `services/subscriptions/server.ts`**

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";

export async function createSubscription(
  planId: string,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: "Not authenticated" };

  const now = new Date().toISOString();
  const periodEnd = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await supabase.from("user_subscriptions").insert({
    user_id: user.id,
    plan_id: planId,
    status: "active",
    current_period_start: now,
    current_period_end: periodEnd,
  });
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function cancelSubscription(): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: "Not authenticated" };

  const { error } = await supabase
    .from("user_subscriptions")
    .update({ status: "cancelled" })
    .eq("user_id", user.id);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}
```

- [ ] **Step 3: Verify no type errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: No errors referencing `services/subscriptions/`.

- [ ] **Step 4: Commit**

```bash
git add services/subscriptions/client.ts services/subscriptions/server.ts
git commit -m "feat: add subscriptions service (client + server)"
```

---

### Task 9: Create `services/analytics/client.ts` and `services/analytics/server.ts`

**Files:**
- Create: `services/analytics/client.ts`
- Create: `services/analytics/server.ts`

`store_daily_metrics` columns: `id`, `shop_id`, `date`, `views`, `orders`, `revenue`. `product_daily_metrics` columns: `id`, `product_id`, `date`, `views`, `orders`, `revenue`. `platform_insights` columns: `id`, `date`, `metric_name`, `value`, `metadata`.

- [ ] **Step 1: Create `services/analytics/client.ts`**

```ts
import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type StoreDailyMetrics = {
  id: string;
  shop_id: string;
  date: string;
  views: number;
  orders: number;
  revenue: number;
};

export type ProductDailyMetrics = {
  id: string;
  product_id: string;
  date: string;
  views: number;
  orders: number;
  revenue: number;
};

export type PlatformInsights = {
  id: string;
  date: string;
  metric_name: string;
  value: number;
  metadata: Record<string, unknown> | null;
};

export async function getStoreMetrics(
  shopId: string,
  days = 30,
): Promise<ServiceResult<StoreDailyMetrics[]>> {
  const supabase = createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const { data, error } = await supabase
    .from("store_daily_metrics")
    .select("*")
    .eq("shop_id", shopId)
    .gte("date", since)
    .order("date", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function getProductMetrics(
  productId: string,
  days = 30,
): Promise<ServiceResult<ProductDailyMetrics[]>> {
  const supabase = createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const { data, error } = await supabase
    .from("product_daily_metrics")
    .select("*")
    .eq("product_id", productId)
    .gte("date", since)
    .order("date", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}

export async function getPlatformInsights(): Promise<
  ServiceResult<PlatformInsights[]>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("platform_insights")
    .select("*")
    .order("date", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
```

- [ ] **Step 2: Create `services/analytics/server.ts`**

```ts
"use server";

// Analytics tables are written by the analytics pipeline, not by the app.
// Add server actions here only if admin write operations are needed in the future.
```

- [ ] **Step 3: Verify no type errors**

```bash
pnpm build 2>&1 | head -30
```

Expected: No errors referencing `services/analytics/`.

- [ ] **Step 4: Commit**

```bash
git add services/analytics/client.ts services/analytics/server.ts
git commit -m "feat: add analytics service (client + server stub)"
```

---

### Task 10: Create `hooks/.gitkeep` and final build check

**Files:**
- Create: `hooks/.gitkeep`

- [ ] **Step 1: Create the hooks placeholder**

```bash
mkdir -p hooks && touch hooks/.gitkeep
```

- [ ] **Step 2: Run a full build to confirm the entire layer compiles**

```bash
pnpm build
```

Expected: Build completes with exit code 0. Any pre-existing warnings are acceptable; zero new errors.

- [ ] **Step 3: Commit**

```bash
git add hooks/.gitkeep
git commit -m "feat: reserve hooks/ folder for future TanStack Query hooks"
```
