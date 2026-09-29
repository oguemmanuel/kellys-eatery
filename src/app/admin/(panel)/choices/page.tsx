import { ChoicesManager } from "@/components/admin/choices-manager";
import { getAdminDishes, getOptionGroups } from "@/lib/admin-menu";

export default async function AdminChoicesPage() {
  const [groups, dishes] = await Promise.all([
    getOptionGroups(),
    getAdminDishes(),
  ]);

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand">Choices</h1>
      <p className="mb-3 text-sm text-muted">
        Switch a choice off when it runs out. It disappears from every dish at
        once.
      </p>
      <ChoicesManager
        groups={groups}
        dishes={dishes.map((d) => ({
          id: d.id,
          name: d.name,
          category: d.categoryName,
        }))}
      />
    </>
  );
}
