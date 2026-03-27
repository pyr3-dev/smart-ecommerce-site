import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";
import { Tables } from "@/database.types";

export type ShopDailyMetrics = Tables<"shop_daily_metrics">;
export type ProductDailyMetrics = Tables<"product_daily_metrics">;
export type PlatformInsight = Tables<"platform_insights">;

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
