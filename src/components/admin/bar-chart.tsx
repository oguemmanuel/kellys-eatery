import type { Bar } from "@/lib/reports";
import { formatGHS } from "@/lib/format";

// Plain CSS bars, light enough for a phone on mobile data. The table under
// the bars gives screen readers the same numbers.
export function BarChart({ title, bars }: { title: string; bars: Bar[] }) {
  const max = Math.max(...bars.map((b) => b.value), 0);
  const total = bars.reduce((s, b) => s + b.value, 0);
  const best = bars.reduce<Bar | null>(
    (top, b) => (b.value > 0 && (!top || b.value > top.value) ? b : top),
    null,
  );

  return (
    <figure className="rounded-2xl bg-white p-4 shadow-sm">
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className="font-semibold text-ink">{title}</span>
        <span className="text-sm text-muted tabular-nums">
          Total {formatGHS(total)}
        </span>
      </figcaption>
      <div className="mt-3 flex h-36 items-end gap-[2px]" aria-hidden>
        {bars.map((b) => (
          <div
            key={b.key}
            className="flex h-full min-w-0 flex-1 flex-col justify-end"
            title={`${b.label}: ${formatGHS(b.value)}`}
          >
            <div
              className={`w-full rounded-t-sm ${b.value > 0 ? "bg-brand" : "bg-cream-dark"}`}
              style={{
                height:
                  max > 0 && b.value > 0
                    ? `${Math.max(4, (b.value / max) * 100)}%`
                    : "2px",
              }}
            />
          </div>
        ))}
      </div>
      {bars.length <= 12 ? (
        <div className="mt-1 flex gap-[2px] text-[11px] text-muted" aria-hidden>
          {bars.map((b) => (
            <span key={b.key} className="min-w-0 flex-1 text-center">
              {b.label}
            </span>
          ))}
        </div>
      ) : (
        // Too many bars to label each: show the first, middle and last day.
        <div
          className="mt-1 flex justify-between text-[11px] text-muted"
          aria-hidden
        >
          <span>{bars[0].label}</span>
          <span>{bars[Math.floor(bars.length / 2)].label}</span>
          <span>{bars[bars.length - 1].label}</span>
        </div>
      )}
      <p className="mt-2 text-sm text-muted">
        {best
          ? `Best: ${best.label}, ${formatGHS(best.value)}`
          : "No paid orders in this period yet."}
      </p>
      <table className="sr-only">
        <caption>{title}</caption>
        <tbody>
          {bars.map((b) => (
            <tr key={b.key}>
              <th scope="row">{b.label}</th>
              <td>{formatGHS(b.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
