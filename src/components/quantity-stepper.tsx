"use client";

import { useState } from "react";
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
  // Counts taps so the number only bumps when it changes, not on page load.
  const [taps, setTaps] = useState(0);
  const step = (next: number) => {
    setTaps((t) => t + 1);
    onChange(next);
  };

  return (
    <div className="inline-flex items-center rounded-full bg-paper ring-1 ring-line">
      <button
        type="button"
        onClick={() => step(value - 1)}
        disabled={value <= min}
        aria-label={`Fewer ${label}`}
        className="press grid size-11 place-items-center rounded-full text-brand active:bg-brand-light disabled:text-muted/40"
      >
        <MinusIcon className="size-4" />
      </button>
      <span
        className="min-w-8 text-center font-semibold tabular-nums"
        aria-live="polite"
      >
        <span
          key={taps}
          className={`inline-block ${taps > 0 ? "animate-bump" : ""}`}
        >
          {value}
        </span>
      </span>
      <button
        type="button"
        onClick={() => step(value + 1)}
        aria-label={`More ${label}`}
        className="press grid size-11 place-items-center rounded-full text-brand active:bg-brand-light"
      >
        <PlusIcon className="size-4" />
      </button>
    </div>
  );
}
