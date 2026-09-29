import type { Metadata } from "next";
import { RegularCheckout } from "@/components/regular-checkout";
import { getKitchen } from "@/lib/menu";

export const metadata: Metadata = { title: "Checkout | Kelly's Eatery" };

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const kitchen = await getKitchen();
  return <RegularCheckout isOpen={kitchen.isOpen} />;
}
