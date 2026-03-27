import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type ShopDailyMetrics = {
  id: string;
  shop_id: string;
  date: string;
  total_revenue: number;
  total_orders: number;
  total_views: number;
  unique_visitors: number;
  conversion_rate: number | null;
  avg_order_value: number | null;
  return_rate: number | null;
};

export type ProductDailyMetrics = {
  id: string;
  product_id: string;
  date: string;
  views: number;
  cart_adds: number;
  orders: number;
  revenue: number;
  avg_rating: number | null;
  stock_turnover_rate: number | null;
};

export type PlatformInsight = {
  id: string;
  generated_at: string;
  insight_type:
    | "trending_category"
    | "top_performing_shop"
    | "seasonal_trend"
    | "price_opportunity"
    | "demand_spike";
  title: string;
  summary: string | null;
  data: Record<string, unknown>;
  valid_until: string;
  is_published: boolean;
};

export async function getShopMetrics(
  shopId: string,
  days = 30,
): Promise<ServiceResult<ShopDailyMetrics[]>> {
  const supabase = createClient();
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const { data, error } = await supabase
    .from("shop_daily_metrics")
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
  ServiceResult<PlatformInsight[]>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("platform_insights")
    .select("*")
    .eq("is_published", true)
    .order("generated_at", { ascending: false });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
