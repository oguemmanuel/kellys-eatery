"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { CheckoutForm } from "@/components/checkout-form";

export function RegularCheckout({ isOpen }: { isOpen: boolean }) {
  const { lines, ready, subtotal, clear } = useCart();
  if (!ready) return null;
  if (lines.length === 0)
    return <EmptyCart href="/menu" label="See today's menu" />;

  return (
    <CheckoutForm
      kind="regular"
      lines={lines}
      subtotal={subtotal}
      onPlaced={clear}
      backHref="/cart"
      isOpen={isOpen}
      bulkLeadHours={0}
    />
  );
}

export function EmptyCart({ href, label }: { href: string; label: string }) {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-16 text-center">
      <p className="text-muted">Your cart is empty.</p>
      <Link
        href={href}
        className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-brand px-6 font-semibold text-white"
      >
        {label}
      </Link>
    </main>
  );
}
