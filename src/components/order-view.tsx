"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { WhatsAppIcon } from "@/components/icons";
import { displayPhone, formatGHS, whatsappLink } from "@/lib/format";
import type { OrderView as Order } from "@/lib/orders";

const STEPS = [
  { status: "AWAITING_PAYMENT", label: "Awaiting payment" },
  { status: "PAID", label: "Paid" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "OUT_FOR_DELIVERY", label: "Out for delivery" },
  { status: "COMPLETED", label: "Completed" },
] as const;

const HEADLINES: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting payment",
  PAID: "Payment confirmed, we are cooking soon",
  PREPARING: "Payment confirmed, we are cooking",
  READY: "Your food is ready",
  OUT_FOR_DELIVERY: "Your food is on the way",
  COMPLETED: "Delivered. Enjoy your meal!",
  CANCELLED: "Order cancelled",
};

const REFRESH_MS = 15_000;

export function OrderView({
  order,
  whatsapp,
  orderUrl,
}: {
  order: NonNullable<Order>;
  whatsapp: string;
  orderUrl: string;
}) {
  const router = useRouter();
  const finished = order.status === "COMPLETED" || order.status === "CANCELLED";
  const awaiting = order.status === "AWAITING_PAYMENT";

  // Keep the status live while the owner confirms payment and cooks.
  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [finished, router]);

  const stepIndex = STEPS.findIndex((s) => s.status === order.status);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-10">
      <header className="text-center">
        <p className="text-sm font-medium text-muted">Order #{order.number}</p>
        <h1 className="mt-1 font-display text-3xl font-bold text-brand">
          {HEADLINES[order.status]}
        </h1>
        {order.isBulk && (
          <span className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-sm font-semibold text-brand-dark">
            Bulk
          </span>
        )}
      </header>

      {awaiting && (
        <section className="mt-5 rounded-3xl bg-white p-5 text-center shadow-sm">
          <a
            href={whatsappLink(whatsapp, buildMessage(order, orderUrl))}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#1f7a3a] px-5 text-lg font-semibold text-white active:bg-brand-dark"
          >
            <WhatsAppIcon className="size-6" />
            Send order on WhatsApp to pay
          </a>
          <Countdown expiresAt={order.expiresAt} onExpire={router.refresh} />
        </section>
      )}

      {order.status === "CANCELLED" ? (
        <section className="mt-5 rounded-3xl bg-white p-5 text-center shadow-sm">
          <p className="text-muted">
            This order was cancelled because payment was not received in time.
          </p>
          <Link
            href={order.isBulk ? "/bulk" : "/menu"}
            className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-brand px-6 font-semibold text-white"
          >
            Order again
          </Link>
        </section>
      ) : (
        <ol className="mt-5 rounded-3xl bg-white p-5 shadow-sm">
          {STEPS.map((step, i) => {
            const done = i < stepIndex;
            const current = i === stepIndex;
            return (
              <li key={step.status} className="flex items-center gap-3 py-1.5">
                <span
                  className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    done
                      ? "bg-brand text-white"
                      : current
                        ? "bg-accent text-brand-dark ring-4 ring-accent/30"
                        : "bg-cream-dark text-muted"
                  }`}
                  aria-hidden
                >
                  {done ? "✓" : i + 1}
                </span>
                <span
                  className={
                    current
                      ? "font-semibold text-ink"
                      : done
                        ? "text-ink"
                        : "text-muted"
                  }
                >
                  {step.label}
                  {current && <span className="sr-only"> (current)</span>}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <section className="mt-4 rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-ink">Your order</h2>
        <ul className="mt-2 divide-y divide-cream-dark">
          {order.items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between gap-3 py-2 text-sm"
            >
              <span>
                {item.quantity} × {item.name}
                {item.unit && ` (per ${item.unit})`}
                {item.selections.length > 0 && (
                  <span className="block text-muted">
                    {item.selections.join(", ")}
                  </span>
                )}
              </span>
              <span className="shrink-0 tabular-nums">
                {formatGHS(item.price * item.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-2 flex justify-between border-t border-cream-dark pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-brand tabular-nums">
            {formatGHS(order.total)}
          </span>
        </div>
      </section>

      <section className="mt-4 rounded-3xl bg-white p-5 text-sm shadow-sm">
        <h2 className="font-semibold text-ink">Delivery</h2>
        <dl className="mt-2 grid gap-2">
          {order.scheduledFor && (
            <Row label="When" value={formatWhen(order.scheduledFor)} />
          )}
          <Row
            label="To"
            value={[order.address, order.landmark].filter(Boolean).join(", ")}
          />
          <Row label="Name" value={order.customerName} />
          <Row label="Phone" value={displayPhone(order.phone)} />
        </dl>
      </section>

      <p className="mt-6 text-center">
        <Link href="/" className="font-semibold text-brand underline">
          Back to Kelly&apos;s Eatery
        </Link>
      </p>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3">
      <dt className="w-14 shrink-0 text-muted">{label}</dt>
      <dd className="text-ink">{value}</dd>
    </div>
  );
}

function Countdown({
  expiresAt,
  onExpire,
}: {
  expiresAt: string;
  onExpire: () => void;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const end = new Date(expiresAt).getTime();
    const tick = () => {
      const t = Date.now();
      setNow(t);
      // Stop at zero and let the server cancel the order.
      if (t >= end) {
        clearInterval(timer);
        onExpire();
      }
    };
    const timer = setInterval(tick, 1000);
    tick();
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const left = now === null ? null : new Date(expiresAt).getTime() - now;

  if (left === null) return null;
  if (left <= 0) {
    return (
      <p className="mt-3 text-sm text-muted">The payment window has closed.</p>
    );
  }

  const totalSec = Math.floor(left / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <p className="mt-3 text-sm text-muted">
      Pay within{" "}
      <span className="font-semibold text-ink tabular-nums">
        {h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`}
      </span>{" "}
      to keep your order
    </p>
  );
}

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-GB", {
    timeZone: "Africa/Accra",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function buildMessage(order: NonNullable<Order>, orderUrl: string): string {
  const lines = order.items.map((item) => {
    const choices =
      item.selections.length > 0 ? ` (${item.selections.join(", ")})` : "";
    const unit = item.unit ? ` per ${item.unit}` : "";
    return `${item.quantity} x ${item.name}${choices}${unit} - ${formatGHS(item.price * item.quantity)}`;
  });
  return [
    `Hello Kelly's Eatery, I'd like to pay for ${order.isBulk ? "bulk " : ""}order #${order.number}.`,
    "",
    ...lines,
    `Total: ${formatGHS(order.total)}`,
    "",
    ...(order.scheduledFor
      ? [`Delivery: ${formatWhen(order.scheduledFor)}`]
      : []),
    `Name: ${order.customerName}`,
    `Phone: ${displayPhone(order.phone)}`,
    `Deliver to: ${[order.address, order.landmark].filter(Boolean).join(", ")}`,
    "",
    `Order link: ${orderUrl}`,
  ].join("\n");
}
