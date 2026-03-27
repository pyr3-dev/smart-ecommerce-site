import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Order = {
  id: string;
  buyer_id: string;
  shop_id: string;
  status: "pending" | "paid" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
  total_amount: number;
  shipping_fee: number;
  shipping_address: Record<string, unknown>;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

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
