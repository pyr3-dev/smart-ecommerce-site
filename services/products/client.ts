import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";
import { Tables } from "@/database.types";

export type Product = Tables<"products">;

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
