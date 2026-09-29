"use client";

import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { setBulkDetails, setBulkEnabled } from "@/app/admin/actions";
import { Toggle } from "@/components/admin/toggle";
import { DishImage } from "@/components/dish-image";
import type { AdminDish } from "@/lib/admin-menu";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "on", label: "On" },
  { key: "off", label: "Off" },
] as const;

export function BulkManager({ dishes }: { dishes: AdminDish[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["key"]>("all");
  const q = query.trim().toLowerCase();
  const shown = dishes.filter(
    (d) =>
      (!q || d.name.toLowerCase().includes(q)) &&
      (filter === "all" || (filter === "on") === d.bulkEnabled),
  );

  return (
    <>
      <input
        type="search"
        placeholder="Search dishes"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="min-h-12 w-full rounded-xl border border-brand/20 bg-white px-4 text-base"
      />
      <div className="mt-3 flex gap-2" role="group" aria-label="Filter">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            aria-pressed={filter === f.key}
            onClick={() => setFilter(f.key)}
            className={`min-h-11 rounded-full px-4 text-sm font-semibold ${
              filter === f.key
                ? "bg-brand text-white"
                : "bg-white text-brand shadow-sm"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <ul className="mt-3 grid gap-3">
        {shown.map((dish) => (
          <li key={dish.id}>
            <BulkRow dish={dish} />
          </li>
        ))}
      </ul>
      {shown.length === 0 && (
        <p className="mt-8 text-center text-muted">No dishes found.</p>
      )}
      <datalist id="bulk-unit-options">
        {["bowl", "tray", "pack", "cooler", "pot"].map((u) => (
          <option key={u} value={u} />
        ))}
      </datalist>
    </>
  );
}

function BulkRow({ dish }: { dish: AdminDish }) {
  const [price, setPrice] = useState(dish.bulkPrice?.toString() ?? "");
  const [unit, setUnit] = useState(dish.bulkUnit ?? "bowl");
  const [enabled, setEnabled] = useOptimistic(dish.bulkEnabled);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const savedPrice = dish.bulkPrice?.toString() ?? "";
  const savedUnit = dish.bulkUnit ?? "";
  const dirty = price !== savedPrice || unit !== savedUnit;
  const canEnable = Number(savedPrice) > 0 && savedUnit !== "" && !dirty;

  const run = (fn: () => Promise<{ error?: string }>) =>
    startTransition(async () => {
      setError(null);
      const result = await fn();
      if (result.error) setError(result.error);
    });

  return (
    <div
      className={`rounded-2xl bg-white p-3 shadow-sm ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-3">
        <DishImage
          src={dish.imageUrl}
          alt=""
          sizes="48px"
          className="size-12 shrink-0 rounded-lg"
        />
        <Link href={`/admin/menu/${dish.id}`} className="min-w-0 flex-1">
          <span className="block font-semibold text-ink">{dish.name}</span>
          <span className="block text-xs text-muted">
            {dish.bulkOnly ? "Bulk only" : (dish.categoryName ?? "")}
          </span>
        </Link>
        <Toggle
          checked={enabled}
          label={`${dish.name} available for bulk`}
          disabled={!canEnable && !enabled}
          pending={pending}
          onChange={(next) =>
            run(async () => {
              setEnabled(next);
              return setBulkEnabled(dish.id, next);
            })
          }
        />
      </div>
      <form
        className="mt-3 flex items-end gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => setBulkDetails(dish.id, price, unit));
        }}
      >
        <label className="grid flex-1 gap-1">
          <span className="text-xs font-medium text-muted">
            Bulk price (GHS)
          </span>
          <input
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Not set"
            className="min-h-11 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3"
          />
        </label>
        <label className="grid w-28 gap-1">
          <span className="text-xs font-medium text-muted">Per</span>
          <input
            list="bulk-unit-options"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="min-h-11 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3"
          />
        </label>
        <button
          type="submit"
          disabled={!dirty || pending}
          className="min-h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:bg-muted/30"
        >
          Save
        </button>
      </form>
      {error && (
        <p className="mt-2 text-sm font-semibold text-accent-text">{error}</p>
      )}
    </div>
  );
}
