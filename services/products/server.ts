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
  compare_price?: number;
  stock_qty?: number;
  category_id?: string;
  tags?: string[];
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
