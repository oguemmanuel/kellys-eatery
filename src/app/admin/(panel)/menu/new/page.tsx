import { DishForm } from "@/components/admin/dish-form";
import { requireAdmin } from "@/lib/auth";
import { getCategories, getOptionGroups } from "@/lib/admin-menu";

export default async function NewDishPage({
  searchParams,
}: PageProps<"/admin/menu/new">) {
  const admin = await requireAdmin();
  const { bulk } = await searchParams;
  const [categories, groups] = await Promise.all([
    getCategories(),
    getOptionGroups(),
  ]);

  return (
    <DishForm
      categories={categories}
      groups={groups}
      isOwner={admin.role === "OWNER"}
      // "Add extra dish" in the Bulk manager starts a bulk-only dish.
      bulkOnly={bulk === "1"}
    />
  );
}
