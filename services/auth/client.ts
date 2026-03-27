// Browser-only. Call only from Client Components ('use client') — uses window.location.
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { ServiceResult } from "@/services/types";

export async function signIn(
  email: string,
  password: string,
): Promise<ServiceResult<User>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { data: null, error: error.message };
  return { data: data.user, error: null };
}

export async function signUp(
  email: string,
  password: string,
  role: "buyer" | "seller",
): Promise<ServiceResult<User>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/protected`,
      data: { user_role: role },
    },
  });
  if (error) return { data: null, error: error.message };
  if (!data.user) return { data: null, error: "Sign-up returned no user" };
  return { data: data.user, error: null };
}

export async function signOut(): Promise<ServiceResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}

export async function getSession(): Promise<ServiceResult<User | null>> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error) return { data: null, error: error.message };
  return { data: data.user, error: null };
}

export async function resetPassword(email: string): Promise<ServiceResult<null>> {
  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });
  if (error) return { data: null, error: error.message };
  return { data: null, error: null };
}
