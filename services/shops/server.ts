"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";
import { TablesInsert, TablesUpdate } from "@/database.types";

export type ShopInsert = Omit<TablesInsert<"shops">, "owner_id">;
export type ShopUpdate = TablesUpdate<"shops">;

export async function createShop(data: ShopInsert): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: "Not authenticated" };
  const { error } = await supabase
    .from("shops")
    .insert({ ...data, owner_id: user.id });
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
