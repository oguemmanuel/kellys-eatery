import Link from "next/link";
import { BulkManager } from "@/components/admin/bulk-manager";
import { getAdminDishes } from "@/lib/admin-menu";
import { requireAdmin } from "@/lib/auth";

export default async function AdminBulkPage() {
  await requireAdmin("OWNER");
  const dishes = await getAdminDishes();

  return (
    <>
      <div className="mb-1 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand">
          Bulk manager
        </h1>
        <Link
          href="/admin/menu/new?bulk=1"
          className="flex min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-brand-dark"
        >
          Add extra dish
        </Link>
      </div>
      <p className="mb-3 text-sm text-muted">
        Set the price first, then switch the dish on.
      </p>
      <BulkManager dishes={dishes} />
    </>
  );
}
