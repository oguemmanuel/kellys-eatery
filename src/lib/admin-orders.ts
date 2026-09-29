import "server-only";
import type { OrderStatus, Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { formatDayAndTime, formatTimeOfDay } from "@/lib/format";
import { expireUnpaidOrders } from "@/lib/orders";

export const ORDER_TABS = [
  { key: "awaiting", label: "Awaiting payment" },
  { key: "cooking", label: "Paid and cooking" },
  { key: "bulk", label: "Bulk" },
  { key: "ready", label: "Ready" },
  { key: "done", label: "Done" },
] as const;

export type OrderTab = (typeof ORDER_TABS)[number]["key"];

const ACTIVE_BULK: OrderStatus[] = [
  "PAID",
  "PREPARING",
  "READY",
  "OUT_FOR_DELIVERY",
];

function tabWhere(tab: OrderTab): Prisma.OrderWhereInput {
  switch (tab) {
    case "awaiting":
      return { status: "AWAITING_PAYMENT" };
    case "cooking":
      return { isBulk: false, status: { in: ["PAID", "PREPARING"] } };
    case "bulk":
      return { isBulk: true, status: { in: ACTIVE_BULK } };
    case "ready":
      return { isBulk: false, status: { in: ["READY", "OUT_FOR_DELIVERY"] } };
    case "done":
      // The last week is enough here; reports cover the rest.
      return {
        status: { in: ["COMPLETED", "CANCELLED"] },
        updatedAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
      };
  }
}

function tabOrder(tab: OrderTab): Prisma.OrderOrderByWithRelationInput[] {
  if (tab === "bulk") return [{ scheduledFor: "asc" }];
  if (tab === "done") return [{ updatedAt: "desc" }];
  return [{ createdAt: "asc" }];
}

export async function getAdminOrders(tab: OrderTab) {
  await expireUnpaidOrders();

  const [orders, counts, latest] = await Promise.all([
    prisma.order.findMany({
      where: tabWhere(tab),
      orderBy: tabOrder(tab),
      take: 100,
      include: { items: { orderBy: { id: "asc" } } },
    }),
    Promise.all(
      ORDER_TABS.map((t) =>
        t.key === "done"
          ? Promise.resolve(0)
          : prisma.order.count({ where: tabWhere(t.key) }),
      ),
    ),
    prisma.order.findFirst({
      orderBy: { number: "desc" },
      select: { number: true },
    }),
  ]);

  return {
    counts: Object.fromEntries(
      ORDER_TABS.map((t, i) => [t.key, counts[i]]),
    ) as Record<OrderTab, number>,
    // Lets the page play a sound when a newer order arrives.
    latestNumber: latest?.number ?? 0,
    orders: orders.map((o) => ({
      id: o.id,
      number: o.number,
      customerName: o.customerName,
      phone: o.phone,
      address: o.address,
      landmark: o.landmark,
      isBulk: o.isBulk,
      // Times are formatted here, on the server, so the page renders the
      // same text in every browser.
      scheduledLabel: o.scheduledFor ? formatDayAndTime(o.scheduledFor) : null,
      placedLabel: formatTimeOfDay(o.createdAt),
      expiresLabel: formatTimeOfDay(o.expiresAt),
      total: Number(o.total),
      status: o.status,
      paymentStatus: o.paymentStatus,
      items: o.items.map((i) => ({
        id: i.id,
        name: i.nameSnap,
        unit: i.unitSnap,
        quantity: i.quantity,
        selections: Array.isArray(i.selections)
          ? (i.selections as { option: string }[]).map((s) => s.option)
          : [],
      })),
    })),
  };
}

export type AdminOrder = Awaited<
  ReturnType<typeof getAdminOrders>
>["orders"][number];
