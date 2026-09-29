"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { CartLine } from "@/components/cart";
import { BackIcon } from "@/components/icons";
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
      className="mx-auto w-full max-w-xl flex-1 px-4 pt-4 pb-10"
    >
      <header className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="grid size-11 place-items-center rounded-full bg-white text-brand shadow-sm"
        >
          <BackIcon className="size-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-brand">
          {kind === "bulk" ? "Bulk checkout" : "Checkout"}
        </h1>
      </header>

      {kind === "bulk" && (
        <fieldset className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
          <legend className="sr-only">Delivery date and time</legend>
          <p className="font-semibold text-ink">Delivery date and time</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Select
              label="Date"
              value={date}
              onChange={(v) => {
                setDate(v);
                setTime("");
              }}
              options={dates.map((d) => ({ value: d, label: formatDay(d) }))}
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

      <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
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

      <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-ink">Your order</h2>
        <ul className="mt-2 divide-y divide-cream-dark">
          {lines.map((l) => (
            <li key={l.key} className="flex justify-between gap-3 py-2 text-sm">
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
        <div className="mt-2 flex justify-between border-t border-cream-dark pt-3">
          <span className="font-semibold">Total</span>
          <span className="text-lg font-bold text-brand tabular-nums">
            {formatGHS(subtotal)}
          </span>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="mt-4 rounded-2xl bg-accent/20 p-4 text-sm text-ink"
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
        className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-brand font-semibold text-white active:bg-brand-dark disabled:bg-muted/40"
      >
        {submitting ? "Placing order..." : "Place order"}
      </button>
    </form>
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
        className="min-h-12 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
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
        className="min-h-12 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3 text-base disabled:opacity-50"
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
