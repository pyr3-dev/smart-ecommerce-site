"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ServiceResult } from "@/services/types";

export async function updateProfile(updates: {
  fullName?: string;
  avatarUrl?: string;
}): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return { data: null, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      ...(updates.fullName !== undefined && { full_name: updates.fullName }),
      ...(updates.avatarUrl !== undefined && { avatar_url: updates.avatarUrl }),
    })
    .eq("id", user.id);

  if (error) return { data: null, error: error.message };
  revalidatePath("/", "layout");
  return { data: null, error: null };
}

export async function updatePassword(
  newPassword: string,
): Promise<ServiceResult<null>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
