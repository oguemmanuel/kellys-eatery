import "server-only";
import { prisma } from "@/lib/db";

export type AdminDish = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string | null;
  categoryName: string | null;
  price: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  isExtra: boolean;
  bulkOnly: boolean;
  bulkEnabled: boolean;
  bulkPrice: number | null;
  bulkUnit: string | null;
  groupIds: string[];
};

export async function getAdminDishes(): Promise<AdminDish[]> {
  const items = await prisma.menuItem.findMany({
    where: { isArchived: false },
    orderBy: [
      { category: { sortOrder: "asc" } },
      { sortOrder: "asc" },
      { name: "asc" },
    ],
    include: { category: true, optionGroups: true },
  });
  return items.map((i) => ({
    id: i.id,
    name: i.name,
    description: i.description,
    categoryId: i.categoryId,
    categoryName: i.category?.name ?? null,
    price: i.price === null ? null : Number(i.price),
    imageUrl: i.imageUrl,
    isAvailable: i.isAvailable,
    isExtra: i.isExtra,
    bulkOnly: i.bulkOnly,
    bulkEnabled: i.bulkEnabled,
    bulkPrice: i.bulkPrice === null ? null : Number(i.bulkPrice),
    bulkUnit: i.bulkUnit,
    groupIds: i.optionGroups.map((g) => g.groupId),
  }));
}

export async function getAdminDish(id: string): Promise<AdminDish | null> {
  const dishes = await getAdminDishes();
  return dishes.find((d) => d.id === id) ?? null;
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true },
  });
}

export async function getOptionGroups() {
  const groups = await prisma.optionGroup.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      items: { select: { menuItemId: true } },
    },
  });
  return groups.map((g) => ({
    id: g.id,
    name: g.name,
    isRequired: g.isRequired,
    showInBulk: g.showInBulk,
    dishIds: g.items.map((i) => i.menuItemId),
    options: g.options.map((o) => ({
      id: o.id,
      name: o.name,
      priceDelta: Number(o.priceDelta),
      isAvailable: o.isAvailable,
    })),
  }));
}

export type AdminOptionGroup = Awaited<
  ReturnType<typeof getOptionGroups>
>[number];
