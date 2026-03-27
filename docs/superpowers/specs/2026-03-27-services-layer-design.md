# Grove — Services Layer Design

**Date:** 2026-03-27
**Scope:** `lib/api.ts`, `services/`, `hooks/` — data access and mutation layer for all app modules.

---

## 1. Goals

- Single place per module for all Supabase SDK calls and external HTTP calls
- Uniform `ServiceResult<T>` return type so callers never deal with raw Supabase error objects
- Server actions isolated to `server.ts` files; client-side SDK calls in `client.ts`
- One axios instance (`lib/api.ts`) for any external API calls — never imported from individual service files
- `hooks/` folder reserved for future TanStack Query hooks that wrap service functions

---

## 2. Folder Structure

```
lib/
  api.ts                          ← single axios instance, exported as `api`
services/
  types.ts                        ← ServiceResult<T> union type
  auth/
    client.ts                     ← browser SDK: signIn, signUp, signOut, getSession, resetPassword
    server.ts                     ← server actions: updateProfile, updatePassword
  shops/
    client.ts                     ← getShop, listShops
    server.ts                     ← createShop, updateShop, deleteShop
  products/
    client.ts                     ← getProduct, listProducts
    server.ts                     ← createProduct, updateProduct, deleteProduct
  orders/
    client.ts                     ← getOrder, listOrders
    server.ts                     ← createOrder, updateOrderStatus
  subscriptions/
    client.ts                     ← getSubscription, listPlans
    server.ts                     ← createSubscription, cancelSubscription
  analytics/
    client.ts                     ← getStoreMetrics, getProductMetrics, getPlatformInsights
    server.ts                     ← (empty stub — analytics are read-only for the app)
hooks/
  .gitkeep                        ← reserved for TanStack Query hooks
```

---

## 3. Shared Types (`services/types.ts`)

```ts
export type ServiceResult<T> =
  | { data: T; error: null }
  | { data: null; error: string };
```

All service functions return `Promise<ServiceResult<T>>`. No exceptions propagate to callers — errors are caught and normalized to `{ data: null, error: string }`.

---

## 4. Axios Instance (`lib/api.ts`)

```ts
import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
```

- Used for external HTTP calls only (not for Supabase)
- Callers: `api.get("/path")`, `api.post("/path", body)`
- No interceptors in initial scaffold — add as needed when external APIs are integrated

---

## 5. Module Function Signatures

### `services/auth/client.ts`

```ts
import { User } from "@supabase/supabase-js";
import { ServiceResult } from "@/services/types";

export async function signIn(email: string, password: string): Promise<ServiceResult<User>>;
export async function signUp(email: string, password: string, role: "buyer" | "seller"): Promise<ServiceResult<User>>;
export async function signOut(): Promise<ServiceResult<null>>;
export async function getSession(): Promise<ServiceResult<User | null>>;
export async function resetPassword(email: string): Promise<ServiceResult<null>>;
```

### `services/auth/server.ts`

```ts
"use server";
import { ServiceResult } from "@/services/types";

export async function updateProfile(updates: { fullName?: string; avatarUrl?: string }): Promise<ServiceResult<null>>;
export async function updatePassword(newPassword: string): Promise<ServiceResult<null>>;
```

### `services/shops/client.ts`

```ts
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types"; // generated types

type Shop = Database["public"]["Tables"]["shops"]["Row"];

export async function getShop(shopId: string): Promise<ServiceResult<Shop>>;
export async function listShops(): Promise<ServiceResult<Shop[]>>;
```

### `services/shops/server.ts`

```ts
"use server";
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types";

type ShopInsert = Database["public"]["Tables"]["shops"]["Insert"];
type ShopUpdate = Database["public"]["Tables"]["shops"]["Update"];

export async function createShop(data: ShopInsert): Promise<ServiceResult<null>>;
export async function updateShop(shopId: string, data: ShopUpdate): Promise<ServiceResult<null>>;
export async function deleteShop(shopId: string): Promise<ServiceResult<null>>;
```

### `services/products/client.ts`

```ts
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];

export async function getProduct(productId: string): Promise<ServiceResult<Product>>;
export async function listProducts(shopId: string): Promise<ServiceResult<Product[]>>;
```

### `services/products/server.ts`

```ts
"use server";
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types";

type ProductInsert = Database["public"]["Tables"]["products"]["Insert"];
type ProductUpdate = Database["public"]["Tables"]["products"]["Update"];

export async function createProduct(data: ProductInsert): Promise<ServiceResult<null>>;
export async function updateProduct(productId: string, data: ProductUpdate): Promise<ServiceResult<null>>;
export async function deleteProduct(productId: string): Promise<ServiceResult<null>>;
```

### `services/orders/client.ts`

```ts
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types";

type Order = Database["public"]["Tables"]["orders"]["Row"];

export async function getOrder(orderId: string): Promise<ServiceResult<Order>>;
export async function listOrders(): Promise<ServiceResult<Order[]>>;
```

### `services/orders/server.ts`

```ts
"use server";
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types";

type OrderInsert = Database["public"]["Tables"]["orders"]["Insert"];

export async function createOrder(data: OrderInsert): Promise<ServiceResult<null>>;
export async function updateOrderStatus(orderId: string, status: Database["public"]["Enums"]["order_status"]): Promise<ServiceResult<null>>;
```

### `services/subscriptions/client.ts`

```ts
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types";

type Subscription = Database["public"]["Tables"]["user_subscriptions"]["Row"];
type Plan = Database["public"]["Tables"]["subscription_plans"]["Row"];

export async function getSubscription(): Promise<ServiceResult<Subscription | null>>;
export async function listPlans(): Promise<ServiceResult<Plan[]>>;
```

### `services/subscriptions/server.ts`

```ts
"use server";
import { ServiceResult } from "@/services/types";

export async function createSubscription(planId: string): Promise<ServiceResult<null>>;
export async function cancelSubscription(): Promise<ServiceResult<null>>;
```

### `services/analytics/client.ts`

```ts
import { ServiceResult } from "@/services/types";
import { Database } from "@/lib/supabase/types";

type StoreDailyMetrics = Database["public"]["Tables"]["store_daily_metrics"]["Row"];
type ProductDailyMetrics = Database["public"]["Tables"]["product_daily_metrics"]["Row"];
type PlatformInsights = Database["public"]["Tables"]["platform_insights"]["Row"];

export async function getStoreMetrics(shopId: string, days?: number): Promise<ServiceResult<StoreDailyMetrics[]>>;
export async function getProductMetrics(productId: string, days?: number): Promise<ServiceResult<ProductDailyMetrics[]>>;
export async function getPlatformInsights(): Promise<ServiceResult<PlatformInsights[]>>;
```

### `services/analytics/server.ts`

```ts
"use server";
// Analytics are read-only for the app. The analytics pipeline writes to these tables.
// This file is a stub — add server actions here if admin write operations are needed.
```

---

## 6. TanStack Query Integration Contract

When TanStack Query is added, a `hooks/` layer wraps service functions. The `{ data, error }` contract from services is preserved — the hook's `queryFn` is responsible for throwing when `error` is non-null:

```ts
// hooks/useProducts.ts (future)
import { useQuery } from "@tanstack/react-query";
import { listProducts } from "@/services/products/client";

export function useProducts(shopId: string) {
  return useQuery({
    queryKey: ["products", shopId],
    queryFn: async () => {
      const { data, error } = await listProducts(shopId);
      if (error) throw new Error(error);
      return data;
    },
  });
}
```

Services never throw — hooks always throw for query errors. This keeps services usable outside of React (e.g., in server components and server actions).

---

## 7. Out of Scope

- Supabase type generation (`lib/supabase/types.ts`) — referenced but not generated in this task; use `unknown` or inline types as a temporary stand-in
- TanStack Query installation or hook implementations
- Axios interceptors or request/response transforms
- Optimistic updates or cache invalidation strategies
