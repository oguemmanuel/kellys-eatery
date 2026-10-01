"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartBar } from "@/components/cart-bar";
import { DishImage } from "@/components/dish-image";
import { DishSheet } from "@/components/dish-sheet";
import { useCart } from "@/components/cart";
import { ArrowRightIcon, PlusIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import { OpenBadge } from "@/components/open-badge";
import { formatGHS } from "@/lib/format";
import type { MenuCategory, MenuDish } from "@/lib/menu";

export function MenuView({
  categories,
  extras,
  isOpen,
}: {
  categories: MenuCategory[];
  extras: MenuDish[];
  isOpen: boolean;
}) {
  const [selected, setSelected] = useState<MenuDish | null>(null);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id);
  const { lines } = useCart();

  // How many of each dish are already in the cart, shown on its add button.
  const inCart: Record<string, number> = {};
  for (const line of lines) {
    if (line.extraFor) continue;
    inCart[line.menuItemId] = (inCart[line.menuItemId] ?? 0) + line.quantity;
  }

  // Highlight the chip of the category currently on screen.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveCategory(visible.target.id.replace("cat-", ""));
      },
      { rootMargin: "-120px 0px -65% 0px" },
    );
    for (const c of categories) {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [categories]);

  return (
    <main className="mx-auto w-full max-w-xl flex-1 pb-28 lg:max-w-6xl">
      <div className="px-4 pt-4 lg:px-8 lg:pt-8">
        <PageHeader
          backHref="/"
          backLabel="Back to Kelly's Eatery"
          title="Today's menu"
          subtitle="Cooked fresh today"
          aside={<OpenBadge isOpen={isOpen} />}
        />
      </div>

      {/* Laptop: categories become a sticky sidebar beside the dishes. */}
      <div className="lg:mt-6 lg:grid lg:grid-cols-[13rem_1fr] lg:items-start lg:gap-10 lg:px-8">
        <nav
          aria-label="Menu categories"
          className="sticky top-0 z-20 mt-3 border-b border-line/70 bg-cream/90 py-2.5 backdrop-blur-md lg:top-6 lg:mt-0 lg:border-0 lg:bg-transparent lg:py-0 lg:backdrop-blur-none"
        >
          <p className="mb-3 hidden text-xs font-semibold tracking-wider text-muted uppercase lg:block">
            Categories
          </p>
          <ul className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] lg:flex-col lg:overflow-visible lg:px-0">
            {categories.map((c) => (
              <li key={c.id} className="shrink-0">
                <a
                  href={`#cat-${c.id}`}
                  aria-current={activeCategory === c.id ? "true" : undefined}
                  className={`press flex min-h-11 items-center rounded-full px-4 text-sm font-semibold lg:justify-between ${
                    activeCategory === c.id
                      ? "bg-brand text-white shadow-soft"
                      : "bg-paper text-brand ring-1 ring-line lg:hover:bg-white"
                  }`}
                >
                  {c.name}
                  <span className="hidden text-xs font-medium opacity-70 lg:inline">
                    {c.dishes.length}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 lg:px-0">
          {!isOpen && (
            <p className="mt-3 rounded-2xl bg-cream-dark p-4 text-sm text-ink">
              We are closed right now, so you can look but not order. Bulk
              orders for a later date are still open.
            </p>
          )}

          <Link
            href="/bulk"
            className="press mt-3 flex items-center justify-between gap-3 rounded-2xl border-2 border-accent bg-paper py-3 pr-3 pl-4 active:bg-white lg:mt-0 lg:py-4 lg:pr-4 lg:pl-6 lg:hover:bg-white"
          >
            <span>
              <span className="block font-semibold text-brand-dark">
                Feeding a crowd?
              </span>
              <span className="text-sm text-muted">
                Order soups and rice by the bowl.
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-accent py-2 pr-2.5 pl-3.5 text-sm font-semibold text-brand-dark">
              Bulk orders
              <ArrowRightIcon className="size-4" />
            </span>
          </Link>

          {categories.map((c) => (
            <section
              key={c.id}
              id={`cat-${c.id}`}
              className="scroll-mt-20 pt-7 lg:scroll-mt-6 lg:pt-10"
            >
              <h2 className="flex items-baseline justify-between font-display text-xl font-bold text-brand lg:text-2xl">
                {c.name}
                <span className="font-sans text-xs font-medium text-muted">
                  {c.dishes.length} {c.dishes.length === 1 ? "dish" : "dishes"}
                </span>
              </h2>
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-soft lg:grid lg:grid-cols-2 lg:gap-3 lg:divide-y-0 lg:overflow-visible lg:rounded-none lg:bg-transparent lg:shadow-none xl:grid-cols-3">
                {c.dishes.map((dish) => (
                  <li
                    key={dish.id}
                    className="lg:overflow-hidden lg:rounded-2xl lg:bg-paper lg:shadow-soft lg:transition-shadow lg:duration-(--duration-base) lg:hover:shadow-lift"
                  >
                    <DishRow
                      dish={dish}
                      canOrder={isOpen && dish.orderable}
                      inCart={inCart[dish.id] ?? 0}
                      onOpen={() => setSelected(dish)}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      {selected && (
        <DishSheet
          dish={selected}
          extras={
            selected.isExtra ? [] : extras.filter((e) => e.id !== selected.id)
          }
          onClose={() => setSelected(null)}
        />
      )}
      <CartBar />
    </main>
  );
}

function DishRow({
  dish,
  canOrder,
  inCart,
  onOpen,
}: {
  dish: MenuDish;
  canOrder: boolean;
  inCart: number;
  onOpen: () => void;
}) {
  const soldOut = !dish.orderable;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!canOrder}
      className="group flex w-full items-center gap-3 px-4 py-3.5 text-left lg:h-full lg:min-h-24 transition-colors duration-(--duration-fast) active:bg-cream/60 disabled:active:bg-transparent"
    >
      <span className={`min-w-0 flex-1 ${soldOut ? "opacity-55" : ""}`}>
        <span className="block leading-snug font-semibold text-ink">
          {dish.name}
        </span>
        {dish.description && (
          <span className="mt-0.5 line-clamp-2 block text-sm text-muted">
            {dish.description}
          </span>
        )}
        <span className="mt-1 block text-sm font-semibold">
          {soldOut ? (
            <span className="text-muted">Sold out today</span>
          ) : (
            dish.price !== null && (
              <span className="text-brand tabular-nums">
                {formatGHS(dish.price)}
              </span>
            )
          )}
        </span>
      </span>
      {dish.imageUrl && (
        <DishImage
          src={dish.imageUrl}
          alt=""
          sizes="80px"
          className={`size-20 shrink-0 rounded-xl ${soldOut ? "opacity-55 grayscale" : ""}`}
        />
      )}
      {canOrder && (
        <span
          key={inCart}
          className={`grid size-11 shrink-0 place-items-center rounded-full font-semibold transition-transform duration-(--duration-fast) group-active:scale-90 ${
            inCart > 0
              ? "animate-bump bg-accent text-brand-dark"
              : "bg-brand text-white"
          }`}
        >
          {inCart > 0 ? (
            <span className="text-sm tabular-nums">
              {inCart}
              <span className="sr-only"> in your cart, add more</span>
            </span>
          ) : (
            <>
              <PlusIcon className="size-5" />
              <span className="sr-only">Add</span>
            </>
          )}
        </span>
      )}
    </button>
  );
}
