import { notFound } from "next/navigation";
import { DishForm } from "@/components/admin/dish-form";
import { requireAdmin } from "@/lib/auth";
import { getAdminDish, getCategories, getOptionGroups } from "@/lib/admin-menu";

export default async function EditDishPage({
  params,
}: PageProps<"/admin/menu/[id]">) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [dish, categories, groups] = await Promise.all([
    getAdminDish(id),
    getCategories(),
    getOptionGroups(),
  ]);
  if (!dish) notFound();

  return (
    <DishForm
      dish={dish}
      categories={categories}
      groups={groups}
      isOwner={admin.role === "OWNER"}
    />
  );
}
