"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useCart, type CartSelection } from "@/components/cart";
import { DishImage } from "@/components/dish-image";
import { CheckIcon, CloseIcon } from "@/components/icons";
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
  // Play the slide-down before unmounting; onAnimationEnd calls onClose.
  const [closing, setClosing] = useState(false);
  const close = useCallback(() => setClosing(true), []);
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

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
    close();
  }

  const closeButton = (
    <button
      type="button"
      onClick={close}
      aria-label="Close"
      className="press grid size-11 shrink-0 place-items-center rounded-full bg-white/95 text-ink shadow-soft"
    >
      <CloseIcon className="size-5" />
    </button>
  );

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className={`absolute inset-0 bg-brand-dark/50 ${closing ? "animate-fade-out" : "animate-fade"}`}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dish-sheet-title"
        onAnimationEnd={(e) => {
          if (closing && e.target === e.currentTarget) onClose();
        }}
        className={`relative flex max-h-[92dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-3xl bg-cream shadow-lift sm:rounded-3xl ${
          closing ? "animate-sheet-out" : "animate-sheet"
        }`}
      >
        <div className="overflow-y-auto overscroll-contain">
          {dish.imageUrl ? (
            <div className="relative">
              <DishImage
                src={dish.imageUrl}
                alt={dish.name}
                sizes="(max-width: 576px) 100vw, 576px"
                className="aspect-[16/9] w-full"
              />
              <div aria-hidden className="absolute inset-x-0 top-2 flex justify-center">
                <span className="h-1.5 w-10 rounded-full bg-white/80" />
              </div>
              <div className="absolute top-3 right-3">{closeButton}</div>
            </div>
          ) : (
            <div aria-hidden className="flex justify-center pt-2.5">
              <span className="h-1.5 w-10 rounded-full bg-cream-dark" />
            </div>
          )}

          <div className="px-5 pt-3 pb-6">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2
                  id="dish-sheet-title"
                  className="font-display text-2xl leading-tight font-bold text-brand"
                >
                  {dish.name}
                </h2>
                {dish.price !== null && (
                  <p className="mt-0.5 font-semibold text-ink tabular-nums">
                    {formatGHS(dish.price)}
                  </p>
                )}
              </div>
              {!dish.imageUrl && closeButton}
            </div>
            {dish.description && (
              <p className="mt-2 text-muted">{dish.description}</p>
            )}

            {dish.optionGroups.map((g) => (
              <fieldset key={g.id} className="mt-6">
                <legend className="flex w-full items-center justify-between">
                  <span className="font-semibold text-ink">
                    Choose your {g.name.toLowerCase()}
                  </span>
                  {g.isRequired && (
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-(--duration-base) ${
                        picked[g.id]
                          ? "bg-brand-light text-brand"
                          : "bg-accent/25 text-accent-text"
                      }`}
                    >
                      {picked[g.id] && <CheckIcon className="size-3" />}
                      {picked[g.id] ? "Done" : "Required"}
                    </span>
                  )}
                </legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {g.options.map((o) => {
                    const active = picked[g.id] === o.id;
                    return (
                      <label
                        key={o.id}
                        className={`press flex min-h-11 items-center gap-1.5 rounded-full border px-4 text-sm font-medium active:scale-[0.97] ${
                          !o.isAvailable
                            ? "cursor-not-allowed border-transparent bg-cream-dark text-muted/60 line-through active:scale-100"
                            : active
                              ? "cursor-pointer border-brand bg-brand text-white shadow-soft"
                              : "cursor-pointer border-line bg-paper text-ink"
                        } has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-brand`}
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
                        {active && <CheckIcon className="size-4 animate-fade" />}
                        {o.name}
                        {o.priceDelta > 0 && ` +${formatGHS(o.priceDelta)}`}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            {extras.length > 0 && (
              <fieldset className="mt-6">
                <legend className="flex w-full items-center justify-between">
                  <span className="font-semibold text-ink">Add extras</span>
                  <span className="text-xs font-medium text-muted">
                    Optional
                  </span>
                </legend>
                <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-soft">
                  {extras.map((e) => {
                    const checked = extraIds.includes(e.id);
                    return (
                      <li key={e.id}>
                        <label className="flex min-h-13 cursor-pointer items-center gap-3 px-4 transition-colors duration-(--duration-fast) active:bg-cream/60 has-focus-visible:outline-2 has-focus-visible:-outline-offset-2 has-focus-visible:outline-brand">
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
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={`grid size-6 shrink-0 place-items-center rounded-md border-2 transition-colors duration-(--duration-fast) ${
                              checked
                                ? "border-brand bg-brand text-white"
                                : "border-muted/40 bg-white"
                            }`}
                          >
                            {checked && <CheckIcon className="size-4" />}
                          </span>
                          <span className="flex-1">{e.name}</span>
                          <span className="text-sm text-muted tabular-nums">
                            +{formatGHS(e.price ?? 0)}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            )}

            <div className="mt-6 flex items-center justify-between">
              <span className="font-semibold text-ink">How many?</span>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                label={dish.name}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-line bg-paper px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleAdd}
            disabled={missing.length > 0}
            className="press flex min-h-14 w-full items-center justify-between rounded-2xl bg-brand px-5 font-semibold text-white shadow-lift active:bg-brand-dark disabled:bg-muted/30 disabled:text-ink/60 disabled:shadow-none"
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
