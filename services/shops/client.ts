import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";
import { Tables } from "@/database.types";

export type Shop = Tables<"shops">;

export async function getShop(shopId: string): Promise<ServiceResult<Shop>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("shops")
    .select("*")
    .eq("id", shopId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listShops(): Promise<ServiceResult<Shop[]>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("shops").select("*");
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
