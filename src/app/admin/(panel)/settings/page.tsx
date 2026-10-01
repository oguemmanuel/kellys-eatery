import Link from "next/link";
import { OpenSwitch } from "@/components/admin/open-switch";
import { SettingsForm } from "@/components/admin/settings-form";
import { requireAdmin } from "@/lib/auth";
import { getKitchen } from "@/lib/menu";
import { qrSvg } from "@/lib/qr";
import { getSiteUrl } from "@/lib/site";
import { signOut } from "../../login/actions";

export default async function SettingsPage() {
  const admin = await requireAdmin("OWNER");
  const [kitchen, siteUrl] = await Promise.all([getKitchen(), getSiteUrl()]);
  const svg = await qrSvg(`${siteUrl}/`);
  // A QR code for a local or preview address is no use on a flyer.
  const isLocal = /localhost|127\.0\.0\.1|\.vercel\.app/.test(siteUrl);

  return (
    <>
      <h1 className="mb-3 font-display text-2xl font-bold text-brand">
        Settings
      </h1>

      <section className="grid gap-3 rounded-2xl bg-paper p-4 shadow-soft">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink">Open for orders</h2>
            <p className="text-sm text-muted">
              Closed stops regular orders. Bulk orders stay open.
            </p>
          </div>
          <OpenSwitch isOpen={kitchen.isOpen} />
        </div>
      </section>

      <section className="mt-4 rounded-2xl bg-paper p-4 shadow-soft">
        <h2 className="font-semibold text-ink">QR code</h2>
        <p className="text-sm text-muted">
          Opens the intro page at {siteUrl.replace(/^https?:\/\//, "")}.
        </p>
        {isLocal && (
          <p className="mt-2 rounded-xl bg-accent/20 p-3 text-sm font-semibold text-ink">
            This is not the live address yet. Set NEXT_PUBLIC_SITE_URL to your
            domain before printing.
          </p>
        )}
        <div className="mt-3 flex items-center gap-4">
          <div
            className="size-32 shrink-0 rounded-xl border border-line [&>svg]:size-full"
            role="img"
            aria-label="QR code preview"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div className="grid flex-1 gap-2">
            <Link
              href="/admin/poster"
              className="press flex min-h-11 items-center justify-center rounded-full bg-brand px-4 text-sm font-semibold text-white active:bg-brand-dark"
            >
              Print poster
            </Link>
            <a
              href="/admin/qr?format=png"
              download
              className="flex min-h-11 items-center justify-center rounded-full bg-cream-dark px-4 text-sm font-semibold text-brand"
            >
              Download PNG
            </a>
            <a
              href="/admin/qr?format=svg"
              download
              className="flex min-h-11 items-center justify-center rounded-full bg-cream-dark px-4 text-sm font-semibold text-brand"
            >
              Download SVG
            </a>
          </div>
        </div>
      </section>

      <SettingsForm kitchen={kitchen} />

      <section className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-paper p-4 shadow-soft">
        <p className="min-w-0 text-sm text-muted">
          Signed in as <span className="break-all text-ink">{admin.email}</span>
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="min-h-11 shrink-0 rounded-full px-3 text-sm font-semibold text-accent-text"
          >
            Sign out
          </button>
        </form>
      </section>
    </>
  );
}
