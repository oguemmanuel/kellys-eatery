"use client";

import Link from "next/link";
import { useCart } from "@/components/cart";
import { ArrowRightIcon, BagIcon } from "@/components/icons";
import { formatGHS } from "@/lib/format";

export function CartBar() {
  const { itemCount, subtotal, ready } = useCart();
  if (!ready || itemCount === 0) return null;

  return (
    <FloatingBar
      href="/cart"
      count={itemCount}
      label="View cart"
      total={subtotal}
    />
  );
}

// The floating button at the bottom of the menu and bulk pages.
export function FloatingBar({
  href,
  count,
  label,
  total,
}: {
  href: string;
  count: number;
  label: string;
  total: number;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 animate-rise px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:inset-x-auto lg:right-8 lg:bottom-8 lg:w-[26rem] lg:p-0">
      <Link
        href={href}
        className="press mx-auto flex min-h-15 max-w-xl items-center gap-3 rounded-2xl bg-brand pr-4 pl-3 text-white shadow-lift active:bg-brand-dark lg:hover:bg-brand-dark"
      >
        <span className="relative grid size-10 place-items-center rounded-xl bg-white/15">
          <BagIcon className="size-5" />
          <span
            key={count}
            className="absolute -top-1.5 -right-1.5 grid min-w-5 animate-bump place-items-center rounded-full bg-accent px-1 text-xs font-bold text-brand-dark tabular-nums"
          >
            {count}
          </span>
          <span className="sr-only">
            {count} {count === 1 ? "item" : "items"}
          </span>
        </span>
        <span className="flex-1 font-semibold">{label}</span>
        <span className="font-semibold tabular-nums">{formatGHS(total)}</span>
        <ArrowRightIcon className="size-5" />
      </Link>
    </div>
  );
}
