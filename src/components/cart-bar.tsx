"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { formatGHS } from "@/lib/format";

export function CartBar() {
  const { itemCount, subtotal, ready } = useCart();
  if (!ready || itemCount === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <Link
        href="/cart"
        className="mx-auto flex min-h-14 max-w-xl items-center justify-between gap-3 rounded-2xl bg-brand px-5 text-white shadow-lg active:bg-brand-dark"
      >
        <span className="font-medium">
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </span>
        <span className="font-semibold tabular-nums">
          {formatGHS(subtotal)}
        </span>
        <span className="font-semibold">View cart</span>
      </Link>
    </div>
  );
}
