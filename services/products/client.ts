import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Product = {
  id: string;
  shop_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_price: number | null;
  stock_qty: number;
  status: "draft" | "active" | "archived";
  tags: string[];
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
