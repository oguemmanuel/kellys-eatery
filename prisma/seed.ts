import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Dish = {
  name: string;
  price: number | null; // null = owner sets the price later
  groups?: string[]; // option groups: "Swallow", "Meat"
  extra?: boolean;
};

const groupDefs = [
  {
    name: "Swallow",
    isRequired: true,
    showInBulk: false,
    sortOrder: 1,
    options: ["Eba", "Pounded yam", "Fufu", "Poundo", "Semo", "Amala", "Starch"],
  },
  {
    name: "Meat",
    isRequired: true,
    showInBulk: true,
    sortOrder: 2,
    options: ["Goat", "Cow"],
  },
  {
    // Meat choice for Jollof rice and meat. Owner can add more meats (and extra prices) in the Choices manager.
    name: "Jollof meat",
    isRequired: true,
    showInBulk: true,
    sortOrder: 3,
    options: ["Goat", "Cow"],
  },
];

const categories: { name: string; sortOrder: number; dishes: Dish[] }[] = [
  {
    name: "Rice and Pasta",
    sortOrder: 1,
    dishes: [
      { name: "Jollof rice and meat", price: 90, groups: ["Jollof meat"] },
      { name: "Jollof rice, chicken and plantain", price: 100 },
      { name: "Fried rice and turkey", price: 100 },
      { name: "Fried rice, chicken, salad and plantain", price: 120 },
      { name: "White rice and stew", price: 90 },
      { name: "Spaghetti and chicken", price: 90 },
      { name: "Spaghetti and turkey", price: 100 },
      { name: "Bole", price: 90 },
    ],
  },
  {
    name: "Soups",
    sortOrder: 2,
    dishes: [
      { name: "Egusi soup", price: 100, groups: ["Swallow", "Meat"] },
      { name: "Ogbono soup", price: 100, groups: ["Swallow", "Meat"] },
      { name: "Vegetables soup", price: 100, groups: ["Swallow", "Meat"] },
      { name: "Okro soup", price: 100, groups: ["Swallow", "Meat"] },
      { name: "Sea food okro", price: 120, groups: ["Swallow", "Meat"] },
      { name: "Pepper soup", price: 90, groups: ["Meat"] },
      { name: "Banger soup", price: 100, groups: ["Swallow", "Meat"] },
      { name: "Bitterleaf soup", price: 90, groups: ["Swallow", "Meat"] },
    ],
  },
  {
    name: "Local Drinks",
    sortOrder: 3,
    dishes: [
      { name: "Ginger drink", price: null },
      { name: "Zobo", price: null },
      { name: "Fruit juice", price: null },
    ],
  },
  {
    name: "Extras",
    sortOrder: 4,
    dishes: [
      { name: "Plantain", price: 15, extra: true },
      { name: "Salad", price: 15, extra: true },
      { name: "Cow meat", price: 15, extra: true },
      { name: "Turkey", price: 35, extra: true },
      { name: "Chicken", price: 25, extra: true },
      { name: "Fish", price: 35, extra: true },
    ],
  },
];

async function main() {
  // Kitchen (only if none exists)
  const kitchen = await prisma.kitchen.findFirst();
  if (!kitchen) {
    await prisma.kitchen.create({
      data: {
        name: "Kelly's Eatery",
        tagline: "Good life is Good food!",
        phone: "233592569298",
        whatsapp: "233592569298",
      },
    });
  }

  // Option groups and options
  const groupIds: Record<string, string> = {};
  for (const g of groupDefs) {
    let group = await prisma.optionGroup.findFirst({ where: { name: g.name } });
    if (!group) {
      group = await prisma.optionGroup.create({
        data: {
          name: g.name,
          isRequired: g.isRequired,
          showInBulk: g.showInBulk,
          sortOrder: g.sortOrder,
          options: {
            create: g.options.map((name, i) => ({ name, sortOrder: i })),
          },
        },
      });
    }
    groupIds[g.name] = group.id;
  }

  // Categories and dishes (safe to re-run: skips dishes that already exist)
  for (const c of categories) {
    let category = await prisma.category.findFirst({ where: { name: c.name } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: c.name, sortOrder: c.sortOrder },
      });
    }

    for (const [i, d] of c.dishes.entries()) {
      const exists = await prisma.menuItem.findFirst({
        where: { name: d.name, categoryId: category.id },
      });
      if (exists) continue;

      await prisma.menuItem.create({
        data: {
          name: d.name,
          categoryId: category.id,
          price: d.price,
          isAvailable: d.price !== null, // unpriced dishes stay off until the owner sets a price
          isExtra: d.extra ?? false,
          sortOrder: i,
          optionGroups: {
            create: (d.groups ?? []).map((g) => ({ groupId: groupIds[g] })),
          },
        },
      });
    }
  }

  console.log("Seeded Kelly's Eatery menu.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
