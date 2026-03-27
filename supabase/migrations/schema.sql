-- ============================================================
-- Smart Ecommerce Platform — Database Schema
-- Stack: Supabase (self-hosted) + PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role        AS ENUM ('buyer', 'seller', 'admin');
CREATE TYPE shop_status      AS ENUM ('active', 'suspended', 'pending_review');
CREATE TYPE product_status   AS ENUM ('draft', 'active', 'out_of_stock', 'archived');
CREATE TYPE order_status     AS ENUM ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
CREATE TYPE sub_status       AS ENUM ('trialing', 'active', 'past_due', 'cancelled', 'expired');
CREATE TYPE invoice_status   AS ENUM ('draft', 'open', 'paid', 'void', 'uncollectible');
CREATE TYPE event_type       AS ENUM ('page_view', 'product_view', 'add_to_cart', 'remove_from_cart', 'checkout_start', 'purchase', 'search', 'shop_visit');
CREATE TYPE insight_category AS ENUM ('pricing', 'inventory', 'marketing', 'operations', 'trending', 'competitor');

-- ============================================================
-- SECTION 1 — USERS & AUTH
-- ============================================================

-- Extends Supabase auth.users (same UUID)
CREATE TABLE profiles (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT UNIQUE NOT NULL,
  display_name   TEXT,
  avatar_url     TEXT,
  role           user_role NOT NULL DEFAULT 'buyer',
  country_code   CHAR(2),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 2 — SHOPS & CATEGORIES
-- ============================================================

CREATE TABLE shop_categories (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  icon_url   TEXT
);

CREATE TABLE shops (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id      INT REFERENCES shop_categories(id) ON DELETE SET NULL,
  name             TEXT NOT NULL,
  slug             TEXT UNIQUE NOT NULL,
  description      TEXT,
  logo_url         TEXT,
  banner_url       TEXT,
  status           shop_status NOT NULL DEFAULT 'pending_review',
  avg_rating       NUMERIC(3,2) DEFAULT 0,
  total_sales      INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 3 — PRODUCTS
-- ============================================================

CREATE TABLE product_categories (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT UNIQUE NOT NULL,
  parent_id  INT REFERENCES product_categories(id) ON DELETE SET NULL
);

CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id         UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  base_price      NUMERIC(12,2) NOT NULL CHECK (base_price >= 0),
  compare_price   NUMERIC(12,2),
  stock_qty       INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  sku             TEXT,
  status          product_status NOT NULL DEFAULT 'draft',
  avg_rating      NUMERIC(3,2) DEFAULT 0,
  total_sold      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shop_id, slug)
);

CREATE TABLE product_images (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url          TEXT NOT NULL,
  alt_text     TEXT,
  sort_order   SMALLINT NOT NULL DEFAULT 0
);

CREATE TABLE product_category_map (
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  category_id  INT  NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE product_variants (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  price_delta  NUMERIC(10,2) NOT NULL DEFAULT 0,
  stock_qty    INT NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  sku          TEXT
);

-- ============================================================
-- SECTION 4 — ORDERS
-- ============================================================

CREATE TABLE orders (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  shop_id        UUID NOT NULL REFERENCES shops(id) ON DELETE RESTRICT,
  status         order_status NOT NULL DEFAULT 'pending',
  subtotal       NUMERIC(14,2) NOT NULL,
  shipping_fee   NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount       NUMERIC(10,2) NOT NULL DEFAULT 0,
  total          NUMERIC(14,2) NOT NULL,
  shipping_addr  JSONB NOT NULL,
  notes          TEXT,
  paid_at        TIMESTAMPTZ,
  shipped_at     TIMESTAMPTZ,
  delivered_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id      UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  variant_id    UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(12,2) NOT NULL,
  subtotal      NUMERIC(14,2) NOT NULL
);

-- ============================================================
-- SECTION 5 — REVIEWS
-- ============================================================

CREATE TABLE reviews (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  rating       SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  body         TEXT,
  images       TEXT[],
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (buyer_id, product_id, order_id)
);

-- ============================================================
-- SECTION 6 — SUBSCRIPTIONS
-- ============================================================

CREATE TABLE subscription_plans (
  id               SERIAL PRIMARY KEY,
  name             TEXT UNIQUE NOT NULL,
  price_monthly    NUMERIC(8,2) NOT NULL,
  price_yearly     NUMERIC(8,2),
  trial_days       SMALLINT NOT NULL DEFAULT 0,
  features         JSONB NOT NULL DEFAULT '[]',
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id               INT NOT NULL REFERENCES subscription_plans(id),
  status                sub_status NOT NULL DEFAULT 'trialing',
  billing_interval      TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly', 'yearly')),
  current_period_start  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end    TIMESTAMPTZ NOT NULL,
  trial_ends_at         TIMESTAMPTZ,
  cancelled_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

CREATE TABLE subscription_invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id     UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  amount              NUMERIC(8,2) NOT NULL,
  currency            CHAR(3) NOT NULL DEFAULT 'USD',
  status              invoice_status NOT NULL DEFAULT 'draft',
  payment_provider    TEXT,
  payment_ref         TEXT,
  paid_at             TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- SECTION 7 — ANALYTICS DATA COLLECTION
-- Raw events feed the private Advanced Analytics Server.
-- ============================================================

CREATE TABLE user_events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id   TEXT NOT NULL,
  shop_id      UUID REFERENCES shops(id) ON DELETE SET NULL,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  event_type   event_type NOT NULL,
  metadata     JSONB,
  ip_country   CHAR(2),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
) PARTITION BY RANGE (created_at);

-- Nightly aggregates (private analytics server reads + writes these)
CREATE TABLE store_daily_metrics (
  id                 BIGSERIAL PRIMARY KEY,
  shop_id            UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  date               DATE NOT NULL,
  revenue            NUMERIC(16,2) NOT NULL DEFAULT 0,
  order_count        INT NOT NULL DEFAULT 0,
  avg_order_value    NUMERIC(12,2),
  unique_visitors    INT NOT NULL DEFAULT 0,
  product_views      INT NOT NULL DEFAULT 0,
  conversion_rate    NUMERIC(6,4),
  repeat_buyer_rate  NUMERIC(6,4),
  refund_count       INT NOT NULL DEFAULT 0,
  UNIQUE (shop_id, date)
);

CREATE TABLE product_daily_metrics (
  id              BIGSERIAL PRIMARY KEY,
  product_id      UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  date            DATE NOT NULL,
  views           INT NOT NULL DEFAULT 0,
  cart_adds       INT NOT NULL DEFAULT 0,
  purchases       INT NOT NULL DEFAULT 0,
  revenue         NUMERIC(14,2) NOT NULL DEFAULT 0,
  avg_rating_day  NUMERIC(3,2),
  UNIQUE (product_id, date)
);

-- ============================================================
-- SECTION 8 — INSIGHTS OUTPUT
-- Written by the private analytics server, read by premium users.
-- ============================================================

CREATE TABLE store_insight_scores (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_id           UUID NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  overall_score     NUMERIC(5,2) NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  percentile        NUMERIC(5,2) NOT NULL CHECK (percentile BETWEEN 0 AND 100),
  revenue_score     NUMERIC(5,2),
  retention_score   NUMERIC(5,2),
  growth_score      NUMERIC(5,2),
  strengths         JSONB,
  weaknesses        JSONB,
  recommendations   JSONB,
  model_version     TEXT,
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE product_insights (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id            UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  trend_score           NUMERIC(5,2),
  demand_forecast_30d   NUMERIC(10,2),
  price_recommendation  NUMERIC(12,2),
  is_trending           BOOLEAN NOT NULL DEFAULT FALSE,
  competitor_avg_price  NUMERIC(12,2),
  insights              JSONB,
  model_version         TEXT,
  generated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE platform_insights (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category          insight_category NOT NULL,
  title             TEXT NOT NULL,
  summary           TEXT NOT NULL,
  data              JSONB,
  min_plan_id       INT NOT NULL REFERENCES subscription_plans(id),
  generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at        TIMESTAMPTZ
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_products_shop_id    ON products(shop_id);
CREATE INDEX idx_products_status     ON products(status);
CREATE INDEX idx_products_name_trgm  ON products USING gin(name gin_trgm_ops);
CREATE INDEX idx_orders_buyer_id     ON orders(buyer_id);
CREATE INDEX idx_orders_shop_id      ON orders(shop_id);
CREATE INDEX idx_orders_status       ON orders(status);
CREATE INDEX idx_orders_created_at   ON orders(created_at DESC);
CREATE INDEX idx_store_metrics_shop  ON store_daily_metrics(shop_id, date DESC);
CREATE INDEX idx_product_metrics     ON product_daily_metrics(product_id, date DESC);
CREATE INDEX idx_user_events_session ON user_events(session_id);
CREATE INDEX idx_user_events_created ON user_events(created_at DESC);
CREATE INDEX idx_store_scores_shop   ON store_insight_scores(shop_id, generated_at DESC);
CREATE INDEX idx_product_insights    ON product_insights(product_id, generated_at DESC);
CREATE INDEX idx_platform_insights   ON platform_insights(category, generated_at DESC);

-- ============================================================
-- TRIGGERS — auto updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_profiles_updated_at        BEFORE UPDATE ON profiles             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_shops_updated_at           BEFORE UPDATE ON shops                FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_products_updated_at        BEFORE UPDATE ON products             FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at          BEFORE UPDATE ON orders               FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_subscriptions_updated_at   BEFORE UPDATE ON user_subscriptions   FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Refresh product avg_rating on review change
CREATE OR REPLACE FUNCTION refresh_product_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE products
  SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE product_id = COALESCE(NEW.product_id, OLD.product_id))
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_review_rating
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW EXECUTE FUNCTION refresh_product_rating();

-- Increment shop total_sales when order is delivered
CREATE OR REPLACE FUNCTION increment_shop_sales()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = 'delivered' AND OLD.status <> 'delivered' THEN
    UPDATE shops SET total_sales = total_sales + 1 WHERE id = NEW.shop_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_order_delivered
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION increment_shop_sales();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews               ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_insight_scores  ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_insights      ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_insights     ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_public_read" ON profiles FOR SELECT USING (TRUE);
CREATE POLICY "profiles_self_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- shops
CREATE POLICY "shops_public_read"  ON shops FOR SELECT USING (status = 'active');
CREATE POLICY "shops_owner_write"  ON shops FOR ALL   USING (auth.uid() = owner_id);

-- products
CREATE POLICY "products_public_read"  ON products FOR SELECT USING (status = 'active');
CREATE POLICY "products_seller_write" ON products FOR ALL USING (
  auth.uid() = (SELECT owner_id FROM shops WHERE id = shop_id)
);

-- orders
CREATE POLICY "orders_buyer_read"  ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "orders_seller_read" ON orders FOR SELECT USING (
  auth.uid() = (SELECT owner_id FROM shops WHERE id = shop_id)
);

-- subscriptions
CREATE POLICY "subscriptions_self" ON user_subscriptions    FOR ALL     USING (auth.uid() = user_id);
CREATE POLICY "invoices_self"      ON subscription_invoices FOR SELECT  USING (
  auth.uid() = (SELECT user_id FROM user_subscriptions WHERE id = subscription_id)
);

-- store insights: premium seller sees own shop scores
CREATE POLICY "store_scores_premium" ON store_insight_scores FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_subscriptions WHERE user_id = auth.uid() AND status = 'active')
  AND EXISTS (SELECT 1 FROM shops WHERE id = shop_id AND owner_id = auth.uid())
);

-- platform insights: gated by plan tier
CREATE POLICY "platform_insights_premium" ON platform_insights FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = auth.uid()
      AND us.status = 'active'
      AND sp.id >= platform_insights.min_plan_id
  )
);
