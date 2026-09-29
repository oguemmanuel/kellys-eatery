"use client";

import Link from "next/link";
import { useState } from "react";
import { useBulkCart, type CartSelection } from "@/components/cart";
import { DishImage } from "@/components/dish-image";
import { BackIcon, PlusIcon } from "@/components/icons";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatGHS } from "@/lib/format";
import type { BulkItem } from "@/lib/menu";

export function BulkView({ items }: { items: BulkItem[] }) {
  const { itemCount, subtotal, ready } = useBulkCart();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-4 pb-28">
      <header className="flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to Kelly's Eatery"
          className="grid size-11 place-items-center rounded-full bg-white text-brand shadow-sm"
        >
          <BackIcon className="size-5" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-brand">
            Bulk orders
          </h1>
          <p className="text-sm text-muted">
            Order by the bowl for events, family and offices.
          </p>
        </div>
      </header>

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white p-5 text-center text-muted shadow-sm">
          No bulk dishes are listed right now. Please check back soon.
        </p>
      ) : (
        <ul className="mt-5 grid gap-3">
          {items.map((item) => (
            <li key={item.id}>
              <BulkCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {ready && itemCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <Link
            href="/bulk/checkout"
            className="mx-auto flex min-h-14 max-w-xl items-center justify-between gap-3 rounded-2xl bg-brand px-5 text-white shadow-lg active:bg-brand-dark"
          >
            <span className="font-semibold tabular-nums">
              {formatGHS(subtotal)}
            </span>
            <span className="font-semibold">Continue</span>
          </Link>
        </div>
      )}
    </main>
  );
}

function BulkCard({ item }: { item: BulkItem }) {
  const { lines, add, setQuantity } = useBulkCart();
  // groupId -> optionId for the choice being added, e.g. Goat.
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const g of item.optionGroups) {
      const first = g.options.find((o) => o.isAvailable);
      if (first) initial[g.id] = first.id;
    }
    return initial;
  });

  const soldOut = item.optionGroups.some(
    (g) => g.isRequired && !g.options.some((o) => o.isAvailable),
  );

  const selections: CartSelection[] = item.optionGroups.flatMap((g) => {
    const o = g.options.find((opt) => opt.id === picked[g.id]);
    return o
      ? [
          {
            groupId: g.id,
            group: g.name,
            optionId: o.id,
            option: o.name,
            priceDelta: o.priceDelta,
          },
        ]
      : [];
  });
  const key = [item.id, ...selections.map((s) => s.optionId).sort()].join("|");
  const current = lines.find((l) => l.key === key);
  const itemLines = lines.filter((l) => l.menuItemId === item.id);
  const unitPrice =
    item.price + selections.reduce((s, o) => s + o.priceDelta, 0);

  const addOne = () =>
    add({
      menuItemId: item.id,
      name: item.name,
      basePrice: item.price,
      selections,
      quantity: 1,
      unit: item.unit,
      extras: [],
    });

  return (
    <div
      className={`rounded-2xl bg-white p-3 shadow-sm ${soldOut ? "opacity-60 grayscale" : ""}`}
    >
      <div className="flex items-center gap-3">
        <DishImage
          src={item.imageUrl}
          alt={item.name}
          sizes="80px"
          className="size-20 shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{item.name}</p>
          {item.description && (
            <p className="line-clamp-2 text-sm text-muted">
              {item.description}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-brand">
            {soldOut ? (
              <span className="text-muted">Sold out</span>
            ) : (
              `${formatGHS(unitPrice)} per ${item.unit}`
            )}
          </p>
        </div>
      </div>

      {!soldOut && (
        <>
          {item.optionGroups.map((g) => (
            <div
              key={g.id}
              className="mt-3 flex flex-wrap gap-2"
              role="radiogroup"
              aria-label={g.name}
            >
              {g.options.map((o) => {
                const active = picked[g.id] === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    disabled={!o.isAvailable}
                    onClick={() => setPicked((p) => ({ ...p, [g.id]: o.id }))}
                    className={`min-h-11 rounded-full border px-4 text-sm font-medium ${
                      !o.isAvailable
                        ? "border-transparent bg-cream-dark text-muted/60 line-through"
                        : active
                          ? "border-brand bg-brand text-white"
                          : "border-brand/20 bg-white text-ink"
                    }`}
                  >
                    {o.name}
                  </button>
                );
              })}
            </div>
          ))}

          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">
              {itemLines.length > 0 &&
                `In your order: ${itemLines
                  .map((l) =>
                    l.selections.length > 0
                      ? `${l.selections.map((s) => s.option).join(", ")} × ${l.quantity}`
                      : `${l.quantity} ${l.unit}${l.quantity === 1 ? "" : "s"}`,
                  )
                  .join(", ")}`}
            </span>
            {current ? (
              <QuantityStepper
                value={current.quantity}
                min={0}
                onChange={(q) => setQuantity(current.key, q)}
                label={`${item.name} ${selections.map((s) => s.option).join(" ")}`.trim()}
              />
            ) : (
              <button
                type="button"
                onClick={addOne}
                className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-white"
              >
                <PlusIcon className="size-4" />
                Add
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
