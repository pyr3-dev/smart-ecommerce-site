-- =============================================================
-- Smart Ecommerce Platform — Supabase Cloud Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
--
-- Paste and execute the whole file at once.
-- =============================================================


-- =============================================================
-- EXTENSIONS
-- =============================================================

create extension if not exists "pg_trgm";   -- fuzzy search
create extension if not exists "unaccent";  -- search ignores accents


-- =============================================================
-- ENUMS
-- =============================================================

create type public.user_role        as enum ('buyer', 'seller', 'admin');
create type public.shop_status      as enum ('pending', 'active', 'suspended');
create type public.product_status   as enum ('draft', 'active', 'archived');
create type public.order_status     as enum ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.billing_interval as enum ('monthly', 'yearly');
create type public.sub_status       as enum ('trialing', 'active', 'cancelled', 'past_due');
create type public.insight_type     as enum ('trending_category', 'top_performing_shop', 'seasonal_trend', 'price_opportunity', 'demand_spike');


-- =============================================================
-- 1. PROFILES
-- Extends Supabase's built-in auth.users table.
-- A row is auto-created here when a user signs up (see trigger
-- at the bottom of this file).
-- =============================================================

create table public.profiles (
  id          uuid                 primary key references auth.users (id) on delete cascade,
  username    text                 not null unique,
  full_name   text,
  avatar_url  text,
  role        public.user_role     not null default 'buyer',
  bio         text,
  created_at  timestamptz          not null default now(),
  updated_at  timestamptz          not null default now()
);

comment on table public.profiles is 'One row per registered user, linked to auth.users.';


-- =============================================================
-- 2. CATEGORIES
-- Self-referencing for nested categories (e.g. Electronics →
-- Phones → Smartphones).
-- =============================================================

create table public.categories (
  id          uuid        primary key default gen_random_uuid(),
  parent_id   uuid        references public.categories (id) on delete set null,
  name        text        not null,
  slug        text        not null unique,
  icon_url    text,
  sort_order  int         not null default 0
);

comment on table public.categories is 'Hierarchical product categories.';


-- =============================================================
-- 3. SHOPS
-- =============================================================

create table public.shops (
  id             uuid               primary key default gen_random_uuid(),
  owner_id       uuid               not null references public.profiles (id) on delete cascade,
  name           text               not null,
  slug           text               not null unique,
  description    text,
  logo_url       text,
  banner_url     text,
  status         public.shop_status not null default 'pending',
  verified       boolean            not null default false,
  contact_email  text,
  created_at     timestamptz        not null default now(),
  updated_at     timestamptz        not null default now()
);

create index idx_shops_owner_id on public.shops (owner_id);
create index idx_shops_status   on public.shops (status);

comment on table public.shops is 'Seller shops. One seller can own one or more shops.';


-- =============================================================
-- 4. PRODUCTS
-- =============================================================

create table public.products (
  id             uuid                  primary key default gen_random_uuid(),
  shop_id        uuid                  not null references public.shops (id) on delete cascade,
  category_id    uuid                  references public.categories (id) on delete set null,
  name           text                  not null,
  slug           text                  not null,
  description    text,
  price          numeric(12, 2)        not null check (price >= 0),
  compare_price  numeric(12, 2)        check (compare_price >= 0),
  stock_qty      int                   not null default 0 check (stock_qty >= 0),
  status         public.product_status not null default 'draft',
  tags           text[]                not null default '{}',
  created_at     timestamptz           not null default now(),
  updated_at     timestamptz           not null default now(),
  unique (shop_id, slug)
);

create index idx_products_shop_id     on public.products (shop_id);
create index idx_products_category_id on public.products (category_id);
create index idx_products_status      on public.products (status);
create index idx_products_name_trgm   on public.products using gin (name gin_trgm_ops);

comment on column public.products.compare_price is 'Original price shown crossed-out when item is on sale.';


-- Product images

create table public.product_images (
  id          uuid    primary key default gen_random_uuid(),
  product_id  uuid    not null references public.products (id) on delete cascade,
  url         text    not null,
  is_primary  boolean not null default false,
  sort_order  int     not null default 0
);

create index idx_product_images_product_id on public.product_images (product_id);


-- Product variants (size, colour, etc.)

create table public.product_variants (
  id              uuid           primary key default gen_random_uuid(),
  product_id      uuid           not null references public.products (id) on delete cascade,
  label           text           not null,
  options         jsonb          not null default '{}',
  price_modifier  numeric(10, 2) not null default 0,
  stock_qty       int            not null default 0 check (stock_qty >= 0),
  sku             text
);

create index idx_product_variants_product_id on public.product_variants (product_id);

comment on column public.product_variants.options is 'e.g. {"color": "Red", "size": "XL"}';


-- =============================================================
-- 5. CART
-- =============================================================

create table public.cart_items (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles (id) on delete cascade,
  product_id  uuid        not null references public.products (id) on delete cascade,
  variant_id  uuid        references public.product_variants (id) on delete set null,
  quantity    int         not null default 1 check (quantity > 0),
  added_at    timestamptz not null default now(),
  unique (user_id, product_id, variant_id)
);

create index idx_cart_items_user_id on public.cart_items (user_id);


-- =============================================================
-- 6. ORDERS
-- =============================================================

create table public.orders (
  id               uuid                primary key default gen_random_uuid(),
  buyer_id         uuid                not null references public.profiles (id) on delete restrict,
  shop_id          uuid                not null references public.shops (id) on delete restrict,
  status           public.order_status not null default 'pending',
  total_amount     numeric(14, 2)      not null check (total_amount >= 0),
  shipping_fee     numeric(10, 2)      not null default 0,
  shipping_address jsonb               not null default '{}',
  payment_ref      text,
  notes            text,
  created_at       timestamptz         not null default now(),
  updated_at       timestamptz         not null default now()
);

create index idx_orders_buyer_id on public.orders (buyer_id);
create index idx_orders_shop_id  on public.orders (shop_id);
create index idx_orders_status   on public.orders (status);

comment on column public.orders.shipping_address is '{"street", "city", "province", "postal_code", "country"}';
comment on column public.orders.payment_ref      is 'External payment gateway transaction ID.';


-- Order line items

create table public.order_items (
  id          uuid           primary key default gen_random_uuid(),
  order_id    uuid           not null references public.orders (id) on delete cascade,
  product_id  uuid           not null references public.products (id) on delete restrict,
  variant_id  uuid           references public.product_variants (id) on delete set null,
  quantity    int            not null check (quantity > 0),
  unit_price  numeric(12, 2) not null,
  subtotal    numeric(14, 2) generated always as (quantity * unit_price) stored
);

create index idx_order_items_order_id   on public.order_items (order_id);
create index idx_order_items_product_id on public.order_items (product_id);


-- =============================================================
-- 7. REVIEWS
-- One review per buyer per product per order.
-- =============================================================

create table public.reviews (
  id          uuid        primary key default gen_random_uuid(),
  buyer_id    uuid        not null references public.profiles (id) on delete cascade,
  product_id  uuid        not null references public.products (id) on delete cascade,
  order_id    uuid        not null references public.orders (id) on delete cascade,
  rating      smallint    not null check (rating between 1 and 5),
  comment     text,
  images      text[]      not null default '{}',
  created_at  timestamptz not null default now(),
  unique (buyer_id, product_id, order_id)
);

create index idx_reviews_product_id on public.reviews (product_id);
create index idx_reviews_buyer_id   on public.reviews (buyer_id);


-- =============================================================
-- 8. SUBSCRIPTIONS
-- Controls access to the premium analytics features.
-- =============================================================

create table public.subscription_plans (
  id          uuid                    primary key default gen_random_uuid(),
  name        text                    not null,
  price       numeric(10, 2)          not null,
  interval    public.billing_interval not null,
  features    jsonb                   not null default '[]',
  is_active   boolean                 not null default true,
  created_at  timestamptz             not null default now()
);

comment on column public.subscription_plans.features
  is 'Array of feature-flag strings e.g. ["shop_scores","product_scores","platform_insights"]';

insert into public.subscription_plans (name, price, interval, features) values
  ('Seller Pro Monthly', 9.99,  'monthly', '["shop_scores","product_scores","platform_insights"]'),
  ('Seller Pro Yearly',  99.00, 'yearly',  '["shop_scores","product_scores","platform_insights"]');


create table public.subscriptions (
  id                    uuid              primary key default gen_random_uuid(),
  user_id               uuid              not null references public.profiles (id) on delete cascade,
  plan_id               uuid              not null references public.subscription_plans (id) on delete restrict,
  status                public.sub_status not null default 'trialing',
  current_period_start  timestamptz       not null default now(),
  current_period_end    timestamptz       not null,
  external_id           text,
  cancelled_at          timestamptz,
  created_at            timestamptz       not null default now(),
  updated_at            timestamptz       not null default now()
);

create index idx_subscriptions_user_id on public.subscriptions (user_id);
create index idx_subscriptions_status  on public.subscriptions (status);

comment on column public.subscriptions.external_id is 'Lemon Squeezy or Stripe subscription ID.';


-- =============================================================
-- 9. ANALYTICS — DAILY SNAPSHOTS
-- Populated by your Next.js API routes / cron jobs.
-- The private analytics engine reads these to produce scores.
-- =============================================================

create table public.shop_daily_metrics (
  id              uuid           primary key default gen_random_uuid(),
  shop_id         uuid           not null references public.shops (id) on delete cascade,
  date            date           not null,
  total_revenue   numeric(16, 2) not null default 0,
  total_orders    int            not null default 0,
  total_views     int            not null default 0,
  unique_visitors int            not null default 0,
  conversion_rate numeric(7, 4),
  avg_order_value numeric(12, 2),
  return_rate     numeric(7, 4),
  unique (shop_id, date)
);

create index idx_shop_daily_metrics_shop_id on public.shop_daily_metrics (shop_id);
create index idx_shop_daily_metrics_date    on public.shop_daily_metrics (date desc);


create table public.product_daily_metrics (
  id                  uuid           primary key default gen_random_uuid(),
  product_id          uuid           not null references public.products (id) on delete cascade,
  date                date           not null,
  views               int            not null default 0,
  cart_adds           int            not null default 0,
  orders              int            not null default 0,
  revenue             numeric(14, 2) not null default 0,
  avg_rating          numeric(3, 2),
  stock_turnover_rate numeric(7, 4),
  unique (product_id, date)
);

create index idx_product_daily_metrics_product_id on public.product_daily_metrics (product_id);
create index idx_product_daily_metrics_date       on public.product_daily_metrics (date desc);


-- User events — no partitioning (avoids the composite PK error).
-- Use Supabase's built-in pg_cron to archive old rows if needed.

create table public.user_events (
  id          uuid        primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid        references public.profiles (id) on delete set null,
  shop_id     uuid        references public.shops (id) on delete set null,
  product_id  uuid        references public.products (id) on delete set null,
  event_type  text        not null check (event_type in ('view', 'cart_add', 'purchase', 'search', 'wishlist')),
  metadata    jsonb       not null default '{}',
  session_id  text
);

create index idx_user_events_user_id    on public.user_events (user_id,    created_at desc);
create index idx_user_events_shop_id    on public.user_events (shop_id,    created_at desc);
create index idx_user_events_product_id on public.user_events (product_id, created_at desc);
create index idx_user_events_type       on public.user_events (event_type, created_at desc);

comment on table public.user_events
  is 'Raw event stream. No partitioning to stay Supabase Cloud compatible. Archive via pg_cron if volume grows.';


-- =============================================================
-- 10. ML SCORES
-- Written by the private analytics engine via service role key.
-- Frontend reads these for active subscribers only (RLS below).
-- =============================================================

create table public.shop_success_scores (
  id               uuid          primary key default gen_random_uuid(),
  shop_id          uuid          not null references public.shops (id) on delete cascade,
  scored_at        timestamptz   not null default now(),
  overall_score    numeric(5, 2) not null check (overall_score between 0 and 100),
  revenue_score    numeric(5, 2),
  engagement_score numeric(5, 2),
  growth_score     numeric(5, 2),
  percentile_rank  numeric(5, 2),
  recommendations  jsonb         not null default '[]'
);

create index idx_shop_success_scores_shop_id   on public.shop_success_scores (shop_id);
create index idx_shop_success_scores_scored_at on public.shop_success_scores (scored_at desc);

comment on column public.shop_success_scores.percentile_rank
  is 'How this shop ranks vs all shops on the platform, 0–100.';
comment on column public.shop_success_scores.recommendations
  is '[{"type": "...", "detail": "..."}]';


create table public.product_success_scores (
  id                    uuid          primary key default gen_random_uuid(),
  product_id            uuid          not null references public.products (id) on delete cascade,
  scored_at             timestamptz   not null default now(),
  overall_score         numeric(5, 2) not null check (overall_score between 0 and 100),
  demand_score          numeric(5, 2),
  price_competitiveness numeric(5, 2),
  trend_score           numeric(5, 2),
  recommendations       jsonb         not null default '[]'
);

create index idx_product_success_scores_product_id on public.product_success_scores (product_id);
create index idx_product_success_scores_scored_at  on public.product_success_scores (scored_at desc);


create table public.platform_insights (
  id           uuid                primary key default gen_random_uuid(),
  generated_at timestamptz         not null default now(),
  insight_type public.insight_type not null,
  title        text                not null,
  summary      text,
  data         jsonb               not null default '{}',
  valid_until  timestamptz         not null,
  is_published boolean             not null default false
);

create index idx_platform_insights_type on public.platform_insights (insight_type);
create index idx_platform_insights_pub  on public.platform_insights (is_published, valid_until desc);


-- =============================================================
-- 11. HELPER — active subscription check
-- Used by RLS policies. security definer runs as the function
-- owner so it bypasses RLS on the subscriptions table itself.
-- =============================================================

create or replace function public.has_active_subscription ()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.subscriptions
    where user_id            = auth.uid()
      and status             = 'active'
      and current_period_end > now()
  );
$$;


-- =============================================================
-- 12. updated_at TRIGGER
-- =============================================================

create or replace function public.set_updated_at ()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger trg_shops_updated_at
  before update on public.shops
  for each row execute function public.set_updated_at();

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create trigger trg_subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();


-- =============================================================
-- 13. AUTO-CREATE PROFILE ON SIGN UP
-- Mirrors a new auth.users row into public.profiles so the app
-- never has to manually create profiles after registration.
-- =============================================================

create or replace function public.handle_new_user ()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    coalesce(
      (new.raw_user_meta_data ->> 'user_role')::public.user_role,
      'buyer'::public.user_role
    )
  );
  return new;
end;
$$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- =============================================================
-- 14. ROW LEVEL SECURITY POLICIES
-- =============================================================

alter table public.profiles               enable row level security;
alter table public.categories             enable row level security;
alter table public.shops                  enable row level security;
alter table public.products               enable row level security;
alter table public.product_images         enable row level security;
alter table public.product_variants       enable row level security;
alter table public.cart_items             enable row level security;
alter table public.orders                 enable row level security;
alter table public.order_items            enable row level security;
alter table public.reviews                enable row level security;
alter table public.subscription_plans     enable row level security;
alter table public.subscriptions          enable row level security;
alter table public.shop_daily_metrics     enable row level security;
alter table public.product_daily_metrics  enable row level security;
alter table public.user_events            enable row level security;
alter table public.shop_success_scores    enable row level security;
alter table public.product_success_scores enable row level security;
alter table public.platform_insights      enable row level security;

-- ── Profiles ───────────────────────────────────────────────────

create policy "profiles: anyone can read"
  on public.profiles for select using (true);

create policy "profiles: owner can update"
  on public.profiles for update using (auth.uid() = id);

-- ── Categories ─────────────────────────────────────────────────

create policy "categories: anyone can read"
  on public.categories for select using (true);

-- ── Shops ──────────────────────────────────────────────────────

create policy "shops: anyone can read active"
  on public.shops for select using (status = 'active');

create policy "shops: owner can read own"
  on public.shops for select using (auth.uid() = owner_id);

create policy "shops: authenticated can create"
  on public.shops for insert with check (auth.uid() = owner_id);

create policy "shops: owner can update"
  on public.shops for update using (auth.uid() = owner_id);

-- ── Products ───────────────────────────────────────────────────

create policy "products: anyone can read active"
  on public.products for select using (status = 'active');

create policy "products: shop owner can read all own"
  on public.products for select using (
    auth.uid() = (select owner_id from public.shops where id = shop_id)
  );

create policy "products: shop owner can insert"
  on public.products for insert with check (
    auth.uid() = (select owner_id from public.shops where id = shop_id)
  );

create policy "products: shop owner can update"
  on public.products for update using (
    auth.uid() = (select owner_id from public.shops where id = shop_id)
  );

create policy "products: shop owner can delete"
  on public.products for delete using (
    auth.uid() = (select owner_id from public.shops where id = shop_id)
  );

-- ── Product images ─────────────────────────────────────────────

create policy "product_images: anyone can read"
  on public.product_images for select using (true);

create policy "product_images: shop owner can manage"
  on public.product_images for all using (
    auth.uid() = (
      select s.owner_id from public.shops s
      join public.products p on p.shop_id = s.id
      where p.id = product_id
    )
  );

-- ── Product variants ───────────────────────────────────────────

create policy "product_variants: anyone can read"
  on public.product_variants for select using (true);

create policy "product_variants: shop owner can manage"
  on public.product_variants for all using (
    auth.uid() = (
      select s.owner_id from public.shops s
      join public.products p on p.shop_id = s.id
      where p.id = product_id
    )
  );

-- ── Cart ───────────────────────────────────────────────────────

create policy "cart_items: owner only"
  on public.cart_items for all using (auth.uid() = user_id);

-- ── Orders ─────────────────────────────────────────────────────

create policy "orders: buyer can read own"
  on public.orders for select using (auth.uid() = buyer_id);

create policy "orders: seller can read their shop orders"
  on public.orders for select using (
    auth.uid() = (select owner_id from public.shops where id = shop_id)
  );

create policy "orders: buyer can create"
  on public.orders for insert with check (auth.uid() = buyer_id);

create policy "orders: buyer can update own pending order"
  on public.orders for update using (
    auth.uid() = buyer_id and status = 'pending'
  );

-- ── Order items ────────────────────────────────────────────────

create policy "order_items: buyer or seller can read"
  on public.order_items for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and (
          o.buyer_id = auth.uid()
          or (select owner_id from public.shops where id = o.shop_id) = auth.uid()
        )
    )
  );

create policy "order_items: buyer can insert"
  on public.order_items for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id and o.buyer_id = auth.uid()
    )
  );

-- ── Reviews ────────────────────────────────────────────────────

create policy "reviews: anyone can read"
  on public.reviews for select using (true);

create policy "reviews: buyer can insert"
  on public.reviews for insert with check (auth.uid() = buyer_id);

create policy "reviews: buyer can update own"
  on public.reviews for update using (auth.uid() = buyer_id);

-- ── Subscription plans ─────────────────────────────────────────

create policy "subscription_plans: anyone can read active"
  on public.subscription_plans for select using (is_active = true);

-- ── Subscriptions ──────────────────────────────────────────────

create policy "subscriptions: owner can read"
  on public.subscriptions for select using (auth.uid() = user_id);

create policy "subscriptions: owner can insert"
  on public.subscriptions for insert with check (auth.uid() = user_id);

-- ── Analytics — subscriber-gated ───────────────────────────────

create policy "shop_daily_metrics: active subscribers only"
  on public.shop_daily_metrics for select
  using (public.has_active_subscription());

create policy "product_daily_metrics: active subscribers only"
  on public.product_daily_metrics for select
  using (public.has_active_subscription());

-- Raw events are never exposed to the frontend.
-- Analytics engine accesses via service role key (bypasses RLS).
create policy "user_events: block all direct reads"
  on public.user_events for select using (false);

create policy "user_events: authenticated users can insert"
  on public.user_events for insert with check (auth.uid() is not null);

-- ── ML scores — subscriber-gated ───────────────────────────────

create policy "shop_success_scores: active subscribers only"
  on public.shop_success_scores for select
  using (public.has_active_subscription());

create policy "product_success_scores: active subscribers only"
  on public.product_success_scores for select
  using (public.has_active_subscription());

create policy "platform_insights: published + active subscribers only"
  on public.platform_insights for select
  using (is_published = true and public.has_active_subscription());