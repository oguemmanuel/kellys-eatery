import type { Metadata } from "next";
import { BulkView } from "@/components/bulk-view";
import { getBulkItems } from "@/lib/menu";

export const metadata: Metadata = { title: "Bulk orders | Kelly's Eatery" };

export const dynamic = "force-dynamic";

export default async function BulkPage() {
  const items = await getBulkItems();
  return <BulkView items={items} />;
}
