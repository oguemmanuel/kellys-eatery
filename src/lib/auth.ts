import "server-only";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/db";
import {
  createSupabaseServer,
  supabaseConfigured,
} from "@/lib/supabase/server";

export type Admin = { id: string; email: string; role: Role };

// Emails in OWNER_EMAILS become owners on their first sign-in. Anyone else
// needs an AdminUser row (staff) before they can use the admin.
function ownerEmails(): string[] {
  return (process.env.OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const getAdmin = cache(async (): Promise<Admin | null> => {
  if (!supabaseConfigured()) return null;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? adminForUser(user) : null;
});

export async function adminForUser(user: {
  id: string;
  email?: string;
}): Promise<Admin | null> {
  if (!user.email) return null;
  const email = user.email.toLowerCase();
  const existing = await prisma.adminUser.findUnique({
    where: { id: user.id },
  });
  if (existing)
    return { id: existing.id, email: existing.email, role: existing.role };

  if (ownerEmails().includes(email)) {
    const created = await prisma.adminUser.upsert({
      where: { email },
      update: { id: user.id, role: "OWNER" },
      create: { id: user.id, email, role: "OWNER" },
    });
    return { id: created.id, email: created.email, role: created.role };
  }
  return null;
}

// For admin pages: sends anyone without access to the login page.
export async function requireAdmin(role?: Role): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login?denied=1");
  if (role === "OWNER" && admin.role !== "OWNER") redirect("/admin");
  return admin;
}

// For server actions: throws instead of redirecting.
export async function assertAdmin(role?: Role): Promise<Admin> {
  const admin = await getAdmin();
  if (!admin || (role === "OWNER" && admin.role !== "OWNER")) {
    throw new Error("Not allowed");
  }
  return admin;
}
