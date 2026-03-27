import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";
import { Tables } from "@/database.types";

export type Order = Tables<"orders">;

export async function getOrder(orderId: string): Promise<ServiceResult<Order>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listOrders(): Promise<ServiceResult<Order[]>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("orders").select("*");
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
