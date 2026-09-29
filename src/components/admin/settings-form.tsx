"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import { displayPhone } from "@/lib/format";
import type { KitchenInfo } from "@/lib/menu";

type Row = { id: number; days: string; hours: string };

export function SettingsForm({ kitchen }: { kitchen: KitchenInfo }) {
  const router = useRouter();
  const [pending, startSave] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const [rows, setRows] = useState<Row[]>(() =>
    (kitchen.openingHours?.length
      ? kitchen.openingHours
      : [{ days: "", hours: "" }]
    ).map((r, i) => ({ id: i, ...r })),
  );

  // Submitted by hand so a failed save keeps what the owner typed.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startSave(async () => {
      setMessage(null);
      const result = await saveSettings(data);
      if (result.error) setMessage({ ok: false, text: result.error });
      else {
        setMessage({ ok: true, text: "Settings saved." });
        router.refresh();
      }
    });
  }

  const updateRow = (id: number, field: "days" | "hours", value: string) =>
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid gap-4">
      <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-ink">Opening hours</h2>
        {rows.map((row) => (
          <div key={row.id} className="flex items-end gap-2">
            <Field label="Days">
              <input
                name="hoursDays"
                value={row.days}
                onChange={(e) => updateRow(row.id, "days", e.target.value)}
                placeholder="Mon - Sat"
                className={inputClass}
              />
            </Field>
            <Field label="Hours">
              <input
                name="hoursTimes"
                value={row.hours}
                onChange={(e) => updateRow(row.id, "hours", e.target.value)}
                placeholder="9am - 9pm"
                className={inputClass}
              />
            </Field>
            <button
              type="button"
              aria-label="Remove these hours"
              onClick={() => setRows((rs) => rs.filter((r) => r.id !== row.id))}
              className="grid size-12 shrink-0 place-items-center rounded-xl text-xl text-muted"
            >
              ×
            </button>
          </div>
        ))}
        {rows.length < 7 && (
          <button
            type="button"
            onClick={() =>
              setRows((rs) => [
                ...rs,
                {
                  id: Math.max(-1, ...rs.map((r) => r.id)) + 1,
                  days: "",
                  hours: "",
                },
              ])
            }
            className="min-h-11 justify-self-start rounded-full px-1 text-sm font-semibold text-brand"
          >
            + Add hours
          </button>
        )}
      </section>

      <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-ink">Contact</h2>
        <Field label="WhatsApp number (orders and payment)">
          <input
            name="whatsapp"
            type="tel"
            inputMode="tel"
            required
            defaultValue={displayPhone(kitchen.whatsapp)}
            className={inputClass}
          />
        </Field>
        <Field label="Phone number for calls">
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            required
            defaultValue={displayPhone(kitchen.phone)}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-ink">Bulk orders</h2>
        <Field label="Notice needed (hours)">
          <input
            name="bulkLeadHours"
            inputMode="numeric"
            required
            defaultValue={kitchen.bulkLeadHours}
            className={inputClass}
          />
        </Field>
      </section>

      <section className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-ink">Intro page</h2>
        <Field label="Our story">
          <textarea
            name="story"
            rows={4}
            defaultValue={kitchen.story ?? ""}
            placeholder="A few lines about Kelly's Eatery"
            className={`${inputClass} py-2`}
          />
        </Field>
      </section>

      {message && (
        <p
          role={message.ok ? "status" : "alert"}
          className={`rounded-xl p-3 text-sm font-semibold ${
            message.ok ? "bg-brand/10 text-brand" : "bg-accent/20 text-ink"
          }`}
        >
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-14 rounded-2xl bg-brand font-semibold text-white disabled:bg-muted/40"
      >
        {pending ? "Saving..." : "Save settings"}
      </button>
    </form>
  );
}

const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border border-brand/20 bg-cream/40 px-3 text-base";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid min-w-0 flex-1 gap-1">
      <span className="text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
