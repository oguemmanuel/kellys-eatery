"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckIcon, CloseIcon, WhatsAppIcon } from "@/components/icons";
import { displayPhone, formatGHS, whatsappLink } from "@/lib/format";
import type { OrderView as Order } from "@/lib/orders";

// The food is cooked before it is listed, so payment is the last step.
const STEPS = [
  { key: "order", label: "Order placed" },
  { key: "paid", label: "Payment confirmed" },
] as const;

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
  const awaiting = order.status === "AWAITING_PAYMENT";
  const cancelled = order.status === "CANCELLED";
  const finished = !awaiting;
  const headline = awaiting
    ? "Awaiting payment"
    : cancelled
      ? "Order cancelled"
      : order.isBulk
        ? "Payment confirmed. See you on the day!"
        : "Payment confirmed. Your food is on its way!";

  // Keep the status live while the owner confirms payment and cooks.
  useEffect(() => {
    if (finished) return;
    const timer = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(timer);
  }, [finished, router]);

  // While awaiting, payment is the current step; once paid, both are ticked.
  const stepIndex = awaiting ? 1 : STEPS.length;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-6 pb-10 lg:max-w-5xl lg:px-8 lg:pt-12">
      <header className="animate-rise text-center">
        <span
          aria-hidden
          className={`mx-auto grid size-16 place-items-center rounded-full ${
            awaiting
              ? "bg-accent/25 text-accent-text"
              : cancelled
                ? "bg-cream-dark text-muted"
                : "bg-brand text-white"
          }`}
        >
          {awaiting ? (
            <WhatsAppIcon className="size-8" />
          ) : cancelled ? (
            <CloseIcon className="size-7" />
          ) : (
            <CheckIcon className="size-8" />
          )}
        </span>
        <p className="mt-3 text-sm font-medium text-muted">
          Order #{order.number}
        </p>
        <h1 className="mt-1 font-display text-3xl leading-tight font-bold text-brand">
          {headline}
        </h1>
        {order.isBulk && (
          <span className="mt-2 inline-block rounded-full bg-accent px-3 py-1 text-sm font-semibold text-brand-dark">
            Bulk
          </span>
        )}
      </header>

      {/* Laptop: paying on the left, the order details on the right. */}
      <div className="lg:mt-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div>
          {awaiting && (
            <section
              className="stagger mt-6 animate-rise rounded-3xl bg-paper p-5 text-center shadow-soft"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              <p className="text-sm text-muted">
                Send us your order on WhatsApp and pay there. We confirm it
                here.
              </p>
              <a
                href={whatsappLink(whatsapp, buildMessage(order, orderUrl))}
                target="_blank"
                rel="noopener noreferrer"
                className="press mt-4 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#1f7a3a] px-4 font-semibold text-white shadow-lift active:bg-brand-dark"
              >
                <WhatsAppIcon className="size-6" />
                Send order on WhatsApp
              </a>
              <Countdown
                expiresAt={order.expiresAt}
                onExpire={router.refresh}
              />
            </section>
          )}

          {cancelled ? (
            <section className="mt-6 rounded-3xl bg-paper p-5 text-center shadow-soft">
              <p className="text-muted">
                This order was cancelled because payment was not received in
                time.
              </p>
              <Link
                href={order.isBulk ? "/bulk" : "/menu"}
                className="press mt-4 inline-flex min-h-12 items-center rounded-2xl bg-brand px-6 font-semibold text-white active:bg-brand-dark"
              >
                Order again
              </Link>
            </section>
          ) : (
            <ol className="mt-4 grid grid-cols-2 gap-2">
              {STEPS.map((step, i) => {
                const done = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <li
                    key={step.key}
                    className={`flex items-center gap-2.5 rounded-2xl px-3 py-3 transition-colors duration-(--duration-slow) ${
                      current
                        ? "bg-paper shadow-soft"
                        : done
                          ? "bg-brand-light"
                          : "bg-paper/60"
                    }`}
                  >
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
                      {done ? <CheckIcon className="size-3.5" /> : i + 1}
                    </span>
                    <span
                      className={`text-sm leading-tight ${
                        current
                          ? "font-semibold text-ink"
                          : done
                            ? "font-medium text-brand"
                            : "text-muted"
                      }`}
                    >
                      {step.label}
                      {current && <span className="sr-only"> (current)</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
        <div className="lg:mt-2">
          <section className="mt-4 rounded-3xl bg-paper p-5 shadow-soft">
            <h2 className="font-display text-lg font-bold text-brand">
              Your order
            </h2>
            <ul className="mt-1 divide-y divide-line">
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
            <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-display text-xl font-bold text-brand tabular-nums">
                {formatGHS(order.total)}
              </span>
            </div>
          </section>

          <section className="mt-4 rounded-3xl bg-paper p-5 text-sm shadow-soft">
            <h2 className="font-display text-lg font-bold text-brand">
              Delivery
            </h2>
            <dl className="mt-2 grid gap-2">
              {order.scheduledLabel && (
                <Row label="When" value={order.scheduledLabel} />
              )}
              <Row
                label="To"
                value={[order.address, order.landmark]
                  .filter(Boolean)
                  .join(", ")}
              />
              <Row label="Name" value={order.customerName} />
              <Row label="Phone" value={displayPhone(order.phone)} />
            </dl>
          </section>
        </div>
      </div>
      <p className="mt-6 text-center">
        <Link
          href="/"
          className="inline-flex min-h-11 items-center font-semibold text-brand underline underline-offset-4"
        >
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
    ...(order.scheduledLabel ? [`Delivery: ${order.scheduledLabel}`] : []),
    `Name: ${order.customerName}`,
    `Phone: ${displayPhone(order.phone)}`,
    `Deliver to: ${[order.address, order.landmark].filter(Boolean).join(", ")}`,
    "",
    `Order link: ${orderUrl}`,
  ].join("\n");
}
