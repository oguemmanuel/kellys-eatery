import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderView } from "@/components/order-view";
import { getKitchen } from "@/lib/menu";
import { getOrder } from "@/lib/orders";
import { getSiteUrl } from "@/lib/site";

export const metadata: Metadata = { title: "Your order | Kelly's Eatery" };

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const [order, kitchen] = await Promise.all([getOrder(id), getKitchen()]);
  if (!order) notFound();

  const siteUrl = await getSiteUrl();

  return (
    <OrderView
      order={order}
      whatsapp={kitchen.whatsapp}
      orderUrl={`${siteUrl}/order/${order.id}`}
    />
  );
}
