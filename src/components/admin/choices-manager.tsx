"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  addOption,
  createGroup,
  deleteOption,
  saveOption,
  setGroupDishes,
  setOptionAvailable,
  updateGroup,
  type ActionResult,
} from "@/app/admin/actions";
import { Toggle } from "@/components/admin/toggle";
import type { AdminOptionGroup } from "@/lib/admin-menu";

type Dish = { id: string; name: string; category: string | null };

function useAction() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const run = (fn: () => Promise<ActionResult>, after?: () => void) =>
    startTransition(async () => {
      setError(null);
      const result = await fn();
      if (result.error) setError(result.error);
      else after?.();
    });
  return { pending, error, run };
}

export function ChoicesManager({
  groups,
  dishes,
}: {
  groups: AdminOptionGroup[];
  dishes: Dish[];
}) {
  const [name, setName] = useState("");
  const { pending, error, run } = useAction();

  return (
    <div className="grid gap-4">
      {groups.map((g) => (
        <GroupCard key={g.id} group={g} dishes={dishes} />
      ))}

      <form
        className="rounded-2xl border-2 border-dashed border-brand/20 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => createGroup(name),
            () => setName(""),
          );
        }}
      >
        <label className="grid gap-1">
          <span className="font-semibold text-ink">Add a new choice</span>
          <span className="text-sm text-muted">
            For example &quot;Drink size&quot; or &quot;Pepper level&quot;.
          </span>
          <div className="mt-1 flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="min-h-11 w-full min-w-0 rounded-xl border border-brand/20 bg-white px-3"
            />
            <button
              type="submit"
              disabled={pending || !name.trim()}
              className="min-h-11 rounded-xl bg-brand px-4 font-semibold text-white disabled:bg-muted/30"
            >
              Add
            </button>
          </div>
        </label>
        {error && (
          <p className="mt-2 text-sm font-semibold text-accent-text">{error}</p>
        )}
      </form>
    </div>
  );
}

function GroupCard({
  group,
  dishes,
}: {
  group: AdminOptionGroup;
  dishes: Dish[];
}) {
  const [newOption, setNewOption] = useState("");
  const [required, setRequired] = useOptimistic(group.isRequired);
  const [inBulk, setInBulk] = useOptimistic(group.showInBulk);
  const { pending, error, run } = useAction();

  return (
    <section
      className={`rounded-2xl bg-white p-4 shadow-sm ${pending ? "opacity-70" : ""}`}
    >
      <div className="flex items-center gap-2">
        <h2 className="flex-1 font-display text-lg font-bold text-brand">
          {group.name}
        </h2>
        <button
          type="button"
          onClick={() => {
            const next = window.prompt("Rename this choice", group.name);
            if (next && next !== group.name)
              run(() => updateGroup(group.id, { name: next }));
          }}
          className="min-h-11 px-2 text-sm font-semibold text-brand"
        >
          Rename
        </button>
      </div>

      <div className="mt-1 grid gap-1 text-sm">
        <label className="flex min-h-11 items-center justify-between gap-3">
          <span>Customer must pick one</span>
          <Toggle
            checked={required}
            label="Customer must pick one"
            onChange={(next) =>
              run(async () => {
                setRequired(next);
                return updateGroup(group.id, { isRequired: next });
              })
            }
          />
        </label>
        <label className="flex min-h-11 items-center justify-between gap-3">
          <span>Ask on bulk orders</span>
          <Toggle
            checked={inBulk}
            label="Ask on bulk orders"
            onChange={(next) =>
              run(async () => {
                setInBulk(next);
                return updateGroup(group.id, { showInBulk: next });
              })
            }
          />
        </label>
      </div>

      <ul className="mt-2 divide-y divide-cream-dark border-y border-cream-dark">
        {group.options.map((o) => (
          <li key={o.id}>
            <OptionRow option={o} />
          </li>
        ))}
      </ul>

      <form
        className="mt-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => addOption(group.id, newOption),
            () => setNewOption(""),
          );
        }}
      >
        <input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          placeholder={`Add to ${group.name.toLowerCase()}`}
          aria-label={`New option for ${group.name}`}
          className="min-h-11 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3"
        />
        <button
          type="submit"
          disabled={pending || !newOption.trim()}
          className="min-h-11 rounded-xl bg-brand px-4 text-sm font-semibold text-white disabled:bg-muted/30"
        >
          Add
        </button>
      </form>

      <DishPicker group={group} dishes={dishes} />
      {error && (
        <p className="mt-2 text-sm font-semibold text-accent-text">{error}</p>
      )}
    </section>
  );
}

function OptionRow({
  option,
}: {
  option: AdminOptionGroup["options"][number];
}) {
  const [available, setAvailable] = useOptimistic(option.isAvailable);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(option.name);
  const [price, setPrice] = useState(
    option.priceDelta ? String(option.priceDelta) : "",
  );
  const { pending, error, run } = useAction();

  if (editing) {
    return (
      <form
        className="grid gap-2 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          run(
            () => saveOption(option.id, name, price),
            () => setEditing(false),
          );
        }}
      >
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Name"
            className="min-h-11 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            inputMode="decimal"
            placeholder="+ GHS 0"
            aria-label="Extra price in GHS"
            className="min-h-11 w-24 min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 flex-1 rounded-xl bg-brand text-sm font-semibold text-white"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete ${option.name}?`))
                run(() => deleteOption(option.id));
            }}
            className="min-h-11 rounded-xl px-3 text-sm font-semibold text-accent-text"
          >
            Delete
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="min-h-11 rounded-xl px-3 text-sm font-semibold text-muted"
          >
            Close
          </button>
        </div>
        {error && (
          <p className="text-sm font-semibold text-accent-text">{error}</p>
        )}
      </form>
    );
  }

  return (
    <div className="flex min-h-12 items-center gap-3 py-1">
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="flex-1 text-left"
      >
        <span className={available ? "text-ink" : "text-muted line-through"}>
          {option.name}
        </span>
        {option.priceDelta > 0 && (
          <span className="text-sm text-muted">
            {" "}
            +GHS {option.priceDelta.toFixed(2)}
          </span>
        )}
      </button>
      <Toggle
        checked={available}
        label={`${option.name} available`}
        pending={pending}
        onChange={(next) =>
          run(async () => {
            setAvailable(next);
            return setOptionAvailable(option.id, next);
          })
        }
      />
    </div>
  );
}

function DishPicker({
  group,
  dishes,
}: {
  group: AdminOptionGroup;
  dishes: Dish[];
}) {
  const [selected, setSelected] = useState<string[]>(group.dishIds);
  const { pending, error, run } = useAction();
  const dirty =
    selected.length !== group.dishIds.length ||
    selected.some((id) => !group.dishIds.includes(id));
  const used = dishes
    .filter((d) => group.dishIds.includes(d.id))
    .map((d) => d.name);

  return (
    <details className="mt-3 rounded-xl bg-cream/50 p-3">
      <summary className="cursor-pointer text-sm font-semibold text-ink">
        Used on {group.dishIds.length}{" "}
        {group.dishIds.length === 1 ? "dish" : "dishes"}
        {used.length > 0 && (
          <span className="block font-normal text-muted">
            {used.join(", ")}
          </span>
        )}
      </summary>
      <ul className="mt-2 grid gap-1">
        {dishes.map((d) => (
          <li key={d.id}>
            <label className="flex min-h-11 items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(d.id)}
                onChange={(e) =>
                  setSelected((s) =>
                    e.target.checked
                      ? [...s, d.id]
                      : s.filter((x) => x !== d.id),
                  )
                }
                className="size-5 accent-brand"
              />
              <span>
                {d.name}
                {d.category && (
                  <span className="text-sm text-muted"> · {d.category}</span>
                )}
              </span>
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={!dirty || pending}
        onClick={() => run(() => setGroupDishes(group.id, selected))}
        className="mt-2 min-h-11 w-full rounded-xl bg-brand text-sm font-semibold text-white disabled:bg-muted/30"
      >
        Save dishes
      </button>
      {error && (
        <p className="mt-2 text-sm font-semibold text-accent-text">{error}</p>
      )}
    </details>
  );
}
