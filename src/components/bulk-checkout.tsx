"use client";

import { useBulkCart } from "@/components/cart";
import { CheckoutForm } from "@/components/checkout-form";
import { EmptyCart } from "@/components/regular-checkout";

export function BulkCheckout({ bulkLeadHours }: { bulkLeadHours: number }) {
  const { lines, ready, subtotal, clear } = useBulkCart();
  if (!ready) return null;
  if (lines.length === 0)
    return <EmptyCart href="/bulk" label="See bulk orders" />;

  return (
    <CheckoutForm
      kind="bulk"
      lines={lines}
      subtotal={subtotal}
      onPlaced={clear}
      backHref="/bulk"
      // Bulk orders are for a later date, so they stay open when the kitchen is closed.
      isOpen
      bulkLeadHours={bulkLeadHours}
    />
  );
}
