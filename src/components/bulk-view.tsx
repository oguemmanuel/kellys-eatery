"use client";

import { useState } from "react";
import { useBulkCart, type CartSelection } from "@/components/cart";
import { DishImage } from "@/components/dish-image";
import { FloatingBar } from "@/components/cart-bar";
import { CheckIcon, PlusIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatGHS } from "@/lib/format";
import type { BulkItem } from "@/lib/menu";

export function BulkView({ items }: { items: BulkItem[] }) {
  const { itemCount, subtotal, ready } = useBulkCart();

  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pt-4 pb-28 lg:max-w-6xl lg:px-8 lg:pt-8">
      <PageHeader
        backHref="/"
        backLabel="Back to Kelly's Eatery"
        title="Bulk orders"
        subtitle="By the bowl, for events, family and offices."
      />

      {items.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-paper p-5 text-center text-muted shadow-soft">
          No bulk dishes are listed right now. Please check back soon.
        </p>
      ) : (
        <ul className="mt-5 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-soft lg:mt-8 lg:grid lg:grid-cols-2 lg:gap-4 lg:divide-y-0 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:shadow-none xl:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="lg:overflow-hidden lg:rounded-2xl lg:bg-paper lg:shadow-soft"
            >
              <BulkCard item={item} />
            </li>
          ))}
        </ul>
      )}

      {ready && itemCount > 0 && (
        <FloatingBar
          href="/bulk/checkout"
          count={itemCount}
          label="Continue"
          total={subtotal}
        />
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
    <div className={`p-4 ${soldOut ? "opacity-55" : ""}`}>
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{item.name}</p>
          {item.description && (
            <p className="line-clamp-2 text-sm text-muted">
              {item.description}
            </p>
          )}
          <p className="mt-1 text-sm font-semibold text-brand tabular-nums">
            {soldOut ? (
              <span className="text-muted">Sold out</span>
            ) : (
              `${formatGHS(unitPrice)} per ${item.unit}`
            )}
          </p>
        </div>
        {item.imageUrl && (
          <DishImage
            src={item.imageUrl}
            alt=""
            sizes="80px"
            className={`size-20 shrink-0 rounded-xl ${soldOut ? "grayscale" : ""}`}
          />
        )}
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
                    className={`press flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium ${
                      !o.isAvailable
                        ? "border-transparent bg-cream-dark text-muted/60 line-through"
                        : active
                          ? "border-brand bg-brand text-white shadow-soft"
                          : "border-line bg-white text-ink"
                    }`}
                  >
                    {active && <CheckIcon className="size-4 animate-fade" />}
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
                className="press flex h-11 shrink-0 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-white active:bg-brand-dark"
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
