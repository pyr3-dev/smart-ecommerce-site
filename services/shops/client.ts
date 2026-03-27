import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Shop = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

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
