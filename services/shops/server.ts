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
  contact_email?: string;
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
