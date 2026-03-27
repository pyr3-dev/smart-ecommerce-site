import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";
import { Tables } from "@/database.types";

export type Subscription = Tables<"subscriptions">;
export type Plan = Tables<"subscription_plans">;

export async function getSubscription(): Promise<
  ServiceResult<Subscription | null>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .maybeSingle();
  if (error) return { data: null, error: error.message };
  return { data, error: null };
}

export async function listPlans(): Promise<ServiceResult<Plan[]>> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("is_active", true)
    .order("price", { ascending: true });
  if (error) return { data: null, error: error.message };
  return { data: data ?? [], error: null };
}
