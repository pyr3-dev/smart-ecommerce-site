"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type OrderInsert = {
  shop_id: string;
  total_amount: number;
  shipping_address?: Record<string, unknown>;
  shipping_fee?: number;
  notes?: string;
};

export async function createOrder(
  data: OrderInsert,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("orders").insert(data);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}
