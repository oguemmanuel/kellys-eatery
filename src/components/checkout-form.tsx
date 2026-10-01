"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/components/cart";
import { PageHeader } from "@/components/page-header";
import { formatGHS } from "@/lib/format";

const CUSTOMER_KEY = "kellys-customer-v1";

// Accra is on GMT all year (UTC+0, no daylight saving), so a local slot like
// "2026-10-03 14:00" is the same instant as "2026-10-03T14:00:00Z".
const TIME_ZONE = "Africa/Accra";
const SLOT_START_HOUR = 8;
const SLOT_END_HOUR = 20;
const SLOT_MINUTES = 30;
const BULK_DAYS_SHOWN = 30;

type Customer = {
  customerName: string;
  phone: string;
  address: string;
  landmark: string;
};

const EMPTY_CUSTOMER: Customer = {
  customerName: "",
  phone: "",
  address: "",
  landmark: "",
};

type Props = {
  kind: "regular" | "bulk";
  lines: CartLine[];
  subtotal: number;
  onPlaced: () => void;
  backHref: string;
  // Regular orders need the kitchen open; bulk orders need this much notice.
  isOpen: boolean;
  bulkLeadHours: number;
};

export function CheckoutForm({
  kind,
  lines,
  subtotal,
  onPlaced,
  backHref,
  isOpen,
  bulkLeadHours,
}: Props) {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(EMPTY_CUSTOMER);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [website, setWebsite] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<{
    message: string;
    fixCart: boolean;
  } | null>(null);

  // Prefill details from the last order on this device.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(CUSTOMER_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setCustomer({ ...EMPTY_CUSTOMER, ...JSON.parse(saved) });
    } catch {
      // Start with an empty form.
    }
  }, []);

  const slots = useMemo(
    () => (kind === "bulk" ? bulkSlots(bulkLeadHours) : []),
    [kind, bulkLeadHours],
  );
  const dates = useMemo(() => [...new Set(slots.map((s) => s.date))], [slots]);
  const times = slots.filter((s) => s.date === date);

  const set =
    (field: keyof Customer) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setCustomer((c) => ({ ...c, [field]: e.target.value }));

  const blocked = kind === "regular" && !isOpen;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting || blocked) return;
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...customer,
          website,
          isBulk: kind === "bulk",
          scheduledFor:
            kind === "bulk" && date && time
              ? `${date}T${time}:00.000Z`
              : undefined,
          items: lines.map((l) => ({
            menuItemId: l.menuItemId,
            quantity: l.quantity,
            optionIds: l.selections.map((s) => s.optionId),
          })),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError({
          message: data.error ?? "Something went wrong. Please try again.",
          fixCart: data.code === "unavailable",
        });
        setSubmitting(false);
        return;
      }
      try {
        window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
      } catch {
        // Not saving details is fine.
      }
      router.replace(`/order/${data.id}`);
      onPlaced();
    } catch {
      setError({ message: "No connection. Please try again.", fixCart: false });
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-xl flex-1 px-4 pt-4 pb-10 lg:max-w-5xl lg:px-8 lg:pt-8"
    >
      <PageHeader
        backHref={backHref}
        backLabel="Back"
        title={kind === "bulk" ? "Bulk checkout" : "Checkout"}
        subtitle="Where should we bring your food?"
      />

      {/* Laptop: details on the left, order summary and button on the right. */}
      <div className="lg:mt-2 lg:grid lg:grid-cols-[1fr_24rem] lg:items-start lg:gap-8">
        <div>
          {kind === "bulk" && (
            <fieldset className="mt-6">
              <legend className="sr-only">Delivery date and time</legend>
              <SectionTitle>Delivery date and time</SectionTitle>
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-2xl bg-paper p-4 shadow-soft">
                <Select
                  label="Date"
                  value={date}
                  onChange={(v) => {
                    setDate(v);
                    setTime("");
                  }}
                  options={dates.map((d) => ({
                    value: d,
                    label: formatDay(d),
                  }))}
                />
                <Select
                  label="Time"
                  value={time}
                  onChange={setTime}
                  disabled={!date}
                  options={times.map((t) => ({
                    value: t.time,
                    label: formatTime(t.time),
                  }))}
                />
              </div>
            </fieldset>
          )}

          <SectionTitle className="mt-6">Your details</SectionTitle>
          <div className="mt-3 grid gap-4 rounded-2xl bg-paper p-4 shadow-soft">
            <Field
              label="Your name"
              autoComplete="name"
              value={customer.customerName}
              onChange={set("customerName")}
            />
            <Field
              label="Phone number"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="024 000 0000"
              value={customer.phone}
              onChange={set("phone")}
            />
            <Field
              label="Delivery address"
              autoComplete="street-address"
              value={customer.address}
              onChange={set("address")}
            />
            <Field
              label="Landmark"
              optional
              placeholder="Near the blue gate"
              value={customer.landmark}
              onChange={set("landmark")}
            />
            {/* Honeypot, hidden from people. */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="hidden"
              aria-hidden
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-8">
          <section className="mt-6">
            <SectionTitle>Your order</SectionTitle>
            <div className="mt-3 rounded-2xl bg-paper px-4 pt-1 pb-4 shadow-soft">
              <ul className="divide-y divide-line">
                {lines.map((l) => (
                  <li
                    key={l.key}
                    className="flex justify-between gap-3 py-2 text-sm"
                  >
                    <span className={l.extraFor ? "pl-4 text-muted" : ""}>
                      {l.quantity} × {l.name}
                      {l.unit && ` (per ${l.unit})`}
                      {l.selections.length > 0 && (
                        <span className="block text-muted">
                          {l.selections.map((s) => s.option).join(", ")}
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {formatGHS(l.unitPrice * l.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-1 flex items-baseline justify-between border-t border-line pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-xl font-bold text-brand tabular-nums">
                  {formatGHS(subtotal)}
                </span>
              </div>
            </div>
          </section>

          {error && (
            <div
              role="alert"
              className="mt-4 animate-rise rounded-2xl border border-accent/50 bg-accent/15 p-4 text-sm text-ink"
            >
              <p className="font-semibold">{error.message}</p>
              {error.fixCart && (
                <Link
                  href={backHref}
                  className="mt-1 inline-block font-semibold text-brand underline"
                >
                  Update your order
                </Link>
              )}
            </div>
          )}

          {blocked && (
            <p className="mt-4 text-center text-sm text-muted">
              We are closed right now. You can order when we open again.
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || blocked}
            className="press mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand font-semibold text-white shadow-lift active:bg-brand-dark disabled:bg-muted/30 disabled:text-ink/60 disabled:shadow-none"
          >
            {submitting && (
              <span
                aria-hidden
                className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
              />
            )}
            {submitting ? "Placing order..." : "Place order"}
          </button>
          <p className="mt-3 text-center text-sm text-muted">
            Next, you pay on WhatsApp.
          </p>
        </div>
      </div>
    </form>
  );
}

function SectionTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`px-1 font-display text-lg font-bold text-brand ${className}`}
    >
      {children}
    </h2>
  );
}

function Field({
  label,
  optional,
  ...props
}: {
  label: string;
  optional?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-ink">
        {label}
        {optional && (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </span>
      <input
        required={!optional}
        {...props}
        className="min-h-12 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base transition-shadow duration-(--duration-fast) outline-none placeholder:text-muted/60 focus:border-brand focus:ring-3 focus:ring-brand/15 focus-visible:outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      <select
        required
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full min-w-0 rounded-xl border border-line bg-white px-3 text-base outline-none focus:border-brand focus:ring-3 focus:ring-brand/15 focus-visible:outline-none disabled:opacity-50"
      >
        <option value="" disabled>
          Choose
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// Delivery slots from `leadHours` from now, every half hour in kitchen hours.
// Earlier times are simply not offered; the server checks the same rule.
function bulkSlots(leadHours: number): { date: string; time: string }[] {
  const earliest = Date.now() + leadHours * 3_600_000;
  const start = new Date(earliest);
  start.setUTCHours(0, 0, 0, 0);
  const slots: { date: string; time: string }[] = [];
  for (let day = 0; day <= BULK_DAYS_SHOWN; day++) {
    const base = start.getTime() + day * 86_400_000;
    const date = new Date(base).toISOString().slice(0, 10);
    for (
      let m = SLOT_START_HOUR * 60;
      m <= SLOT_END_HOUR * 60;
      m += SLOT_MINUTES
    ) {
      if (base + m * 60_000 < earliest) continue;
      const time = `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
      slots.push({ date, time });
    }
  }
  return slots;
}

function formatDay(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formatTime(time: string): string {
  return new Date(`2000-01-01T${time}:00Z`).toLocaleTimeString("en-GB", {
    timeZone: TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
