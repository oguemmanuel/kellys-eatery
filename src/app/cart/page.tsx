import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { getKitchen, getMenu } from "@/lib/menu";

export const metadata: Metadata = { title: "Your cart | Kelly's Eatery" };

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [kitchen, categories] = await Promise.all([getKitchen(), getMenu()]);

  // What can be ordered right now: dish id -> ids of available options.
  const orderable: Record<string, string[]> = {};
  for (const dish of categories.flatMap((c) => c.dishes)) {
    if (!dish.orderable) continue;
    orderable[dish.id] = dish.optionGroups.flatMap((g) =>
      g.options.filter((o) => o.isAvailable).map((o) => o.id),
    );
  }

  return <CartView orderable={orderable} isOpen={kitchen.isOpen} />;
}
