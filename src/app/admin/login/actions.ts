"use server";

import { redirect } from "next/navigation";
import { adminForUser } from "@/lib/auth";
import {
  createSupabaseServer,
  supabaseConfigured,
} from "@/lib/supabase/server";

export type LoginState = { error?: string; email?: string };

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!supabaseConfigured()) {
    return {
      error: "Login is not set up yet. Add the Supabase keys to the settings.",
    };
  }
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password)
    return { error: "Enter your email and password.", email };

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) return { error: "Wrong email or password.", email };

  if (!(await adminForUser(data.user))) {
    await supabase.auth.signOut();
    return {
      error: "This account does not have access to the kitchen admin.",
      email,
    };
  }
  redirect("/admin");
}

export async function signOut() {
  if (supabaseConfigured()) {
    const supabase = await createSupabaseServer();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
