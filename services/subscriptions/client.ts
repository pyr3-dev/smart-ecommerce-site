import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: "trialing" | "active" | "cancelled" | "past_due";
  current_period_start: string;
  current_period_end: string;
  external_id: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  features: string[];
  is_active: boolean;
  created_at: string;
};

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
