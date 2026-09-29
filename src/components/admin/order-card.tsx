"use client";

import { useState, useTransition } from "react";
import {
  advanceOrder,
  cancelOrder,
  markPaid,
  type ActionResult,
} from "@/app/admin/actions";
import { PhoneIcon, WhatsAppIcon } from "@/components/icons";
import type { AdminOrder } from "@/lib/admin-orders";
import { displayPhone, formatGHS, whatsappLink } from "@/lib/format";
import { ADVANCE_LABEL, STATUS_LABEL } from "@/lib/order-status";

export function OrderCard({ order }: { order: AdminOrder }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (action: () => Promise<ActionResult>) =>
    startTransition(async () => {
      setError(null);
      const result = await action();
      if (result.error) setError(result.error);
    });

  const awaiting = order.status === "AWAITING_PAYMENT";
  const paid = order.paymentStatus === "PAID";
  const advanceLabel = ADVANCE_LABEL[order.status];
  const finished = order.status === "COMPLETED" || order.status === "CANCELLED";

  return (
    <article
      className={`rounded-2xl bg-white p-4 shadow-sm ${pending ? "opacity-60" : ""} ${
        order.status === "CANCELLED" ? "opacity-70" : ""
      }`}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-xl font-bold text-ink">
          #{order.number}
        </h2>
        {order.isBulk && (
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-brand-dark">
            Bulk
          </span>
        )}
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            paid ? "bg-brand-light text-brand" : "bg-cream-dark text-ink"
          }`}
        >
          {STATUS_LABEL[order.status]}
        </span>
        <span className="ml-auto text-sm text-muted">{order.placedLabel}</span>
      </header>

      {order.scheduledLabel && (
        <p className="mt-2 rounded-xl bg-accent/20 px-3 py-2 text-sm font-semibold text-ink">
          Deliver {order.scheduledLabel}
        </p>
      )}

      <ul className="mt-3 grid gap-1">
        {order.items.map((item) => (
          <li key={item.id} className="text-ink">
            <span className="font-semibold">{item.quantity} ×</span> {item.name}
            {item.unit && (
              <span className="text-muted"> (per {item.unit})</span>
            )}
            {item.selections.length > 0 && (
              <span className="text-muted">
                {" "}
                · {item.selections.join(", ")}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 font-bold text-brand">{formatGHS(order.total)}</p>

      <div className="mt-3 grid gap-1 border-t border-cream-dark pt-3 text-sm">
        <p className="font-semibold text-ink">{order.customerName}</p>
        <p className="text-muted">
          {order.address}
          {order.landmark && ` · ${order.landmark}`}
        </p>
        <div className="mt-1 flex gap-2">
          <a
            href={whatsappLink(order.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center gap-2 rounded-full bg-brand-light px-4 font-semibold text-brand"
          >
            <WhatsAppIcon className="size-4" />
            {displayPhone(order.phone)}
          </a>
          <a
            href={`tel:+${order.phone}`}
            aria-label={`Call ${order.customerName}`}
            className="grid size-11 place-items-center rounded-full bg-brand-light text-brand"
          >
            <PhoneIcon className="size-4" />
          </a>
        </div>
        {awaiting && (
          <p className="text-muted">
            Cancels at {order.expiresLabel} if unpaid
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-accent-text">
          {error}
        </p>
      )}

      {!finished && (
        <div className="mt-3 flex gap-2">
          {awaiting ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => run(() => markPaid(order.id))}
              className="min-h-12 flex-1 rounded-xl bg-brand px-4 font-semibold text-white"
            >
              Mark as paid
            </button>
          ) : (
            advanceLabel && (
              <button
                type="button"
                disabled={pending || !paid}
                onClick={() => run(() => advanceOrder(order.id))}
                className="min-h-12 flex-1 rounded-xl bg-brand px-4 font-semibold text-white disabled:bg-muted/40"
              >
                {advanceLabel}
              </button>
            )
          )}
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (window.confirm(`Cancel order #${order.number}?`)) {
                run(() => cancelOrder(order.id));
              }
            }}
            className="min-h-12 rounded-xl px-4 font-semibold text-muted"
          >
            Cancel
          </button>
        </div>
      )}
    </article>
  );
}
