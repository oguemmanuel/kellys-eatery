"use client";

import Link from "next/link";
import { useCart, type CartLine } from "@/components/cart";
import { ArrowRightIcon, BagIcon, CloseIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatGHS } from "@/lib/format";

export function CartView({
  orderable,
  isOpen,
}: {
  orderable: Record<string, string[]>;
  isOpen: boolean;
}) {
  const { lines, ready, subtotal, setQuantity, remove } = useCart();

  // A line is stale when its dish or a chosen option was switched off since it was added.
  const isStale = (line: CartLine) => {
    const options = orderable[line.menuItemId];
    return (
      !options || line.selections.some((s) => !options.includes(s.optionId))
    );
  };
  const hasStale = lines.some(isStale);
  const canCheckout = isOpen && !hasStale && lines.length > 0;

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-4 pb-10">
      <PageHeader
        backHref="/menu"
        backLabel="Back to the menu"
        title="Your cart"
        subtitle={
          ready && lines.length > 0 ? "Check your order, then continue." : undefined
        }
      />

      {!ready ? null : lines.length === 0 ? (
        <div className="mt-16 flex animate-rise flex-col items-center text-center">
          <span className="grid size-16 place-items-center rounded-full bg-paper text-brand shadow-soft">
            <BagIcon className="size-7" />
          </span>
          <p className="mt-4 font-semibold text-ink">Your cart is empty</p>
          <p className="mt-1 text-sm text-muted">
            Pick something fresh from today&apos;s menu.
          </p>
          <Link
            href="/menu"
            className="press mt-5 inline-flex min-h-12 items-center gap-2 rounded-2xl bg-brand px-6 font-semibold text-white shadow-lift active:bg-brand-dark"
          >
            See today&apos;s menu
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-soft">
            {lines.map((line, i) => {
              const stale = isStale(line);
              return (
                <li
                  key={line.key}
                  className={`stagger animate-rise p-4 ${line.extraFor ? "pl-9" : ""} ${
                    stale ? "bg-accent/10" : ""
                  }`}
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-ink">{line.name}</p>
                      {line.selections.length > 0 && (
                        <p className="text-sm text-muted">
                          {line.selections.map((s) => s.option).join(", ")}
                        </p>
                      )}
                      {line.extraFor && (
                        <p className="text-sm text-muted">
                          Extra for {line.extraFor.name}
                        </p>
                      )}
                      {stale && (
                        <p className="mt-1 text-sm font-semibold text-accent-text">
                          Sold out today. Please remove it.
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(line.key)}
                      aria-label={`Remove ${line.name}`}
                      className="press -mt-2 -mr-2 grid size-11 place-items-center rounded-full text-muted active:bg-cream"
                    >
                      <CloseIcon className="size-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <QuantityStepper
                      value={line.quantity}
                      onChange={(q) => setQuantity(line.key, q)}
                      label={line.name}
                    />
                    <span className="font-semibold tabular-nums">
                      {formatGHS(line.unitPrice * line.quantity)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-baseline justify-between px-1">
            <span className="font-semibold">Total</span>
            <span className="font-display text-2xl font-bold text-brand tabular-nums">
              {formatGHS(subtotal)}
            </span>
          </div>
          <p className="px-1 text-sm text-muted">
            You pay on WhatsApp after you place the order.
          </p>

          {!isOpen && (
            <p className="mt-3 text-center text-sm text-muted">
              We are closed right now. You can order when we open again.
            </p>
          )}

          {canCheckout ? (
            <Link
              href="/checkout"
              className="press mt-5 flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-brand font-semibold text-white shadow-lift active:bg-brand-dark"
            >
              Continue to checkout
              <ArrowRightIcon className="size-5" />
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-5 flex min-h-14 w-full items-center justify-center rounded-2xl bg-muted/30 font-semibold text-ink/60"
            >
              Continue to checkout
            </button>
          )}
        </>
      )}
    </main>
  );
}
