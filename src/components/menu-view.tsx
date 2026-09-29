"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CartBar } from "@/components/cart-bar";
import { DishImage } from "@/components/dish-image";
import { DishSheet } from "@/components/dish-sheet";
import { BackIcon, PlusIcon } from "@/components/icons";
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
    <main className="mx-auto w-full max-w-xl flex-1 pb-28">
      <header className="flex items-center gap-3 px-4 pt-4">
        <Link
          href="/"
          aria-label="Back to Kelly's Eatery"
          className="grid size-11 place-items-center rounded-full bg-white text-brand shadow-sm"
        >
          <BackIcon className="size-5" />
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold text-brand">
            Today&apos;s menu
          </h1>
          <p className="text-sm text-muted">
            Fresh today from Kelly&apos;s Eatery
          </p>
        </div>
        <OpenBadge isOpen={isOpen} />
      </header>

      <nav
        aria-label="Menu categories"
        className="sticky top-0 z-20 mt-3 bg-cream/95 py-3 backdrop-blur"
      >
        <ul className="flex gap-2 overflow-x-auto px-4 [scrollbar-width:none]">
          {categories.map((c) => (
            <li key={c.id} className="shrink-0">
              <a
                href={`#cat-${c.id}`}
                className={`flex min-h-11 items-center rounded-full px-4 text-sm font-semibold ${
                  activeCategory === c.id
                    ? "bg-brand text-white"
                    : "bg-white text-brand shadow-sm"
                }`}
              >
                {c.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-4">
        {!isOpen && (
          <p className="mt-1 rounded-2xl bg-cream-dark p-4 text-sm text-ink">
            We are closed right now, so you can look but not order. Bulk orders
            for a later date are still open.
          </p>
        )}

        <Link
          href="/bulk"
          className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-accent px-4 py-3 text-brand-dark"
        >
          <span>
            <span className="block font-semibold">Feeding a crowd?</span>
            <span className="text-sm">Order soups and rice by the bowl.</span>
          </span>
          <span className="shrink-0 rounded-full bg-brand-dark px-3 py-2 text-sm font-semibold text-white">
            Bulk orders
          </span>
        </Link>

        {categories.map((c) => (
          <section key={c.id} id={`cat-${c.id}`} className="scroll-mt-20 pt-6">
            <h2 className="font-display text-xl font-bold text-brand">
              {c.name}
            </h2>
            <ul className="mt-3 grid gap-3">
              {c.dishes.map((dish) => (
                <li key={dish.id}>
                  <DishCard
                    dish={dish}
                    canOrder={isOpen && dish.orderable}
                    onOpen={() => setSelected(dish)}
                  />
                </li>
              ))}
            </ul>
          </section>
        ))}
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

function DishCard({
  dish,
  canOrder,
  onOpen,
}: {
  dish: MenuDish;
  canOrder: boolean;
  onOpen: () => void;
}) {
  const soldOut = !dish.orderable;

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={!canOrder}
      className={`flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left shadow-sm ${
        soldOut ? "opacity-60 grayscale" : ""
      }`}
    >
      <DishImage
        src={dish.imageUrl}
        alt={dish.name}
        sizes="80px"
        className="size-20 shrink-0 rounded-xl"
      />
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{dish.name}</span>
        {dish.description && (
          <span className="line-clamp-2 block text-sm text-muted">
            {dish.description}
          </span>
        )}
        <span className="mt-1 block text-sm font-semibold">
          {soldOut ? (
            <span className="text-muted">Sold out today</span>
          ) : (
            dish.price !== null && (
              <span className="text-brand">{formatGHS(dish.price)}</span>
            )
          )}
        </span>
      </span>
      {canOrder && (
        <span className="flex h-11 shrink-0 items-center gap-1 rounded-full bg-brand px-4 text-sm font-semibold text-white">
          <PlusIcon className="size-4" />
          Add
        </span>
      )}
    </button>
  );
}
