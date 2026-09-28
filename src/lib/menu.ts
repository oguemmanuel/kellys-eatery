import "server-only";
import { prisma } from "@/lib/db";

// Plain, serialisable shapes passed from server pages to client components.
export type MenuOption = {
  id: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
};

export type MenuOptionGroup = {
  id: string;
  name: string;
  isRequired: boolean;
  options: MenuOption[];
};

export type MenuDish = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  isExtra: boolean;
  // Available today, priced and with its required choices on, so it can be added to the cart.
  orderable: boolean;
  optionGroups: MenuOptionGroup[];
};

export type MenuCategory = {
  id: string;
  name: string;
  dishes: MenuDish[];
};

export type KitchenInfo = {
  name: string;
  tagline: string | null;
  story: string | null;
  heroImageUrl: string | null;
  phone: string;
  whatsapp: string;
  isOpen: boolean;
  openingHours: OpeningHours | null;
};

// Stored in Kitchen.openingHours, e.g. [{ "days": "Mon - Sat", "hours": "9am - 9pm" }]
export type OpeningHours = { days: string; hours: string }[];

const FALLBACK_KITCHEN: KitchenInfo = {
  name: "Kelly's Eatery",
  tagline: "Good life is Good food!",
  story: null,
  heroImageUrl: null,
  phone: "233592569298",
  whatsapp: "233592569298",
  isOpen: true,
  openingHours: null,
};

export async function getKitchen(): Promise<KitchenInfo> {
  const k = await prisma.kitchen.findFirst();
  if (!k) return FALLBACK_KITCHEN;
  return {
    name: k.name,
    tagline: k.tagline,
    story: k.story,
    heroImageUrl: k.heroImageUrl,
    phone: k.phone,
    whatsapp: k.whatsapp,
    isOpen: k.isOpen,
    openingHours: Array.isArray(k.openingHours)
      ? (k.openingHours as OpeningHours)
      : null,
  };
}

// Regular menu: every non-archived dish that is not bulk-only, grouped by category.
export async function getMenu(): Promise<MenuCategory[]> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isArchived: false, bulkOnly: false },
        orderBy: { sortOrder: "asc" },
        include: {
          optionGroups: {
            include: {
              group: {
                include: { options: { orderBy: { sortOrder: "asc" } } },
              },
            },
          },
        },
      },
    },
  });

  return categories
    .map((c) => ({
      id: c.id,
      name: c.name,
      dishes: c.items.map((item) => {
        const price = item.price === null ? null : Number(item.price);
        const optionGroups = item.optionGroups
          .map((link) => link.group)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((g) => ({
            id: g.id,
            name: g.name,
            isRequired: g.isRequired,
            options: g.options.map((o) => ({
              id: o.id,
              name: o.name,
              priceDelta: Number(o.priceDelta),
              isAvailable: o.isAvailable,
            })),
          }));
        // A required choice with every option switched off makes the dish unorderable.
        const choicesOk = optionGroups.every(
          (g) => !g.isRequired || g.options.some((o) => o.isAvailable),
        );
        return {
          id: item.id,
          name: item.name,
          description: item.description,
          price,
          imageUrl: item.imageUrl,
          isExtra: item.isExtra,
          orderable: item.isAvailable && price !== null && choicesOk,
          optionGroups,
        };
      }),
    }))
    .filter((c) => c.dishes.length > 0);
}
