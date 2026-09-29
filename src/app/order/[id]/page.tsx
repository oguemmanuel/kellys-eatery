import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { OrderView } from "@/components/order-view";
import { getKitchen } from "@/lib/menu";
import { getOrder } from "@/lib/orders";

export const metadata: Metadata = { title: "Your order | Kelly's Eatery" };

export default async function OrderPage({ params }: PageProps<"/order/[id]">) {
  const { id } = await params;
  const [order, kitchen] = await Promise.all([getOrder(id), getKitchen()]);
  if (!order) notFound();

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? (host ? `${proto}://${host}` : "");

  return (
    <OrderView
      order={order}
      whatsapp={kitchen.whatsapp}
      orderUrl={`${siteUrl.replace(/\/$/, "")}/order/${order.id}`}
    />
  );
}
