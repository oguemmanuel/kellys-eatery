"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart, type CartSelection } from "@/components/cart";
import { DishImage } from "@/components/dish-image";
import { CloseIcon } from "@/components/icons";
import { QuantityStepper } from "@/components/quantity-stepper";
import { formatGHS } from "@/lib/format";
import type { MenuDish } from "@/lib/menu";

export function DishSheet({
  dish,
  extras,
  onClose,
}: {
  dish: MenuDish;
  extras: MenuDish[];
  onClose: () => void;
}) {
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [extraIds, setExtraIds] = useState<string[]>([]);
  // groupId -> optionId. A group with a single available option starts picked.
  const [picked, setPicked] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const g of dish.optionGroups) {
      const available = g.options.filter((o) => o.isAvailable);
      if (available.length === 1) initial[g.id] = available[0].id;
    }
    return initial;
  });

  // Close on Escape and stop the page behind from scrolling.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const selections: CartSelection[] = useMemo(
    () =>
      dish.optionGroups.flatMap((g) => {
        const option = g.options.find((o) => o.id === picked[g.id]);
        return option
          ? [
              {
                groupId: g.id,
                group: g.name,
                optionId: option.id,
                option: option.name,
                priceDelta: option.priceDelta,
              },
            ]
          : [];
      }),
    [dish.optionGroups, picked],
  );

  const missing = dish.optionGroups.filter(
    (g) => g.isRequired && !picked[g.id],
  );
  const chosenExtras = extras.filter((e) => extraIds.includes(e.id));
  const unitTotal =
    (dish.price ?? 0) +
    selections.reduce((s, o) => s + o.priceDelta, 0) +
    chosenExtras.reduce((s, e) => s + (e.price ?? 0), 0);

  function handleAdd() {
    if (missing.length > 0 || dish.price === null) return;
    add({
      menuItemId: dish.id,
      name: dish.name,
      basePrice: dish.price,
      selections,
      quantity,
      extras: chosenExtras.map((e) => ({
        menuItemId: e.id,
        name: e.name,
        price: e.price ?? 0,
      })),
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/45"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-sheet-title"
        className="relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-cream sm:rounded-3xl"
      >
        <div className="overflow-y-auto">
          <div className="relative">
            <DishImage
              src={dish.imageUrl}
              alt={dish.name}
              sizes="(max-width: 576px) 100vw, 576px"
              className="aspect-[16/9] w-full"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 grid size-11 place-items-center rounded-full bg-white/90 text-ink shadow"
            >
              <CloseIcon className="size-5" />
            </button>
          </div>

          <div className="px-5 pt-4 pb-6">
            <h2
              id="dish-sheet-title"
              className="font-display text-2xl font-bold text-brand"
            >
              {dish.name}
            </h2>
            {dish.price !== null && (
              <p className="font-semibold text-ink">{formatGHS(dish.price)}</p>
            )}
            {dish.description && (
              <p className="mt-2 text-muted">{dish.description}</p>
            )}

            {dish.optionGroups.map((g) => (
              <fieldset key={g.id} className="mt-5">
                <legend className="flex w-full items-center justify-between">
                  <span className="font-semibold text-ink">
                    Choose your {g.name.toLowerCase()}
                  </span>
                  {g.isRequired && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        picked[g.id]
                          ? "bg-brand-light text-brand"
                          : "bg-accent/25 text-accent-text"
                      }`}
                    >
                      {picked[g.id] ? "Done" : "Required"}
                    </span>
                  )}
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {g.options.map((o) => {
                    const active = picked[g.id] === o.id;
                    return (
                      <label
                        key={o.id}
                        className={`flex min-h-11 items-center rounded-full border px-4 text-sm font-medium ${
                          !o.isAvailable
                            ? "cursor-not-allowed border-transparent bg-cream-dark text-muted/60 line-through"
                            : active
                              ? "cursor-pointer border-brand bg-brand text-white"
                              : "cursor-pointer border-brand/20 bg-white text-ink"
                        } has-focus-visible:outline-2 has-focus-visible:outline-brand`}
                      >
                        <input
                          type="radio"
                          name={`group-${g.id}`}
                          value={o.id}
                          checked={active}
                          disabled={!o.isAvailable}
                          onChange={() =>
                            setPicked((p) => ({ ...p, [g.id]: o.id }))
                          }
                          className="sr-only"
                        />
                        {o.name}
                        {o.priceDelta > 0 && ` +${formatGHS(o.priceDelta)}`}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {extras.length > 0 && (
              <fieldset className="mt-5">
                <legend className="font-semibold text-ink">Add extras</legend>
                <ul className="mt-2 divide-y divide-cream-dark rounded-2xl bg-white">
                  {extras.map((e) => {
                    const checked = extraIds.includes(e.id);
                    return (
                      <li key={e.id}>
                        <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setExtraIds((ids) =>
                                checked
                                  ? ids.filter((id) => id !== e.id)
                                  : [...ids, e.id],
                              )
                            }
                            className="size-5 accent-brand"
                          />
                          <span className="flex-1">{e.name}</span>
                          <span className="text-sm text-muted">
                            +{formatGHS(e.price ?? 0)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}

            <div className="mt-5 flex items-center justify-between">
              <span className="font-semibold text-ink">How many?</span>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                label={dish.name}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-cream-dark bg-white px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleAdd}
            disabled={missing.length > 0}
            className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-brand px-5 font-semibold text-white disabled:bg-muted/40"
          >
            <span>
              {missing.length > 0
                ? `Choose your ${missing[0].name.toLowerCase()}`
                : "Add to cart"}
            </span>
            <span className="tabular-nums">
              {formatGHS(unitTotal * quantity)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
