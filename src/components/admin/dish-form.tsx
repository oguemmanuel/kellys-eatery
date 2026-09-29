"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { archiveDish, createCategory, saveDish } from "@/app/admin/actions";
import { BackIcon } from "@/components/icons";
import type { AdminDish, AdminOptionGroup } from "@/lib/admin-menu";

const UNITS = ["bowl", "tray", "pack", "cooler", "pot"];
// Phone photos are shrunk in the browser first so uploads stay small on mobile data.
const MAX_UPLOAD_SIDE = 1600;

export function DishForm({
  dish,
  categories,
  groups,
  isOwner,
  bulkOnly = false,
}: {
  dish?: AdminDish;
  categories: { id: string; name: string }[];
  groups: AdminOptionGroup[];
  isOwner: boolean;
  bulkOnly?: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startSave] = useTransition();
  const [preview, setPreview] = useState<string | null>(dish?.imageUrl ?? null);
  const [archiving, startArchive] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const onBulkList = dish ? dish.bulkOnly : bulkOnly;
  const backHref = onBulkList ? "/admin/bulk" : "/admin/menu";

  // Submitted by hand rather than through `action`, so a failed save keeps
  // what the owner typed instead of resetting the form.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startSave(async () => {
      setError(null);
      const result = await saveDish({}, data);
      if (result.error) setError(result.error);
      else router.push(backHref);
    });
  }

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const small = await shrink(file);
    const transfer = new DataTransfer();
    transfer.items.add(small);
    e.target.files = transfer.files;
    setPreview(URL.createObjectURL(small));
  }

  async function addCategory() {
    const name = window.prompt("New category name");
    if (!name) return;
    const result = await createCategory(name);
    if (result.error) window.alert(result.error);
    else router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 pb-6">
      <header className="flex items-center gap-3">
        <Link
          href={backHref}
          aria-label="Back"
          className="grid size-11 place-items-center rounded-full bg-white text-brand shadow-sm"
        >
          <BackIcon className="size-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-brand">
          {dish ? "Edit dish" : onBulkList ? "Add extra bulk dish" : "Add dish"}
        </h1>
      </header>

      {dish && <input type="hidden" name="id" value={dish.id} />}

      <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-cream-dark text-sm font-semibold text-brand"
          >
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            ) : (
              "Add photo"
            )}
          </button>
          <div className="text-sm text-muted">
            <p className="font-semibold text-ink">Photo</p>
            <p>Tap to {preview ? "change" : "add"} a photo of the dish.</p>
          </div>
          <input
            ref={fileInput}
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImage}
            className="hidden"
          />
        </div>

        <Field label="Name">
          <input
            name="name"
            required
            defaultValue={dish?.name}
            className={inputClass}
          />
        </Field>
        <Field label="Description" optional>
          <textarea
            name="description"
            rows={2}
            defaultValue={dish?.description ?? ""}
            className={`${inputClass} py-2`}
          />
        </Field>
        <Field label="Category">
          <div className="flex gap-2">
            <select
              name="categoryId"
              defaultValue={dish?.categoryId ?? categories[0]?.id ?? ""}
              className={inputClass}
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={addCategory}
              className="shrink-0 rounded-xl px-3 text-sm font-semibold text-brand"
            >
              New
            </button>
          </div>
        </Field>
      </section>

      <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-ink">Regular menu</h2>
        <Check
          name="showOnMenu"
          label="Show on the regular menu"
          defaultChecked={dish ? !dish.bulkOnly : !bulkOnly}
        />
        <Field label="Price (GHS)" optional={onBulkList}>
          <input
            name="price"
            inputMode="decimal"
            defaultValue={dish?.price ?? ""}
            placeholder="e.g. 100"
            className={inputClass}
          />
        </Field>
        <Check
          name="isAvailable"
          label="Available today"
          defaultChecked={dish?.isAvailable ?? true}
        />
        <Check
          name="isExtra"
          label="Offer as an extra on other dishes"
          defaultChecked={dish?.isExtra ?? false}
        />
      </section>

      {groups.length > 0 && (
        <section className="grid gap-2 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-ink">
            Choices the customer must make
          </h2>
          {groups.map((g) => (
            <Check
              key={g.id}
              name="groupIds"
              value={g.id}
              label={`${g.name} (${g.options.map((o) => o.name).join(", ")})`}
              defaultChecked={dish?.groupIds.includes(g.id) ?? false}
            />
          ))}
        </section>
      )}

      {isOwner && (
        <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-ink">Bulk orders</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bulk price (GHS)">
              <input
                name="bulkPrice"
                inputMode="decimal"
                defaultValue={dish?.bulkPrice ?? ""}
                placeholder="e.g. 450"
                className={inputClass}
              />
            </Field>
            <Field label="Per">
              <input
                name="bulkUnit"
                list="bulk-units"
                defaultValue={dish?.bulkUnit ?? "bowl"}
                className={inputClass}
              />
              <datalist id="bulk-units">
                {UNITS.map((u) => (
                  <option key={u} value={u} />
                ))}
              </datalist>
            </Field>
          </div>
          <Check
            name="bulkEnabled"
            label="Available for bulk"
            defaultChecked={dish?.bulkEnabled ?? bulkOnly}
          />
        </section>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-accent/20 p-3 text-sm font-semibold text-ink"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-14 rounded-2xl bg-brand font-semibold text-white disabled:bg-muted/40"
      >
        {pending ? "Saving..." : "Save dish"}
      </button>

      {dish && (
        <button
          type="button"
          disabled={archiving}
          onClick={() => {
            if (!window.confirm(`Remove ${dish.name} from the menu?`)) return;
            startArchive(async () => {
              await archiveDish(dish.id);
              router.push(backHref);
            });
          }}
          className="min-h-12 rounded-2xl font-semibold text-accent-text"
        >
          Remove dish
        </button>
      )}
    </form>
  );
}

const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3 text-base";

function Field({
  label,
  optional,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1">
      <span className="text-sm font-medium text-ink">
        {label}
        {optional && (
          <span className="font-normal text-muted"> (optional)</span>
        )}
      </span>
      {children}
    </label>
  );
}

function Check({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-h-11 items-center gap-3">
      <input
        type="checkbox"
        {...props}
        className="size-5 shrink-0 accent-brand"
      />
      <span className="text-ink">{label}</span>
    </label>
  );
}

async function shrink(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(
      1,
      MAX_UPLOAD_SIDE / Math.max(bitmap.width, bitmap.height),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas
      .getContext("2d")
      ?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.85),
    );
    return blob ? new File([blob], "dish.jpg", { type: "image/jpeg" }) : file;
  } catch {
    // Older browsers: send the original and let the server shrink it.
    return file;
  }
}
