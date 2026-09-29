"use client";

import Link from "next/link";
import { useCart, type CartLine } from "@/components/cart";
import { BackIcon, CloseIcon } from "@/components/icons";
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
      <header className="flex items-center gap-3">
        <Link
          href="/menu"
          aria-label="Back to the menu"
          className="grid size-11 place-items-center rounded-full bg-white text-brand shadow-sm"
        >
          <BackIcon className="size-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-brand">
          Your cart
        </h1>
      </header>

      {!ready ? null : lines.length === 0 ? (
        <div className="mt-10 text-center">
          <p className="text-muted">Your cart is empty.</p>
          <Link
            href="/menu"
            className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-brand px-6 font-semibold text-white"
          >
            See today&apos;s menu
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-5 grid gap-3">
            {lines.map((line) => {
              const stale = isStale(line);
              return (
                <li
                  key={line.key}
                  className={`rounded-2xl bg-white p-4 shadow-sm ${
                    line.extraFor ? "ml-6" : ""
                  } ${stale ? "ring-2 ring-accent" : ""}`}
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
                      className="-mt-2 -mr-2 grid size-11 place-items-center rounded-full text-muted"
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

          <div className="mt-5 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <span className="font-semibold">Total</span>
            <span className="text-lg font-bold text-brand tabular-nums">
              {formatGHS(subtotal)}
            </span>
          </div>

          {!isOpen && (
            <p className="mt-3 text-center text-sm text-muted">
              We are closed right now. You can order when we open again.
            </p>
          )}

          {canCheckout ? (
            <Link
              href="/checkout"
              className="mt-4 flex min-h-14 items-center justify-center rounded-2xl bg-brand font-semibold text-white active:bg-brand-dark"
            >
              Continue to checkout
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 flex min-h-14 w-full items-center justify-center rounded-2xl bg-muted/40 font-semibold text-white"
            >
              Continue to checkout
            </button>
          )}
        </>
      )}
    </main>
  );
}
