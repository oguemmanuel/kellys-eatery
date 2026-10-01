import Link from "next/link";
import { BarChart } from "@/components/admin/bar-chart";
import { requireAdmin } from "@/lib/auth";
import { formatGHS } from "@/lib/format";
import { BEST_SELLER_RANGES, getReports, parseRange } from "@/lib/reports";

export default async function ReportsPage({
  searchParams,
}: PageProps<"/admin/reports">) {
  await requireAdmin("OWNER");
  const params = await searchParams;
  const range = parseRange(params.range);
  const days = params.days === "30" ? 30 : 7;
  const r = await getReports(range, days);

  // Keeps the other filter when one changes.
  const href = (next: { range?: string; days?: number }) =>
    `/admin/reports?range=${next.range ?? range}&days=${next.days ?? days}`;

  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand">Reports</h1>
      <p className="mb-3 text-sm text-muted">
        Revenue counts paid orders only.
      </p>

      <div className="grid grid-cols-2 gap-3">
        <Card label="Today's revenue" value={formatGHS(r.todayRevenue)} />
        <Card label="This month" value={formatGHS(r.monthRevenue)} />
        <Card label="Orders today" value={String(r.ordersToday)} />
        <Card
          label="Average order"
          value={formatGHS(r.averageOrder)}
          note={`This month, ${r.monthOrders} order${r.monthOrders === 1 ? "" : "s"}`}
        />
      </div>

      <section className="mt-4 grid gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-ink">Daily revenue</h2>
          <Segmented
            label="Days shown"
            options={[
              { label: "7 days", href: href({ days: 7 }), active: days === 7 },
              {
                label: "30 days",
                href: href({ days: 30 }),
                active: days === 30,
              },
            ]}
          />
        </div>
        <BarChart title={`Last ${days} days`} bars={r.daily} />
        <h2 className="mt-2 font-semibold text-ink">Monthly revenue</h2>
        <BarChart title="Last 12 months" bars={r.monthly} />
      </section>

      <section className="mt-6">
        <h2 className="font-semibold text-ink">Best sellers</h2>
        <div className="mt-2">
          <Segmented
            label="Best sellers period"
            options={BEST_SELLER_RANGES.map((o) => ({
              label: o.label,
              href: href({ range: o.key }),
              active: o.key === range,
            }))}
          />
        </div>
        {r.bestSellers.length === 0 ? (
          <p className="mt-3 rounded-2xl bg-paper p-4 text-center text-sm text-muted shadow-soft">
            No paid orders in this period yet.
          </p>
        ) : (
          <ol className="mt-3 divide-y divide-line rounded-2xl bg-paper shadow-soft">
            {r.bestSellers.map((b, i) => (
              <li
                key={`${b.menuItemId}-${b.isBulk}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <span className="w-5 shrink-0 text-sm font-bold text-muted tabular-nums">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">
                    {b.name}{" "}
                    <span
                      className={`ml-1 inline-block rounded-full px-2 py-0.5 align-middle text-xs font-semibold ${
                        b.isBulk
                          ? "bg-accent text-brand-dark"
                          : "bg-cream-dark text-brand"
                      }`}
                    >
                      {b.isBulk ? "Bulk" : "Regular"}
                    </span>
                  </p>
                  <p className="text-sm text-muted">
                    {b.quantity}{" "}
                    {b.isBulk && b.unit ? plural(b.unit, b.quantity) : "sold"}
                  </p>
                </div>
                <span className="shrink-0 font-semibold text-brand tabular-nums">
                  {formatGHS(b.revenue)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </>
  );
}

function plural(unit: string, n: number) {
  return n === 1 ? unit : `${unit}s`;
}

function Card({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl bg-paper p-4 shadow-soft">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold whitespace-nowrap text-brand tabular-nums">
        {value}
      </p>
      {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
    </div>
  );
}

function Segmented({
  label,
  options,
}: {
  label: string;
  options: { label: string; href: string; active: boolean }[];
}) {
  return (
    <nav aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <Link
          key={o.label}
          href={o.href}
          scroll={false}
          aria-current={o.active ? "true" : undefined}
          className={`flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${
            o.active ? "bg-brand text-white" : "bg-paper text-brand shadow-soft"
          }`}
        >
          {o.label}
        </Link>
      ))}
    </nav>
  );
}
