"use client";

import { MinusIcon, PlusIcon } from "@/components/icons";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  label: string;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-brand/20 bg-white">
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={`Fewer ${label}`}
        className="grid size-11 place-items-center rounded-full text-brand disabled:text-muted/40"
      >
        <MinusIcon className="size-4" />
      </button>
      <span
        className="min-w-8 text-center font-semibold tabular-nums"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        aria-label={`More ${label}`}
        className="grid size-11 place-items-center rounded-full text-brand"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
