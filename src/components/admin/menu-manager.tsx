"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { setDishAvailable } from "@/app/admin/actions";
import { Toggle } from "@/components/admin/toggle";
import { DishImage } from "@/components/dish-image";
import type { AdminDish } from "@/lib/admin-menu";
import { formatGHS } from "@/lib/format";

export function MenuManager({ dishes }: { dishes: AdminDish[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const shown = q
    ? dishes.filter((d) => d.name.toLowerCase().includes(q))
    : dishes;

  const groups = new Map<string, AdminDish[]>();
  for (const d of shown) {
    const key = d.categoryName ?? "No category";
    groups.set(key, [...(groups.get(key) ?? []), d]);
  }

  return (
    <>
      <input
        type="search"
        placeholder="Search dishes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="min-h-12 w-full rounded-xl border border-line bg-white px-4 text-base"
      />
      {[...groups].map(([category, items]) => (
        <section key={category} className="mt-5">
          <h2 className="font-display text-lg font-bold text-brand">
            {category}
          </h2>
          <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl bg-paper shadow-soft">
            {items.map((dish) => (
              <li key={dish.id}>
                <DishRow dish={dish} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {shown.length === 0 && (
        <p className="mt-8 text-center text-muted">No dishes found.</p>
      )}
    </>
  );
}

function DishRow({ dish }: { dish: AdminDish }) {
  const [pending, startTransition] = useTransition();
  const [available, setAvailable] = useOptimistic(dish.isAvailable);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      {dish.imageUrl && (
        <DishImage
          src={dish.imageUrl}
          alt=""
          sizes="48px"
          className="size-12 shrink-0 rounded-lg"
        />
      )}
      <Link
        href={`/admin/menu/${dish.id}`}
        className={`min-w-0 flex-1 rounded-lg ${available ? "" : "opacity-60"}`}
      >
        <span className="block font-semibold text-ink">{dish.name}</span>
        <span className="block text-sm text-muted">
          {dish.price === null ? "No price yet" : formatGHS(dish.price)}
          {!available && " · Sold out"}
        </span>
        {error && (
          <span className="block text-sm font-semibold text-accent-text">
            {error}
          </span>
        )}
      </Link>
      <Toggle
        checked={available}
        label={`${dish.name} available today`}
        pending={pending}
        onChange={(next) =>
          startTransition(async () => {
            setError(null);
            setAvailable(next);
            const result = await setDishAvailable(dish.id, next);
            if (result.error) setError(result.error);
          })
        }
      />
    </div>
  );
}
