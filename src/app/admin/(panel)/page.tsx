import Link from "next/link";
import { LiveRefresh } from "@/components/admin/live-refresh";
import { OrderCard } from "@/components/admin/order-card";
import { getAdminOrders, ORDER_TABS, type OrderTab } from "@/lib/admin-orders";

export default async function OrdersPage({
  searchParams,
}: PageProps<"/admin">) {
  const { tab: rawTab } = await searchParams;
  const tab: OrderTab = ORDER_TABS.some((t) => t.key === rawTab)
    ? (rawTab as OrderTab)
    : "awaiting";
  const { orders, counts, latestNumber } = await getAdminOrders(tab);

  return (
    <>
      <LiveRefresh latestNumber={latestNumber} />
      <nav
        aria-label="Order tabs"
        className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none]"
      >
        <ul className="flex gap-2">
          {ORDER_TABS.map((t) => (
            <li key={t.key} className="shrink-0">
              <Link
                href={t.key === "awaiting" ? "/admin" : `/admin?tab=${t.key}`}
                aria-current={tab === t.key ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold ${
                  tab === t.key
                    ? "bg-brand text-white"
                    : "bg-white text-brand shadow-sm"
                }`}
              >
                {t.label}
                {t.key !== "done" && counts[t.key] > 0 && (
                  <span
                    className={`rounded-full px-2 text-xs ${
                      tab === t.key
                        ? "bg-white/25"
                        : "bg-accent text-brand-dark"
                    }`}
                  >
                    {counts[t.key]}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {orders.length === 0 ? (
        <p className="mt-10 text-center text-muted">
          No orders here right now.
        </p>
      ) : (
        <ul className="mt-4 grid gap-3">
          {orders.map((order) => (
            <li key={order.id}>
              <OrderCard order={order} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
