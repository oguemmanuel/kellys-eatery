import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/admin-nav";
import { OpenSwitch } from "@/components/admin/open-switch";
import { requireAdmin } from "@/lib/auth";
import { getKitchen } from "@/lib/menu";
import { signOut } from "../login/actions";

export const metadata: Metadata = {
  title: "Kitchen admin | Kelly's Eatery",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: LayoutProps<"/admin">) {
  const admin = await requireAdmin();
  const kitchen = await getKitchen();

  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream pb-24">
      <header className="sticky top-0 z-30 border-b border-cream-dark bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2">
          <span className="font-display text-lg font-bold text-brand">
            Kelly&apos;s admin
          </span>
          <div className="ml-auto flex items-center gap-2">
            <OpenSwitch isOpen={kitchen.isOpen} />
            <form action={signOut}>
              <button
                type="submit"
                className="min-h-11 rounded-full px-3 text-sm font-medium text-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4">
        {children}
      </div>
      <AdminNav isOwner={admin.role === "OWNER"} />
    </div>
  );
}
