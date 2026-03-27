"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";
import { TablesInsert, TablesUpdate } from "@/database.types";

export type ProductInsert = TablesInsert<"products">;
export type ProductUpdate = TablesUpdate<"products">;

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
