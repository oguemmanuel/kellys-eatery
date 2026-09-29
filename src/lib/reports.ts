import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

// Sales reports from docs/05-database-schema.md: revenue counts paid orders
// only (not cancelled), bucketed by paidAt in Africa/Accra. Accra is on UTC
// all year, so a UTC midnight is an Accra midnight.

export const BEST_SELLER_RANGES = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 days" },
  { key: "month", label: "This month" },
  { key: "all", label: "All time" },
] as const;

export type BestSellerRange = (typeof BEST_SELLER_RANGES)[number]["key"];

export function parseRange(value: unknown): BestSellerRange {
  return BEST_SELLER_RANGES.some((r) => r.key === value)
    ? (value as BestSellerRange)
    : "month";
}

export type Bar = { key: string; label: string; value: number };

export type BestSeller = {
  menuItemId: string;
  name: string;
  isBulk: boolean;
  unit: string | null;
  quantity: number;
  revenue: number;
};

export type Reports = {
  todayRevenue: number;
  monthRevenue: number;
  ordersToday: number;
  monthOrders: number;
  averageOrder: number;
  daily: Bar[];
  monthly: Bar[];
  bestSellers: BestSeller[];
};

const DAY = 86_400_000;

// Only orders that were paid for and not cancelled afterwards.
const PAID = Prisma.sql`o."paymentStatus" = 'PAID' AND o."status" <> 'CANCELLED' AND o."paidAt" IS NOT NULL`;
// paidAt is stored as UTC without a time zone.
const PAID_DAY = Prisma.sql`(o."paidAt" AT TIME ZONE 'UTC' AT TIME ZONE 'Africa/Accra')`;

function startOfDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function startOfMonth(date: Date, monthsBack = 0): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - monthsBack, 1),
  );
}

function rangeStart(range: BestSellerRange, now: Date): Date | null {
  if (range === "today") return startOfDay(now);
  if (range === "7d") return new Date(startOfDay(now).getTime() - 6 * DAY);
  if (range === "month") return startOfMonth(now);
  return null;
}

async function totals(from: Date) {
  const [row] = await prisma.$queryRaw<{ revenue: string; orders: bigint }[]>`
    SELECT COALESCE(SUM(o."total"), 0)::text AS revenue, COUNT(*) AS orders
    FROM "Order" o
    WHERE ${PAID} AND o."paidAt" >= ${from}`;
  return { revenue: Number(row.revenue), orders: Number(row.orders) };
}

export async function getReports(
  range: BestSellerRange,
  days: 7 | 30,
): Promise<Reports> {
  const now = new Date();
  const today = startOfDay(now);
  const dailyFrom = new Date(today.getTime() - (days - 1) * DAY);
  const monthlyFrom = startOfMonth(now, 11);
  const bestFrom = rangeStart(range, now);

  const [todayTotals, monthTotals, dailyRows, monthlyRows, bestRows] =
    await Promise.all([
      totals(today),
      totals(startOfMonth(now)),
      prisma.$queryRaw<{ day: string; revenue: string }[]>`
        SELECT to_char(${PAID_DAY}, 'YYYY-MM-DD') AS day,
               SUM(o."total")::text AS revenue
        FROM "Order" o
        WHERE ${PAID} AND o."paidAt" >= ${dailyFrom}
        GROUP BY 1`,
      prisma.$queryRaw<{ month: string; revenue: string }[]>`
        SELECT to_char(${PAID_DAY}, 'YYYY-MM') AS month,
               SUM(o."total")::text AS revenue
        FROM "Order" o
        WHERE ${PAID} AND o."paidAt" >= ${monthlyFrom}
        GROUP BY 1`,
      prisma.$queryRaw<
        {
          menuItemId: string;
          name: string;
          isBulk: boolean;
          unit: string | null;
          quantity: bigint;
          revenue: string;
        }[]
      >`
        SELECT i."menuItemId",
               (array_agg(i."nameSnap" ORDER BY o."paidAt" DESC))[1] AS name,
               o."isBulk",
               (array_agg(i."unitSnap" ORDER BY o."paidAt" DESC))[1] AS unit,
               SUM(i."quantity") AS quantity,
               SUM(i."quantity" * i."priceSnap")::text AS revenue
        FROM "OrderItem" i
        JOIN "Order" o ON o."id" = i."orderId"
        WHERE ${PAID}
          ${bestFrom ? Prisma.sql`AND o."paidAt" >= ${bestFrom}` : Prisma.empty}
        GROUP BY i."menuItemId", o."isBulk"
        ORDER BY quantity DESC, SUM(i."quantity" * i."priceSnap") DESC
        LIMIT 10`,
    ]);

  const byDay = new Map(dailyRows.map((r) => [r.day, Number(r.revenue)]));
  const daily: Bar[] = Array.from({ length: days }, (_, i) => {
    const date = new Date(dailyFrom.getTime() + i * DAY);
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString("en-GB", {
        timeZone: "UTC",
        day: "numeric",
        month: "short",
      }),
      value: byDay.get(key) ?? 0,
    };
  });

  const byMonth = new Map(monthlyRows.map((r) => [r.month, Number(r.revenue)]));
  const monthly: Bar[] = Array.from({ length: 12 }, (_, i) => {
    const date = startOfMonth(now, 11 - i);
    const key = date.toISOString().slice(0, 7);
    return {
      key,
      label: date.toLocaleDateString("en-GB", {
        timeZone: "UTC",
        month: "short",
      }),
      value: byMonth.get(key) ?? 0,
    };
  });

  return {
    todayRevenue: todayTotals.revenue,
    monthRevenue: monthTotals.revenue,
    ordersToday: todayTotals.orders,
    monthOrders: monthTotals.orders,
    averageOrder:
      monthTotals.orders > 0 ? monthTotals.revenue / monthTotals.orders : 0,
    daily,
    monthly,
    bestSellers: bestRows.map((r) => ({
      menuItemId: r.menuItemId,
      name: r.name,
      isBulk: r.isBulk,
      unit: r.unit,
      quantity: Number(r.quantity),
      revenue: Number(r.revenue),
    })),
  };
}
