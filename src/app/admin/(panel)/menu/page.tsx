import Link from "next/link";
import { MenuManager } from "@/components/admin/menu-manager";
import { getAdminDishes } from "@/lib/admin-menu";

export default async function AdminMenuPage() {
  const dishes = (await getAdminDishes()).filter((d) => !d.bulkOnly);

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-brand">Menu</h1>
        <Link
          href="/admin/menu/new"
          className="press flex min-h-11 items-center rounded-full bg-brand px-4 text-sm font-semibold text-white active:bg-brand-dark"
        >
          Add dish
        </Link>
      </div>
      <MenuManager dishes={dishes} />
    </>
  );
}
