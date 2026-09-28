import type { Metadata } from "next";
import { MenuView } from "@/components/menu-view";
import { getKitchen, getMenu } from "@/lib/menu";

export const metadata: Metadata = { title: "Today's menu | Kelly's Eatery" };

// Availability changes during the day, so always read it fresh.
export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const [kitchen, categories] = await Promise.all([getKitchen(), getMenu()]);

  // Extras are offered as add-ons on every dish sheet.
  const extras = categories
    .flatMap((c) => c.dishes)
    .filter((d) => d.isExtra && d.orderable);

  return (
    <MenuView categories={categories} extras={extras} isOpen={kitchen.isOpen} />
  );
}
