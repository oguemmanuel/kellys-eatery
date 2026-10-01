import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
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
  const isOwner = admin.role === "OWNER";

  return (
    <div className="flex min-h-full flex-1 flex-col bg-cream pb-10">
      <header className="sticky top-0 z-30 border-b border-line bg-cream/95 shadow-soft backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2">
          <Link href="/admin" className="flex items-center gap-2 rounded-lg">
            <Image
              src="/brand/logo.webp"
              alt="Kelly's Eatery"
              width={600}
              height={260}
              className="h-auto w-20"
            />
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand">
              Kitchen
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <OpenSwitch isOpen={kitchen.isOpen} />
            {isOwner ? (
              // Owners sign out from Settings, which keeps the header short on a phone.
              <Link
                href="/admin/settings"
                className="press flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-brand active:bg-brand-light"
              >
                Settings
              </Link>
            ) : (
              <form action={signOut}>
                <button
                  type="submit"
                  className="min-h-11 rounded-full px-3 text-sm font-medium text-muted"
                >
                  Sign out
                </button>
              </form>
            )}
          </div>
        </div>
        <AdminNav isOwner={isOwner} />
      </header>
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 pt-4">
        {children}
      </div>
    </div>
  );
}
