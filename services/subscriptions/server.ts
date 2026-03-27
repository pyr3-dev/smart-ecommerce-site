"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";
import { Enums } from "@/database.types";

export async function createSubscription(
  planId: string,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: "Not authenticated" };

  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("interval")
    .eq("id", planId)
    .single();
  if (planError || !plan) return { data: null, error: "Plan not found" };

  const now = new Date().toISOString();
  const days = plan.interval === "yearly" ? 365 : 30;
  const periodEnd = new Date(
    Date.now() + days * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { error } = await supabase.from("subscriptions").insert({
    user_id: user.id,
    plan_id: planId,
    status: "trialing",
    current_period_start: now,
    current_period_end: periodEnd,
  });
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function cancelSubscription(): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: "Not authenticated" };

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .in("status", ["trialing", "active"]);
  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}
