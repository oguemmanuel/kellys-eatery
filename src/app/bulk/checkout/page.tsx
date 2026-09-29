import type { Metadata } from "next";
import { BulkCheckout } from "@/components/bulk-checkout";
import { getKitchen } from "@/lib/menu";

export const metadata: Metadata = { title: "Bulk checkout | Kelly's Eatery" };

export const dynamic = "force-dynamic";

export default async function BulkCheckoutPage() {
  const kitchen = await getKitchen();
  return <BulkCheckout bulkLeadHours={kitchen.bulkLeadHours} />;
}
